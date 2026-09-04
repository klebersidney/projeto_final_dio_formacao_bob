/**
 * http-server.ts
 * ==============
 * Servidor HTTP alternativo que expõe o MCP via SSE (Server-Sent Events)
 * para conexões remotas, HTTPS reverso, SSO e integrações via API REST.
 *
 * Funcionalidades:
 *   - Transporte MCP/SSE em GET /sse
 *   - Endpoint de saúde GET /health
 *   - Autenticação via Bearer Token (variável de ambiente MCP_API_KEY)
 *   - Cabeçalhos CORS configuráveis via CORS_ORIGIN
 *   - Pronto para proxy reverso (Nginx, Caddy, Traefik) com HTTPS
 *   - Base para integração SSO: valide o Bearer Token contra seu IdP
 *
 * Execute com:
 *   MCP_API_KEY=seu_token node build/http-server.js
 *
 * Variáveis de ambiente:
 *   PORT            - Porta HTTP (padrão: 3000)
 *   MCP_API_KEY     - Token de autenticação Bearer (obrigatório em produção)
 *   CORS_ORIGIN     - Origem permitida pelo CORS (padrão: *)
 *   TRILHAS_JSON_PATH - Caminho absoluto para trilhas_dio.json (opcional)
 */

import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";

import {
  listTrilhas,
  findTrilhaById,
  findTrilhasByNivel,
  findTrilhasByTecnologia,
  getMeta,
} from "./data-loader.js";

import {
  TrilhaNotFoundError,
  formatarTrilha,
  formatarDesafio,
  gerarCertificado,
} from "./core.js";

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------

const PORT = parseInt(process.env["PORT"] ?? "3000", 10);
const API_KEY = process.env["MCP_API_KEY"] ?? "";
const CORS_ORIGIN = process.env["CORS_ORIGIN"] ?? "*";

// ---------------------------------------------------------------------------
// Factory: cria e registra um McpServer com todas as ferramentas
// ---------------------------------------------------------------------------

function createMcpServer(): McpServer {
  const mcpServer = new McpServer({
    name: "geo-explorer-dio",
    version: "1.0.0",
  });

  // -- listar_trilhas --
  mcpServer.tool(
    "listar_trilhas",
    "Lista todas as trilhas DIO disponíveis com resumo.",
    {
      nivel: z.string().optional().describe("Filtrar por nível"),
      tecnologia: z.string().optional().describe("Filtrar por tecnologia"),
    },
    async ({ nivel, tecnologia }) => {
      try {
        let trilhas = listTrilhas();
        if (nivel) trilhas = findTrilhasByNivel(nivel);
        if (tecnologia) trilhas = findTrilhasByTecnologia(tecnologia);

        const linhas = trilhas.map(
          (t) =>
            `**[${t.id}]** ${t.nome}\n  ↳ ${t.tecnologia} | ${t.nivel} | ${t.xp_total} XP`
        );
        const meta = getMeta();
        return {
          content: [
            {
              type: "text",
              text:
                `## 📚 Trilhas DIO – ${trilhas.length} resultado(s)\n\n` +
                linhas.join("\n\n") +
                `\n\n---\n_Atualização: ${meta.ultima_atualizacao}_`,
            },
          ],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `Erro: ${(err as Error).message}` }], isError: true };
      }
    }
  );

  // -- ver_trilha --
  mcpServer.tool(
    "ver_trilha",
    "Exibe detalhes completos de uma trilha DIO pelo id.",
    { id: z.number().int().describe("ID da trilha") },
    async ({ id }) => {
      try {
        const trilha = findTrilhaById(id);
        if (!trilha) throw new TrilhaNotFoundError(`Trilha ${id} não encontrada.`);
        return { content: [{ type: "text", text: formatarTrilha(trilha) }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Erro: ${(err as Error).message}` }], isError: true };
      }
    }
  );

  // -- gerar_desafio --
  mcpServer.tool(
    "gerar_desafio",
    "Gera desafio de código para tecnologia e nível informados.",
    {
      tecnologia: z.enum(["java", "python", "javascript"]),
      nivel: z.enum(["iniciante", "intermediario", "avancado"]),
    },
    async ({ tecnologia, nivel }) => {
      try {
        return { content: [{ type: "text", text: formatarDesafio(tecnologia, nivel) }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Erro: ${(err as Error).message}` }], isError: true };
      }
    }
  );

  // -- gerar_certificado --
  mcpServer.tool(
    "gerar_certificado",
    "Gera certificado fictício de conclusão de trilha DIO.",
    {
      nome: z.string().min(2).describe("Nome do aluno"),
      id_trilha: z.number().int().describe("ID da trilha"),
    },
    async ({ nome, id_trilha }) => {
      try {
        const trilha = findTrilhaById(id_trilha);
        if (!trilha) throw new TrilhaNotFoundError(`Trilha ${id_trilha} não encontrada.`);
        return { content: [{ type: "text", text: gerarCertificado(nome, trilha) }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Erro: ${(err as Error).message}` }], isError: true };
      }
    }
  );

  // -- estatisticas --
  mcpServer.tool(
    "estatisticas",
    "Exibe estatísticas gerais da plataforma DIO.",
    {},
    async () => {
      try {
        const meta = getMeta();
        const trilhas = listTrilhas();
        const porNivel: Record<string, number> = {};
        for (const t of trilhas) {
          porNivel[t.nivel] = (porNivel[t.nivel] ?? 0) + 1;
        }
        const nivelRows = Object.entries(porNivel)
          .map(([n, q]) => `| ${n} | ${q} |`)
          .join("\n");
        return {
          content: [
            {
              type: "text",
              text: `## 📊 Estatísticas DIO\n\n| Indicador | Valor |\n|---|---|\n| Total de Trilhas | ${meta.total_trilhas} |\n| XP Total | ${meta.xp_total_plataforma} |\n| Versão | ${meta.versao} |\n\n### Por Nível\n| Nível | Qtd |\n|---|---|\n${nivelRows}`,
            },
          ],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `Erro: ${(err as Error).message}` }], isError: true };
      }
    }
  );

  return mcpServer;
}

