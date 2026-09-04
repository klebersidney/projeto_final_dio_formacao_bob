#!/usr/bin/env node
/**
 * index.ts  –  MCP Server principal (transporte stdio)
 * =====================================================
 * Ponto de entrada padrão para Bob e outros clientes MCP.
 * Expõe as seguintes ferramentas:
 *
 *   listar_trilhas        – lista todas as trilhas disponíveis
 *   buscar_trilha         – busca trilha por id, nível ou tecnologia
 *   ver_trilha            – exibe detalhes completos de uma trilha
 *   gerar_desafio         – gera desafio de código para uma tecnologia/nível
 *   gerar_certificado     – emite certificado de conclusão
 *   estatisticas          – exibe estatísticas gerais da plataforma
 *
 * Execute com:
 *   node build/index.js
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
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
  gerarDesafio,
  formatarDesafio,
  gerarCertificado,
} from "./core.js";

// ---------------------------------------------------------------------------
// Instância do servidor
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: "geo-explorer-dio",
  version: "1.0.0",
});

// ---------------------------------------------------------------------------
// FERRAMENTA: listar_trilhas
// ---------------------------------------------------------------------------

server.tool(
  "listar_trilhas",
  "Lista todas as trilhas DIO disponíveis com resumo (id, nome, tecnologia, nível, XP).",
  {
    nivel: z
      .string()
      .optional()
      .describe("Filtrar por nível: Iniciante | Intermediário | Avançado"),
    tecnologia: z
      .string()
      .optional()
      .describe("Filtrar por tecnologia (busca parcial, ex: 'Python', 'Node')"),
  },
  async ({ nivel, tecnologia }) => {
    try {
      let trilhas = listTrilhas();

      if (nivel) {
        trilhas = findTrilhasByNivel(nivel);
      }
      if (tecnologia) {
        trilhas = findTrilhasByTecnologia(tecnologia);
      }

      if (trilhas.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `Nenhuma trilha encontrada com os filtros informados.`,
            },
          ],
        };
      }

      const linhas = trilhas.map(
        (t) =>
          `**[${t.id}]** ${t.nome}\n  ↳ Tecnologia: ${t.tecnologia} | Nível: ${t.nivel} | XP: ${t.xp_total} | Módulos: ${t.numero_modulos}`
      );

      const meta = getMeta();
      const cabecalho = `## 📚 Trilhas DIO – ${trilhas.length} resultado(s)\n\n`;
      const rodape = `\n---\n_Última atualização: ${meta.ultima_atualizacao} | Fonte: ${meta.fonte}_`;

      return {
        content: [
          {
            type: "text",
            text: cabecalho + linhas.join("\n\n") + rodape,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Erro: ${(err as Error).message}` }],
        isError: true,
      };
    }
  }
);

// ---------------------------------------------------------------------------
// FERRAMENTA: buscar_trilha
// ---------------------------------------------------------------------------

server.tool(
  "buscar_trilha",
  "Busca trilhas por id, nível ou tecnologia e retorna lista resumida.",
  {
    id: z.number().int().optional().describe("ID exato da trilha"),
    nivel: z.string().optional().describe("Nível da trilha"),
    tecnologia: z.string().optional().describe("Palavra-chave da tecnologia"),
  },
  async ({ id, nivel, tecnologia }) => {
    try {
      if (id !== undefined) {
        const trilha = findTrilhaById(id);
        if (!trilha) {
          return {
            content: [{ type: "text", text: `Trilha com id ${id} não encontrada.` }],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: "text",
              text: `Trilha encontrada: **[${trilha.id}] ${trilha.nome}** (${trilha.nivel}) – use \`ver_trilha\` com id=${trilha.id} para detalhes completos.`,
            },
          ],
        };
      }

      let trilhas = listTrilhas();
      if (nivel) trilhas = findTrilhasByNivel(nivel);
      if (tecnologia) trilhas = findTrilhasByTecnologia(tecnologia);

      const resultados = trilhas
        .map((t) => `- **[${t.id}]** ${t.nome} — ${t.nivel}`)
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text:
              trilhas.length > 0
                ? `**${trilhas.length} trilha(s) encontrada(s):**\n\n${resultados}`
                : "Nenhuma trilha encontrada.",
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Erro: ${(err as Error).message}` }],
        isError: true,
      };
    }
  }
);

// ---------------------------------------------------------------------------
// FERRAMENTA: ver_trilha
// ---------------------------------------------------------------------------

server.tool(
  "ver_trilha",
  "Exibe detalhes completos de uma trilha DIO: descrição, badges, lives, promoções.",
  {
    id: z.number().int().describe("ID da trilha (use listar_trilhas para descobrir o id)"),
  },
  async ({ id }) => {
    try {
      const trilha = findTrilhaById(id);
      if (!trilha) {
        throw new TrilhaNotFoundError(`Trilha com id ${id} não encontrada.`);
      }
      const markdown = formatarTrilha(trilha);
      return { content: [{ type: "text", text: markdown }] };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Erro: ${(err as Error).message}` }],
        isError: true,
      };
    }
  }
);

// ---------------------------------------------------------------------------
// FERRAMENTA: gerar_desafio
// ---------------------------------------------------------------------------

server.tool(
  "gerar_desafio",
  "Gera um desafio de código prático para a tecnologia e nível informados.",
  {
    tecnologia: z
      .enum(["java", "python", "javascript"])
      .describe("Tecnologia do desafio: java | python | javascript"),
    nivel: z
      .enum(["iniciante", "intermediario", "avancado"])
      .describe("Nível de dificuldade: iniciante | intermediario | avancado"),
  },
  async ({ tecnologia, nivel }) => {
    try {
      const markdown = formatarDesafio(tecnologia, nivel);
      return { content: [{ type: "text", text: markdown }] };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Erro: ${(err as Error).message}` }],
        isError: true,
      };
    }
  }
);

// ---------------------------------------------------------------------------
// FERRAMENTA: gerar_certificado
// ---------------------------------------------------------------------------

server.tool(
  "gerar_certificado",
  "Gera um certificado fictício de conclusão de trilha DIO para o aluno informado.",
  {
    nome: z.string().min(2).describe("Nome completo do aluno"),
    id_trilha: z
      .number()
      .int()
      .describe("ID da trilha concluída (use listar_trilhas para obter o id)"),
  },
  async ({ nome, id_trilha }) => {
    try {
      const trilha = findTrilhaById(id_trilha);
      if (!trilha) {
        throw new TrilhaNotFoundError(`Trilha com id ${id_trilha} não encontrada.`);
      }
      const certificado = gerarCertificado(nome, trilha);
      return { content: [{ type: "text", text: certificado }] };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Erro: ${(err as Error).message}` }],
        isError: true,
      };
    }
  }
);

// ---------------------------------------------------------------------------
// FERRAMENTA: estatisticas
// ---------------------------------------------------------------------------

server.tool(
  "estatisticas",
  "Exibe estatísticas gerais da plataforma DIO: total de trilhas, XP, níveis, badges.",
  {},
  async () => {
    try {
      const meta = getMeta();
      const trilhas = listTrilhas();

      const porNivel: Record<string, number> = {};
      let totalXp = 0;
      let totalBadges = 0;
      let comPromocao = 0;
      let vitalicio = 0;

      for (const t of trilhas) {
        porNivel[t.nivel] = (porNivel[t.nivel] ?? 0) + 1;
        totalXp += t.xp_total;
        totalBadges += t.badges.length;
        if (t.promocoes) comPromocao++;
        if (t.vitalicio) vitalicio++;
      }

      const nivelRows = Object.entries(porNivel)
        .map(([nivel, qtd]) => `| ${nivel} | ${qtd} |`)
        .join("\n");

      const texto = `## 📊 Estatísticas da Plataforma DIO

| Indicador | Valor |
|-----------|-------|
| **Total de Trilhas** | ${meta.total_trilhas} |
| **XP Total da Plataforma** | ${meta.xp_total_plataforma.toLocaleString("pt-BR")} XP |
| **Total de Badges** | ${totalBadges} |
| **Trilhas com Promoção** | ${comPromocao} |
| **Trilhas com Acesso Vitalício** | ${vitalicio} |
| **Versão dos Dados** | ${meta.versao} |
| **Última Atualização** | ${meta.ultima_atualizacao} |

### Distribuição por Nível

| Nível | Quantidade |
|-------|-----------|
${nivelRows}

### Níveis Disponíveis
${meta.niveis_disponiveis.map((n) => `- ${n}`).join("\n")}

### Raridades de Badges
${meta.raridades_badges.map((r) => `- ${r}`).join("\n")}
`;

      return { content: [{ type: "text", text: texto }] };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Erro: ${(err as Error).message}` }],
        isError: true,
      };
    }
  }
);

// ---------------------------------------------------------------------------
// Inicialização
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("geo-explorer-dio MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
