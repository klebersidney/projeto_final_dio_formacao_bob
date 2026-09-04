/**
 * core.ts
 * =======
 * Lógica de negócio dos comandos /trilha, /desafio e /certificado.
 * Porta TypeScript da lógica equivalente em tests/core.py, adaptada
 * para trabalhar com a estrutura real do JSON (array de trilhas).
 */

import {
  listTrilhas,
  findTrilhaById,
  findTrilhasByNivel,
  findTrilhasByTecnologia,
  getMeta,
  type Trilha,
} from "./data-loader.js";

// ---------------------------------------------------------------------------
// Erros customizados
// ---------------------------------------------------------------------------

export class TrilhaNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TrilhaNotFoundError";
  }
}

// ---------------------------------------------------------------------------
// Banco de desafios por nível (compatível com core.py)
// ---------------------------------------------------------------------------

interface Desafio {
  titulo: string;
  descricao: string;
  requisitos: string[];
  entrada: string;
  saida: string;
  dicas: string[];
  tempo: number;
}

const DESAFIOS: Record<string, Record<string, Desafio>> = {
  java: {
    iniciante: {
      titulo: "Calculadora de IMC",
      descricao:
        "Crie um programa Java que leia peso e altura do usuário e calcule o IMC, exibindo a classificação.",
      requisitos: [
        "Ler peso (kg) e altura (m) via Scanner",
        "Calcular IMC = peso / (altura * altura)",
        "Exibir a classificação conforme tabela da OMS",
      ],
      entrada: "70.0 1.75",
      saida: "IMC: 22.86 – Peso Normal",
      dicas: [
        "Use double para precisão decimal",
        "Utilize if/else if para classificar o resultado",
      ],
      tempo: 15,
    },
    intermediario: {
      titulo: "Sistema de Estoque com ArrayList",
      descricao:
        "Implemente um CRUD básico de produtos usando ArrayList<Produto>.",
      requisitos: [
        "Criar classe Produto com id, nome e preco",
        "Implementar adicionar, listar, buscar por id e remover",
        "Tratar produto não encontrado com exceção customizada",
      ],
      entrada: "ADD Notebook 3500.00",
      saida: "Produto adicionado: Notebook (R$ 3500.00)",
      dicas: [
        "Use Stream API para buscar por id",
        "Prefira Optional<Produto> ao retornar resultados",
      ],
      tempo: 30,
    },
    avancado: {
      titulo: "Microsserviço de autenticação JWT com Spring Boot",
      descricao:
        "Desenvolva um endpoint REST de login que valide credenciais e retorne um token JWT assinado.",
      requisitos: [
        "Endpoint POST /auth/login recebe JSON {username, password}",
        "Validar credenciais em banco H2 via Spring Data JPA",
        "Retornar token JWT com expiração de 1 hora",
        "Implementar filtro de autenticação em rotas protegidas",
      ],
      entrada: '{"username":"user","password":"pass"}',
      saida: '{"token":"eyJhbGci..."}',
      dicas: [
        "Use io.jsonwebtoken (JJWT) para gerar o token",
        "Configure Spring Security para liberar /auth/login",
      ],
      tempo: 60,
    },
  },
  python: {
    iniciante: {
      titulo: "Calculadora de Média Escolar",
      descricao:
        "Crie um script Python que leia notas de um aluno e calcule a média ponderada.",
      requisitos: [
        "Ler lista de notas via input()",
        "Calcular média aritmética e ponderada",
        "Exibir situação: Aprovado, Recuperação ou Reprovado",
      ],
      entrada: "7.0 8.5 6.0",
      saida: "Média: 7.17 – Aprovado",
      dicas: [
        "Use list comprehension para converter entrada em floats",
        "A média ≥ 7 é Aprovado, entre 5 e 7 é Recuperação",
      ],
      tempo: 15,
    },
    intermediario: {
      titulo: "API REST com FastAPI",
      descricao:
        "Construa uma API REST simples para gerenciar uma lista de tarefas (to-do list).",
      requisitos: [
        "Endpoints GET /tasks, POST /tasks, DELETE /tasks/{id}",
        "Validação de dados com Pydantic",
        "Persistência em arquivo JSON",
      ],
      entrada: 'POST /tasks {"title": "Estudar Python"}',
      saida: '{"id": 1, "title": "Estudar Python", "done": false}',
      dicas: [
        "Use FastAPI com uvicorn",
        "Utilize BaseModel do Pydantic para schemas",
      ],
      tempo: 30,
    },
    avancado: {
      titulo: "Pipeline de ML com scikit-learn e MLflow",
      descricao:
        "Implemente um pipeline de machine learning com tracking de experimentos.",
      requisitos: [
        "Treinar modelo de classificação com scikit-learn",
        "Registrar métricas e artefatos com MLflow",
        "Servir o modelo via endpoint REST",
        "Implementar versionamento do modelo",
      ],
      entrada: "Dataset iris, 80/20 split",
      saida: "Accuracy: 0.97, F1: 0.97",
      dicas: [
        "Use Pipeline do sklearn para encadear etapas",
        "mlflow.autolog() facilita o rastreamento automático",
      ],
      tempo: 60,
    },
  },
  javascript: {
    iniciante: {
      titulo: "Conversor de Temperatura",
      descricao:
        "Crie uma função JavaScript que converta temperaturas entre Celsius, Fahrenheit e Kelvin.",
      requisitos: [
        "Função convert(value, from, to) genérica",
        "Suportar C↔F, C↔K e F↔K",
        "Validar entradas inválidas com throw",
      ],
      entrada: "convert(100, 'C', 'F')",
      saida: "212",
      dicas: [
        "Use um objeto de fórmulas de conversão",
        "Arrow functions deixam o código mais conciso",
      ],
      tempo: 15,
    },
    intermediario: {
      titulo: "SPA com Fetch API e DOM Manipulation",
      descricao:
        "Construa uma SPA que consome a API pública JSONPlaceholder e exibe posts paginados.",
      requisitos: [
        "Consumir GET https://jsonplaceholder.typicode.com/posts",
        "Renderizar lista com paginação (10 por página)",
        "Filtrar posts por título via campo de busca",
      ],
      entrada: "Busca: 'sunt'",
      saida: "Lista filtrada de posts contendo 'sunt'",
      dicas: [
        "Use async/await com fetch()",
        "Array.prototype.filter() para a busca local",
      ],
      tempo: 30,
    },
    avancado: {
      titulo: "Server-Sent Events em tempo real com Node.js",
      descricao:
        "Implemente um servidor Node.js que emite eventos SSE para múltiplos clientes.",
      requisitos: [
        "Endpoint GET /stream retorna SSE",
        "Suportar múltiplos clientes simultâneos",
        "Emitir evento de heartbeat a cada 30 s",
        "Cliente HTML consome e exibe os eventos",
      ],
      entrada: "GET /stream (3 clientes conectados)",
      saida: "data: {event: 'update', payload: {...}}",
      dicas: [
        "Set Content-Type: text/event-stream",
        "Use res.write() em loop com setInterval",
      ],
      tempo: 60,
    },
  },
};

