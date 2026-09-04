# 05 · Dados — Schema e Trilhas Disponíveis

## Os Dois Arquivos de Dados

O projeto usa dois arquivos JSON com formatos distintos e propósitos diferentes:

| Arquivo | Formato | Usado por | Trilhas |
|---------|---------|-----------|---------|
| `trilhas_dio.json` | Array com metadados ricos | Servidor MCP TypeScript | 20 trilhas de IA/Segurança |
| `trilhas_dio_comandos.json` | Dicionário por chave | Comandos Bob + Testes Python | 5 trilhas clássicas |

---

## `trilhas_dio.json` — Schema MCP (Array)

### Estrutura raiz

```json
{
  "trilhas": [ /* array de objetos Trilha */ ],
  "meta": { /* objeto TrilhasMeta */ }
}
```

### Schema de um objeto `Trilha`

```json
{
  "id":             1,
  "nome":           "LLM01 - Injeção de Prompt: Fundamentos e Defesas",
  "descricao":      "Descrição detalhada da trilha...",
  "tecnologia":     "Python / LangChain / OpenAI API",
  "nivel":          "Iniciante",
  "numero_modulos": 6,
  "xp_total":       1200,
  "badges": [
    { "nome": "Prompt Guardian", "raridade": "Comum",   "icone": "🛡️" },
    { "nome": "Injection Detector", "raridade": "Incomum", "icone": "🔍" }
  ],
  "promocoes": {
    "desconto_percentual": 20,
    "validade": "2025-09-30",
    "codigo": "OWASP20"
  },
  "vitalicio": true,
  "lives_ao_vivo": [
    { "titulo": "Anatomia de um ataque", "data": "2025-08-10", "duracao_min": 90 }
  ]
}
```

### Schema do objeto `meta`

```json
{
  "total_trilhas":      20,
  "fonte":              "DIO – Digital Innovation One",
  "versao":             "2.0.0",
  "ultima_atualizacao": "2025-07-01",
  "niveis_disponiveis": ["Iniciante", "Intermediário", "Avançado"],
  "raridades_badges":   ["Comum", "Incomum", "Raro", "Épico", "Lendário"],
  "xp_total_plataforma": 40000
}
```

### Tipos TypeScript correspondentes (`data-loader.ts`)

```typescript
interface Badge        { nome: string; raridade: string; icone: string }
interface Promocao     { desconto_percentual: number; validade: string | null; codigo: string | null }
interface LiveAoVivo   { titulo: string; data: string; duracao_min: number }

interface Trilha {
  id:             number;
  nome:           string;
  descricao:      string;
  tecnologia:     string;
  nivel:          string;
  numero_modulos: number;
  xp_total:       number;
  badges:         Badge[];
  promocoes:      Promocao | null;
  vitalicio:      boolean;
  lives_ao_vivo:  LiveAoVivo[];
}
```

---

## Trilhas disponíveis em `trilhas_dio.json`

As trilhas são focadas em **Segurança em IA Generativa**, cobrindo o OWASP Top 10 para LLMs e tópicos avançados:

| ID | Nome | Tecnologia | Nível | XP | Módulos |
|----|------|-----------|-------|-----|---------|
| 1 | LLM01 - Injeção de Prompt | Python / LangChain / OpenAI API | Iniciante | 1200 | 6 |
| 2 | LLM02 - Tratamento Inseguro de Saída | JavaScript / Node.js / Express | Intermediário | 1800 | 8 |
| 3 | LLM03 - Envenenamento da Cadeia de Suprimentos | Python / Hugging Face / MLflow | Avançado | 2500 | 10 |
| 4 | LLM04 - Negação de Serviço em LLMs | Python / FastAPI / Redis | Intermediário | 1600 | 7 |
| 5 | LLM05 - Vulnerabilidades em Plugins | Python / LangChain Tools / Docker | Avançado | 2200 | 9 |
| 6 | LLM06 - Divulgação de Informações Sensíveis | Python / AWS Macie / OpenAI Moderation | Intermediário | 1900 | 8 |
| 7 | LLM07 - Design de Agentes Inseguros | Python / AutoGen / CrewAI | Avançado | 3000 | 12 |
| 8 | LLM08 - Execução de Ações Excessivas | Python / LangGraph / OAuth 2.0 | Intermediário | 1700 | 7 |
| 9 | LLM09 - Dependência Excessiva em LLMs | Python / Evidently AI / Grafana | Iniciante | 1000 | 5 |
| 10 | LLM10 - Roubo de Modelo | Python / PyTorch / NGINX | Avançado | 2800 | 11 |
| 11 | GenAI01 - Segurança em RAG | Python / LangChain / Pinecone | Intermediário | 2100 | 9 |
| 12 | GenAI02 - Proteção de Prompts de Sistema | Python / Vault HashiCorp / AWS KMS | Avançado | 2300 | 8 |
| 13 | GenAI03 - Segurança em Fine-Tuning e RLHF | Python / Hugging Face PEFT / TRL | Avançado | 3200 | 13 |
| 14 | GenAI04 - Jailbreak e Bypass de Guardrails | Python / Garak / NeMo Guardrails | Avançado | 2600 | 10 |
| 15 | GenAI05 - Segurança em Multimodal AI | Python / GPT-4 Vision / Stable Diffusion | Avançado | 2900 | 11 |
| 16 | GenAI06 - Compliance e LGPD em IA | Python / Apache Atlas / OneTrust | Iniciante | 1100 | 6 |
| 17 | GenAI07 - Threat Modeling para IA | OWASP Threat Dragon / MS Threat Modeling | Intermediário | 1950 | 8 |
| 18 | GenAI08 - Segurança em Embeddings | Python / FAISS / homomorphic encryption | Avançado | 2400 | 10 |
| 19 | GenAI09 - LLMOps Seguro | Python / MLflow / Kubernetes / ArgoCD | Avançado | 2700 | 12 |
| 20 | GenAI10 - Auditoria e Explicabilidade de IA | Python / SHAP / LIME / Alibi | Intermediário | 2000 | 9 |

