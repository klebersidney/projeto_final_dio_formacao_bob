# 🤖 Geo Explorer DIO – MCP Server

Servidor **Model Context Protocol (MCP)** do projeto [Projeto Final DIO – Formação Bob](../README.md).  
Expõe trilhas de aprendizado, desafios de código e certificados DIO para qualquer cliente MCP (Bob, Claude Desktop, etc.) via **stdio**, **HTTP/SSE** ou proxy **HTTPS/SSO**.

---

## 📁 Estrutura

```
mcp/
├── src/
│   ├── index.ts          # Servidor MCP principal (transporte stdio)
│   ├── http-server.ts    # Servidor HTTP/SSE para conexões remotas
│   ├── core.ts           # Lógica de negócio (trilhas, desafios, certificados)
│   └── data-loader.ts    # Carregamento e cache do JSON de trilhas
├── build/                # Saída do compilador TypeScript (gerada)
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Início Rápido

### 1. Instalar dependências

```bash
cd mcp
npm install
```

### 2. Compilar

```bash
npm run build
```

### 3. Executar

**Modo stdio** (para Bob/Claude Desktop):
```bash
node build/index.js
```

**Modo HTTP/SSE** (para acesso remoto, HTTPS, SSO):
```bash
MCP_API_KEY=minha_chave_secreta node build/http-server.js
```

---

## 🔧 Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `3000` | Porta do servidor HTTP |
| `MCP_API_KEY` | _(vazio)_ | Token Bearer para autenticação. Se vazio, auth desabilitada (apenas dev) |
| `CORS_ORIGIN` | `*` | Origem permitida pelo CORS |
| `TRILHAS_JSON_PATH` | _(auto)_ | Caminho absoluto para `trilhas_dio.json`. Detectado automaticamente se não definido |

---

## 🛠️ Ferramentas Disponíveis

| Ferramenta | Descrição |
|------------|-----------|
| `listar_trilhas` | Lista todas as trilhas DIO (filtros: nível, tecnologia) |
| `buscar_trilha` | Busca trilha por id, nível ou tecnologia |
| `ver_trilha` | Exibe detalhes completos de uma trilha pelo `id` |
| `gerar_desafio` | Gera desafio de código para uma tecnologia e nível |
| `gerar_certificado` | Emite certificado fictício de conclusão |
| `estatisticas` | Exibe estatísticas gerais da plataforma DIO |

---

## 🔌 Conexão com Bob (stdio)

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

> **Windows:** use barras invertidas duplas `\\` ou barras normais `/` no caminho.

---

## 🌐 Conexão via HTTP/SSE (remota, HTTPS, API)

### Iniciar o servidor HTTP

```bash
cd mcp
MCP_API_KEY=seu_token_secreto PORT=3000 node build/http-server.js
```

### Registrar no Bob como servidor remoto

```json
{
  "mcpServers": {
    "geo-explorer-dio-remote": {
      "url": "http://localhost:3000/sse",
      "headers": {
        "Authorization": "Bearer seu_token_secreto"
      }
    }
  }
}
```

### Verificar saúde do servidor

```bash
curl http://localhost:3000/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "server": "geo-explorer-dio",
  "version": "1.0.0",
  "trilhas_carregadas": 10,
  "sessoes_ativas": 0
}
```

---

## 🔒 HTTPS e SSO

### HTTPS com proxy reverso (Nginx / Caddy)

O servidor HTTP não termina TLS diretamente — use um proxy reverso na frente:

**Exemplo Caddy (`Caddyfile`):**
```
mcp.seudominio.com {
  reverse_proxy localhost:3000
}
```

**Exemplo Nginx:**
```nginx
server {
  listen 443 ssl;
  server_name mcp.seudominio.com;

  ssl_certificate     /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;

  location / {
    proxy_pass         http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header   Upgrade $http_upgrade;
    proxy_set_header   Connection keep-alive;
    proxy_set_header   Host $host;
    proxy_cache_bypass $http_upgrade;

    # Necessário para SSE
    proxy_buffering    off;
    proxy_read_timeout 86400s;
  }
}
```

Após configurar o proxy, registre no Bob com `url: "https://mcp.seudominio.com/sse"`.

### SSO / OAuth2

O middleware de autenticação em [`http-server.ts`](src/http-server.ts) valida o cabeçalho `Authorization: Bearer <token>` contra a variável `MCP_API_KEY`.

Para integrar com um **IdP SSO** (Keycloak, Auth0, Entra ID):

1. No middleware `authMiddleware` em `src/http-server.ts`, substitua a comparação direta por uma chamada de introspecção/validação de token JWT contra o endpoint do seu IdP.
2. Exemplo com verificação de JWT (instale `jsonwebtoken`):

```typescript
import jwt from "jsonwebtoken";

// No lugar da comparação de string:
const decoded = jwt.verify(token, process.env.SSO_PUBLIC_KEY!, { algorithms: ["RS256"] });
// Verifique audience, issuer e scopes conforme necessário
```

---

## 📦 Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run build` | Compila TypeScript → `build/` |
| `npm run dev` | Compilação contínua (watch mode) |
| `npm start` | Inicia servidor stdio |
| `npm run start:http` | Inicia servidor HTTP/SSE |
| `npm run lint` | Verifica tipos sem compilar |

---

## 🗂️ Exemplo de uso no Bob

Após conectar o servidor, você pode pedir ao Bob:

```
Liste todas as trilhas de nível Avançado
```
```
Mostre os detalhes da trilha de id 3
```
```
Gere um desafio de Python nível intermediário
```
```
Emita um certificado para "João Silva" na trilha 1
```
```
Mostre as estatísticas da plataforma DIO
```

---

## 📄 Licença

Projeto educacional – DIO Formação Bob. Uso livre para fins de estudo.
