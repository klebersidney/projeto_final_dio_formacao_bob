# 04 · Servidor MCP

## O que é MCP?

**Model Context Protocol (MCP)** é um protocolo aberto criado pela Anthropic que permite que agentes de IA como o Bob AI se conectem a servidores externos que fornecem **ferramentas**, **recursos** e **prompts**. Pense nele como uma API padronizada que qualquer LLM pode consumir para obter capacidades extras.

```
Bob AI ←──── MCP Protocol ────► Servidor MCP
              (stdio/SSE)         (Node.js)
```

---

## Instalação e Build

```bash
# 1. Entrar na pasta do servidor
cd geo_explorer/mcp

# 2. Instalar dependências
npm install

# 3. Compilar TypeScript → JavaScript
npm run build

# Scripts disponíveis
npm run build        # Compila tsc → build/
npm run dev          # Compilação contínua (watch mode)
npm start            # Inicia servidor stdio
npm run start:http   # Inicia servidor HTTP/SSE
npm run lint         # Verifica tipos sem compilar
```

---

## Modo 1: Servidor stdio (padrão para Bob AI)

O transporte **stdio** usa stdin/stdout para comunicação. É o modo padrão para integração com Bob AI e Claude Desktop.

### Executar manualmente

```bash
node geo_explorer/mcp/build/index.js
```

### Configurar no Bob AI

Adicione ao arquivo `mcp.json` do Bob (workspace ou global):

```json
{
  "mcpServers": {
    "geo-explorer-dio": {
      "command": "node",
      "args": ["D:/laragon/www/projeto_final_dio_formacao_bob/geo_explorer/mcp/build/index.js"],
      "env": {
        "TRILHAS_JSON_PATH": "D:/laragon/www/projeto_final_dio_formacao_bob/geo_explorer/data/trilhas_dio.json"
      }
    }
  }
}
```

> **Windows:** use barras normais `/` ou barras duplas `\\` nos caminhos.

---

## Modo 2: Servidor HTTP/SSE (remoto)

O transporte **SSE (Server-Sent Events)** expõe o MCP sobre HTTP. Permite conexões remotas, proxy HTTPS e integração SSO.

### Iniciar o servidor HTTP

```bash
# Modo desenvolvimento (sem autenticação)
node geo_explorer/mcp/build/http-server.js

# Modo produção (com autenticação)
$env:MCP_API_KEY="seu_token_secreto"
$env:PORT="3000"
node geo_explorer/mcp/build/http-server.js
```

### Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `3000` | Porta do servidor HTTP |
| `MCP_API_KEY` | _(vazio)_ | Token Bearer. Se vazio, autenticação desabilitada |
| `CORS_ORIGIN` | `*` | Origem permitida pelo CORS |
| `TRILHAS_JSON_PATH` | _(auto)_ | Caminho absoluto para `trilhas_dio.json` |

### Endpoints HTTP

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/` | Não | Informações da API |
| `GET` | `/health` | Não | Status do servidor |
| `GET` | `/sse` | Sim | Canal SSE – MCP sobre HTTP |
| `POST` | `/messages?sessionId=<id>` | Sim | Mensagens MCP do cliente |

### Exemplo: verificar saúde

```bash
curl http://localhost:3000/health
```

Resposta:
```json
{
  "status": "ok",
  "server": "geo-explorer-dio",
  "version": "1.0.0",
  "trilhas_carregadas": 10,
  "sessoes_ativas": 0,
  "timestamp": "2025-07-14T10:00:00.000Z"
}
```

### Configurar no Bob AI (remoto)

```json
{
  "mcpServers": {
    "geo-explorer-dio-remoto": {
      "url": "http://localhost:3000/sse",
      "headers": {
        "Authorization": "Bearer seu_token_secreto"
      }
    }
  }
}
```

---

## Ferramentas Disponíveis

### `listar_trilhas`

Lista todas as trilhas com filtros opcionais.

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `nivel` | `string` | Não | Filtrar por nível: `Iniciante`, `Intermediário`, `Avançado` |
| `tecnologia` | `string` | Não | Filtro parcial na tecnologia (ex: `"Python"`, `"Node"`) |

**Exemplos de uso natural:**
```
Liste todas as trilhas disponíveis
Quais trilhas são de nível Avançado?
Tem alguma trilha de Python?
```

**Saída (trecho):**
```markdown
## 📚 Trilhas DIO – 3 resultado(s)

**[1]** LLM01 - Injeção de Prompt: Fundamentos e Defesas
  ↳ Tecnologia: Python / LangChain | Nível: Iniciante | XP: 1200 | Módulos: 6