**Total de XP disponível:** ~40.000 XP  
**Total de badges:** ~50+ badges de 5 raridades

---

## `trilhas_dio_comandos.json` — Schema Comandos (Dicionário)

### Estrutura raiz

```json
{
  "trilhas": {
    "java":       { /* objeto trilha */ },
    "python":     { /* objeto trilha */ },
    "javascript": { /* objeto trilha */ },
    "react":      { /* objeto trilha */ },
    "devops":     { /* objeto trilha */ }
  }
}
```

### Schema de um objeto trilha (formato dicionário)

```json
{
  "nome":     "Java Developer",
  "nivel":    "Intermediário ao Avançado",
  "duracao":  "120 horas",
  "descricao": "Domine Java com Spring Boot, microsserviços...",
  "modulos": [
    {
      "numero": 1,
      "titulo": "Java Fundamentals",
      "topicos": [
        "Tipos de dados, operadores e controle de fluxo",
        "POO: classes, herança e polimorfismo",
        "Coleções e generics",
        "Exceções e tratamento de erros"
      ]
    }
    /* ... até 5 módulos */
  ]
}
```

### Trilhas disponíveis em `trilhas_dio_comandos.json`

| Chave | Nome oficial | Nível | Duração | Módulos |
|-------|-------------|-------|---------|---------|
| `javascript` | JavaScript Fullstack Developer | Intermediário | 80 horas | 5 |
| `python` | Python Developer | Iniciante ao Avançado | 100 horas | 5 |
| `react` | React Developer | Intermediário | 60 horas | 5 |
| `java` | Java Developer | Intermediário ao Avançado | 120 horas | 5 |
| `devops` | DevOps Engineer | Avançado | 90 horas | 5 |

---

## Diferenças entre os Formatos

| Característica | `trilhas_dio.json` | `trilhas_dio_comandos.json` |
|----------------|-------------------|---------------------------|
| **Estrutura** | Array `[]` | Dicionário `{}` |
| **Acesso** | Por índice / `.find()` | Por chave string |
| **ID numérico** | Sim (`id: 1`) | Não |
| **Badges** | Sim (com raridade) | Não |
| **XP** | Sim | Não |
| **Lives** | Sim | Não |
| **Promoções** | Sim | Não |
| **Módulos** | Número (count) | Array com tópicos |
| **Tecnologias** | Segurança IA (20) | Stack clássica (5) |
| **Usado por** | MCP Server TypeScript | Comandos Bob + Testes Python |

---

## Como Estender os Dados

### Adicionar uma nova trilha ao MCP

No `trilhas_dio.json`, adicione um objeto no array `trilhas`:

```json
{
  "id": 21,
  "nome": "Nova Trilha",
  "descricao": "...",
  "tecnologia": "Python / FastAPI",
  "nivel": "Iniciante",
  "numero_modulos": 5,
  "xp_total": 1000,
  "badges": [],
  "promocoes": null,
  "vitalicio": false,
  "lives_ao_vivo": []
}
```

Atualize também o campo `meta.total_trilhas` e `meta.xp_total_plataforma`.

### Adicionar uma nova trilha aos comandos Bob

No `trilhas_dio_comandos.json`, adicione uma chave no objeto `trilhas`:

```json
"kotlin": {
  "nome": "Kotlin Developer",
  "nivel": "Intermediário",
  "duracao": "70 horas",
  "descricao": "...",
  "modulos": [
    { "numero": 1, "titulo": "...", "topicos": ["...", "..."] }
  ]
}
```

---

_[← Anterior: Servidor MCP](./04-servidor-mcp.md) · [Próximo: Testes →](./06-testes.md)_