// ---------------------------------------------------------------------------
// Middleware de autenticação Bearer Token / SSO
// ---------------------------------------------------------------------------

function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Se nenhuma API_KEY configurada, desabilitar autenticação (modo dev)
  if (!API_KEY) {
    next();
    return;
  }

  // Rota de saúde é pública
  if (req.path === "/health") {
    next();
    return;
  }

  const authHeader = req.headers["authorization"] ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (token !== API_KEY) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Forneça o token via cabeçalho: Authorization: Bearer <MCP_API_KEY>",
    });
    return;
  }

  next();
}

// ---------------------------------------------------------------------------
// App Express
// ---------------------------------------------------------------------------

const app = express();

app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "mcp-session-id"],
    exposedHeaders: ["mcp-session-id"],
  })
);

app.use(express.json());
app.use(authMiddleware);

// Mapa de sessões SSE ativas
const sessions = new Map<string, SSEServerTransport>();

// ---------------------------------------------------------------------------
// GET /health — verificação de saúde (pública)
// ---------------------------------------------------------------------------

app.get("/health", (_req, res) => {
  const meta = getMeta();
  res.json({
    status: "ok",
    server: "geo-explorer-dio",
    version: "1.0.0",
    trilhas_carregadas: listTrilhas().length,
    dados_versao: meta.versao,
    dados_atualizacao: meta.ultima_atualizacao,
    sessoes_ativas: sessions.size,
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// GET /sse — canal SSE (MCP sobre HTTP)
// ---------------------------------------------------------------------------

app.get("/sse", async (req, res) => {
  const mcpServer = createMcpServer();
  const transport = new SSEServerTransport("/messages", res);

  const sessionId = transport.sessionId;
  sessions.set(sessionId, transport);

  res.on("close", () => {
    sessions.delete(sessionId);
    console.error(`[SSE] Sessão encerrada: ${sessionId} | Ativas: ${sessions.size}`);
  });

  console.error(`[SSE] Nova sessão: ${sessionId} | IP: ${req.ip} | Ativas: ${sessions.size}`);
  await mcpServer.connect(transport);
});

// ---------------------------------------------------------------------------
// POST /messages — canal de mensagens MCP (requisições do cliente)
// ---------------------------------------------------------------------------

app.post("/messages", async (req, res) => {
  const sessionId = req.query["sessionId"] as string | undefined;

  if (!sessionId || !sessions.has(sessionId)) {
    res.status(400).json({ error: "Session not found", sessionId });
    return;
  }

  const transport = sessions.get(sessionId)!;
  await transport.handlePostMessage(req, res);
});

// ---------------------------------------------------------------------------
// GET / — informações sobre a API
// ---------------------------------------------------------------------------

app.get("/", (_req, res) => {
  res.json({
    nome: "Geo Explorer DIO – MCP Server",
    descricao: "Servidor MCP com trilhas, desafios e certificados DIO",
    versao: "1.0.0",
    endpoints: {
      saude: "GET /health",
      sse: "GET /sse  (MCP via Server-Sent Events)",
      mensagens: "POST /messages?sessionId=<id>",
    },
    autenticacao: API_KEY
      ? "Bearer Token obrigatório (cabeçalho Authorization)"
      : "Sem autenticação (modo desenvolvimento)",
    ferramentas: [
      "listar_trilhas",
      "ver_trilha",
      "gerar_desafio",
      "gerar_certificado",
      "estatisticas",
    ],
    documentacao: "https://github.com/seu-usuario/projeto_final_dio_formacao_bob/tree/main/mcp",
  });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.error(`
╔═══════════════════════════════════════════════════╗
║        Geo Explorer DIO – MCP HTTP Server         ║
╠═══════════════════════════════════════════════════╣
║  Porta  : ${String(PORT).padEnd(38)}║
║  SSE    : http://localhost:${PORT}/sse${" ".repeat(Math.max(0, 21 - String(PORT).length))}║
║  Saúde  : http://localhost:${PORT}/health${" ".repeat(Math.max(0, 18 - String(PORT).length))}║
║  Auth   : ${API_KEY ? "Bearer Token ✅" : "Desabilitada ⚠️  (defina MCP_API_KEY)"}${API_KEY ? " ".repeat(27) : " ".repeat(24)}║
╚═══════════════════════════════════════════════════╝
  `);
});