// Normaliza acentos para comparação
function normalizeAccents(s: string): string {
  return s
    .toLowerCase()
    .replace(/[áàãâä]/g, "a")
    .replace(/[éèêë]/g, "e")
    .replace(/[íìîï]/g, "i")
    .replace(/[óòõôö]/g, "o")
    .replace(/[úùûü]/g, "u")
    .replace(/ç/g, "c");
}

// ---------------------------------------------------------------------------
// /trilha – formata plano de estudos a partir do JSON real
// ---------------------------------------------------------------------------

export function getTrilhaById(id: number): Trilha {
  const trilha = findTrilhaById(id);
  if (!trilha) {
    const ids = listTrilhas()
      .map((t) => `${t.id} – ${t.nome}`)
      .join(", ");
    throw new TrilhaNotFoundError(
      `Trilha com id ${id} não encontrada. Disponíveis: ${ids}`
    );
  }
  return trilha;
}

export function formatarTrilha(trilha: Trilha): string {
  const badges = trilha.badges
    .map((b) => `  ${b.icone} **${b.nome}** (${b.raridade})`)
    .join("\n");

  const lives =
    trilha.lives_ao_vivo.length > 0
      ? trilha.lives_ao_vivo
          .map((l) => `  - ${l.titulo} — ${l.data} (${l.duracao_min} min)`)
          .join("\n")
      : "  _Nenhuma live agendada_";

  const promocao = trilha.promocoes
    ? `**Promoção:** ${trilha.promocoes.desconto_percentual}% off` +
      (trilha.promocoes.codigo ? ` com código \`${trilha.promocoes.codigo}\`` : "") +
      (trilha.promocoes.validade ? ` até ${trilha.promocoes.validade}` : "")
    : "_Sem promoção ativa_";

  return `# 🎓 Trilha: ${trilha.nome}

**ID:** ${trilha.id}
**Tecnologia:** ${trilha.tecnologia}
**Nível:** ${trilha.nivel}
**Módulos:** ${trilha.numero_modulos}
**XP Total:** ${trilha.xp_total} XP
**Acesso Vitalício:** ${trilha.vitalicio ? "Sim ✅" : "Não ❌"}

## 📋 Descrição

${trilha.descricao}

## 🏅 Badges

${badges}

## 📡 Lives ao Vivo

${lives}

## 💰 Promoções

${promocao}

---

> 💡 Use o comando \`/desafio\` para praticar com um desafio de código!
`;
}