```

---

### `buscar_trilha`

Busca uma trilha específica por id, nível ou tecnologia.

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `id` | `number` | Não | ID exato da trilha |
| `nivel` | `string` | Não | Nível da trilha |
| `tecnologia` | `string` | Não | Palavra-chave da tecnologia |

**Exemplos:**
```
Busca a trilha de id 3
Busca trilhas de nível Intermediário
Busca trilhas de JavaScript
```

---

### `ver_trilha`

Exibe detalhes completos: descrição, badges, lives e promoções.

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `id` | `number` | **Sim** | ID da trilha (use `listar_trilhas` primeiro) |

**Exemplos:**
```
Mostre os detalhes da trilha de id 1
Ver trilha 5
Detalhes completos da trilha número 3
```

**Saída (trecho):**
```markdown
# 🎓 Trilha: LLM01 - Injeção de Prompt

**ID:** 1
**Tecnologia:** Python / LangChain / OpenAI API
**Nível:** Iniciante
**XP Total:** 1200 XP
**Acesso Vitalício:** Sim ✅

## 🏅 Badges
  🛡️ **Prompt Guardian** (Comum)
  🔍 **Injection Detector** (Incomum)

## 💰 Promoções
**Promoção:** 20% off com código `OWASP20` até 2025-09-30
```

---

### `gerar_desafio`

Gera um desafio de código pré-definido (determinístico).

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Valores aceitos |
|-----------|------|-------------|----------------|
| `tecnologia` | `enum` | **Sim** | `java`, `python`, `javascript` |
| `nivel` | `enum` | **Sim** | `iniciante`, `intermediario`, `avancado` |

**Exemplos:**
```
Gere um desafio de Python nível intermediário
Quero um desafio de Java avançado
Desafio de JavaScript para iniciantes
```

**Desafios disponíveis por combinação:**

| Tecnologia | Nível | Desafio |
|-----------|-------|---------|
| Java | iniciante | Calculadora de IMC |
| Java | intermediario | Sistema de Estoque com ArrayList |
| Java | avancado | Microsserviço de autenticação JWT |
| Python | iniciante | Calculadora de Média Escolar |
| Python | intermediario | API REST com FastAPI |
| Python | avancado | Pipeline de ML com scikit-learn e MLflow |
| JavaScript | iniciante | Conversor de Temperatura |
| JavaScript | intermediario | SPA com Fetch API e DOM Manipulation |
| JavaScript | avancado | Server-Sent Events em tempo real |

---

### `gerar_certificado`

Emite um certificado fictício de conclusão.

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `nome` | `string` (min 2) | **Sim** | Nome completo do aluno |
| `id_trilha` | `number` | **Sim** | ID da trilha concluída |

**Exemplos:**
```
Emita um certificado para "João Silva" na trilha 1
Gere um certificado para Ana Costa, trilha de id 3
Certificado para "Maria Aparecida" na trilha número 5
```

---

### `estatisticas`

Exibe estatísticas gerais da plataforma DIO.

**Parâmetros:** nenhum

**Exemplos:**
```
Mostre as estatísticas da plataforma DIO
Quantas trilhas existem?
Qual o total de XP disponível?
```

---

## Arquitetura Interna do Servidor

### Padrão de resolução de caminho do JSON

O `data-loader.ts` usa uma lista de candidatos para encontrar o JSON, tornando o servidor portátil:

```typescript
const candidates = [
  join(__dirname, "..", "..", "geo_explorer", "data", "trilhas_dio.json"),
  join(__dirname, "..", "..", "..", "geo_explorer", "data", "trilhas_dio.json"),
  join(__dirname, "..", "data", "trilhas_dio.json"),
  process.env["TRILHAS_JSON_PATH"] ?? "",
];
```

O primeiro caminho que existir é usado. A variável `TRILHAS_JSON_PATH` tem precedência como fallback explícito.

### Cache em memória

```typescript
let _cache: TrilhasDatabase | null = null;

export function loadDatabase(forceReload = false): TrilhasDatabase {
  if (_cache && !forceReload) return _cache;
  // lê o arquivo apenas uma vez
  _cache = JSON.parse(readFileSync(jsonPath, "utf-8"));
  return _cache;
}
```

O JSON é lido **uma única vez** e mantido em memória enquanto o processo estiver ativo. Para recarregar, use `forceReload = true`.

### Gerenciamento de sessões SSE

```typescript
const sessions = new Map<string, SSEServerTransport>();
// Por sessão: uma instância de McpServer é criada
// Na desconexão: a sessão é removida do Map
```

Cada cliente SSE recebe sua própria instância de `McpServer`, garantindo isolamento entre sessões.

---

_[← Anterior: Comandos Bob](./03-comandos-bob.md) · [Próximo: Dados →](./05-dados.md)_