// ---------------------------------------------------------------------------
// /desafio – geração de desafio de código
// ---------------------------------------------------------------------------

export function gerarDesafio(tecnologia: string, nivel: string): Desafio {
  const tecKey = normalizeAccents(tecnologia.trim());
  const nivelKey = normalizeAccents(nivel.trim());

  if (!(tecKey in DESAFIOS)) {
    throw new Error(
      `Tecnologia '${tecnologia}' não possui banco de desafios. ` +
        `Disponíveis: ${Object.keys(DESAFIOS).join(", ")}.`
    );
  }
  const niveis = DESAFIOS[tecKey]!;
  if (!(nivelKey in niveis)) {
    throw new Error(
      `Nível '${nivel}' inválido. Disponíveis: ${Object.keys(niveis).join(", ")}.`
    );
  }
  return niveis[nivelKey]!;
}

export function formatarDesafio(tecnologia: string, nivel: string): string {
  const dado = gerarDesafio(tecnologia, nivel);
  const requisitos = dado.requisitos.map((r) => `- ${r}`).join("\n");
  const dicas = dado.dicas.map((d) => `- ${d}`).join("\n");

  return `# ⚡ Desafio de Código

**Tecnologia:** ${tecnologia.charAt(0).toUpperCase() + tecnologia.slice(1)}
**Nível:** ${nivel.charAt(0).toUpperCase() + nivel.slice(1)}
**Tempo sugerido:** ${dado.tempo} minutos

---

## 📋 Descrição do Desafio

${dado.descricao}

## 🎯 Requisitos

${requisitos}

## 📥 Entrada Esperada

\`\`\`
${dado.entrada}
\`\`\`

## 📤 Saída Esperada

\`\`\`
${dado.saida}
\`\`\`

## 💡 Dicas

${dicas}

## 🏆 Critérios de Avaliação

- [ ] O código resolve o problema corretamente
- [ ] O código está limpo e legível
- [ ] Boas práticas da linguagem foram seguidas

---

> Quando terminar, cole seu código aqui no chat para eu revisar e dar feedback! 🚀
`;
}

// ---------------------------------------------------------------------------
// /certificado – geração de certificado
// ---------------------------------------------------------------------------

function gerarCodigo(ano: number, seed?: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  // Pseudo-random determinístico quando seed fornecida
  let rng = seed !== undefined ? seed : Math.floor(Math.random() * 999999);
  let result = "";
  for (let i = 0; i < 8; i++) {
    rng = (rng * 1664525 + 1013904223) & 0xffffffff;
    result += chars[Math.abs(rng) % chars.length];
  }
  return `DIO-${ano}${result}`;
}

function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function gerarCertificado(
  nome: string,
  trilha: Trilha,
  dataEmissao?: Date,
  seed?: number
): string {
  const hoje = dataEmissao ?? new Date();
  const codigo = gerarCodigo(hoje.getFullYear(), seed);
  const badges = trilha.badges
    .map((b) => `- ${b.icone} ${b.nome} (${b.raridade})`)
    .join("\n");

  return `╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║              D I G I T A L   I N N O V A T I O N   O N E        ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

# 🏅 CERTIFICADO DE CONCLUSÃO

---

*A Digital Innovation One certifica que*

## ${nome.toUpperCase()}

*concluiu com êxito a trilha de aprendizado*

# 🎓 ${trilha.nome}

---

**Tecnologia:** ${trilha.tecnologia}
**Nível:** ${trilha.nivel}
**Módulos concluídos:** ${trilha.numero_modulos}
**XP conquistado:** ${trilha.xp_total} XP

---

**Badges conquistados:**
${badges}

---

| | |
|---|---|
| **Data de Emissão** | ${formatDate(hoje)} |
| **Código do Certificado** | ${codigo} |

---

*"O aprendizado é a única coisa que a mente nunca esgota, nunca teme e nunca lamenta."*
*— Leonardo da Vinci*

---

> 🔒 **Nota:** Este é um certificado fictício gerado para fins de estudo e prática com o Bob AI.
> Para certificados oficiais, acesse [dio.me](https://www.dio.me).
`;
}

// ---------------------------------------------------------------------------
// Helpers exportados
// ---------------------------------------------------------------------------

export { listTrilhas, findTrilhaById, findTrilhasByNivel, findTrilhasByTecnologia, getMeta };
