# 02 · Estrutura do Projeto

## Mapa Completo de Arquivos

```
projeto_final_dio_formacao_bob/
│
├── .bob/                              # Configurações do Bob AI
│   └── commands/                      # Comandos slash personalizados
│       ├── trilha.md                  # Comando /trilha <tecnologia>
│       ├── desafio.md                 # Comando /desafio <tecnologia> <nivel>
│       └── certificado.md             # Comando /certificado <nome> <trilha>
│
├── .bobignore                         # Arquivos ignorados pelo Bob AI
│
└── geo_explorer/                      # ★ RAIZ DO PROJETO
    │
    ├── README.md                      # Apresentação geral do projeto
    │
    ├── data/                          # Banco de dados JSON
    │   ├── trilhas_dio.json           # Trilhas ricas (MCP) – formato array
    │   └── trilhas_dio_comandos.json  # Trilhas simples (Bob) – formato dict
    │
    ├── docs/                          # ★ DOCUMENTAÇÃO COMPLETA
    │   ├── README.md                  # Índice da documentação
    │   ├── 01-visao-geral.md          # Objetivos e arquitetura
    │   ├── 02-estrutura-projeto.md    # Este arquivo
    │   ├── 03-comandos-bob.md         # Prompts e comandos slash
    │   ├── 04-servidor-mcp.md         # API do servidor MCP
    │   ├── 05-dados.md                # Schema e dados disponíveis
    │   ├── 06-testes.md               # Testes e cobertura
    │   ├── 07-modos-de-uso.md         # Guia de uso prático
    │   └── 08-dicas-e-insights.md     # Boas práticas e conselhos
    │
    ├── mcp/                           # Servidor MCP (TypeScript/Node.js)
    │   ├── src/                       # Código-fonte TypeScript
    │   │   ├── index.ts               # Ponto de entrada – transporte stdio
    │   │   ├── http-server.ts         # Servidor HTTP/SSE alternativo
    │   │   ├── core.ts                # Lógica de negócio
    │   │   └── data-loader.ts         # Carregamento e cache do JSON
    │   ├── build/                     # Código compilado (gerado por tsc)
    │   │   ├── index.js               # Executável principal
    │   │   ├── http-server.js         # Servidor HTTP compilado
    │   │   ├── core.js                # Core compilado
    │   │   └── data-loader.js         # Data-loader compilado
    │   ├── node_modules/              # Dependências npm (não versionar)
    │   ├── package.json               # Manifesto npm e scripts
    │   ├── tsconfig.json              # Configuração do compilador TypeScript
    │   └── README.md                  # Documentação específica do MCP
    │
    ├── tests/                         # Testes unitários Python
    │   ├── conftest.py                # Configuração global do pytest
    │   ├── core.py                    # Lógica de negócio Python (testável)
    │   ├── test_commands.py           # 99 testes para /trilha, /desafio, /certificado
    │   ├── __init__.py                # Pacote Python
    │   └── resultados_testes.txt      # Relatório de execução dos testes
    │
    ├── commands/                      # (reservado para comandos futuros)
    └── src/                           # (reservado para código fonte futuro)
```

---

## Responsabilidades por Arquivo

### `.bob/commands/`

Arquivos Markdown que definem **comandos slash** para o Bob AI. Cada arquivo é um prompt estruturado que instrui o Bob sobre como responder a um comando específico.

| Arquivo | Ativado por | Função |
|---------|------------|--------|
| `trilha.md` | `/trilha <tecnologia>` | Exibe plano de estudo formatado |
| `desafio.md` | `/desafio <tecnologia> <nivel>` | Gera desafio de código |
| `certificado.md` | `/certificado <nome> <trilha>` | Emite certificado de conclusão |

---

### `geo_explorer/data/`

Dois arquivos JSON com propósitos distintos:

**`trilhas_dio.json`** — usado pelo servidor MCP TypeScript
```json
{
  "trilhas": [ /* array de objetos com id, badges, XP, lives, promoções */ ],
  "meta":    { "total_trilhas": 10, "xp_total_plataforma": 12500, ... }
}
```

**`trilhas_dio_comandos.json`** — usado pelos comandos Bob e testes Python
```json
{
  "trilhas": {
    "java":       { "nome": "Java Developer", "nivel": "...", "modulos": [...] },
    "python":     { ... },
    "javascript": { ... },
    "react":      { ... },
    "devops":     { ... }
  }
}
```

> **Por que dois JSONs?** O MCP server foi desenvolvido com uma estrutura de dados enriquecida (badges, XP, lives, promoções), enquanto os comandos Bob e os testes Python foram criados antes, usando o formato simples por chave de tecnologia. Ambos coexistem para manter compatibilidade.

---

### `geo_explorer/mcp/src/`

#### `data-loader.ts` — Camada de dados
- Exporta tipos TypeScript: `Trilha`, `Badge`, `Promocao`, `LiveAoVivo`, `TrilhasMeta`
- Função `findJsonPath()`: detecta automaticamente o caminho do JSON via candidatos
- Cache em memória com `_cache: TrilhasDatabase | null`
- Funções públicas: `listTrilhas()`, `findTrilhaById()`, `findTrilhasByNivel()`, `findTrilhasByTecnologia()`, `getMeta()`

#### `core.ts` — Lógica de negócio
- Classe `TrilhaNotFoundError` (erro customizado)
- Banco de desafios `DESAFIOS` por tecnologia × nível
- `formatarTrilha(trilha)` → Markdown com badges, lives, promoções
- `gerarDesafio(tecnologia, nivel)` → objeto desafio
- `formatarDesafio(tecnologia, nivel)` → Markdown completo do desafio
- `gerarCertificado(nome, trilha)` → certificado ASCII + Markdown

#### `index.ts` — Servidor stdio
- Registra 6 ferramentas MCP: `listar_trilhas`, `buscar_trilha`, `ver_trilha`, `gerar_desafio`, `gerar_certificado`, `estatisticas`
- Transporte: `StdioServerTransport` (stdin/stdout)
- Ponto de entrada para Bob AI e Claude Desktop

#### `http-server.ts` — Servidor HTTP/SSE
- Mesmo conjunto de ferramentas do `index.ts`
- Transporte: `SSEServerTransport` em `GET /sse`
- Middleware de autenticação Bearer Token
- Endpoint de saúde: `GET /health`
- Gerenciamento de sessões SSE ativas
- Configurável via variáveis de ambiente

---

### `geo_explorer/tests/`

#### `core.py` — Lógica Python testável
- Espelho da lógica em `core.ts`, mas em Python puro
- Carrega `trilhas_dio_comandos.json` (formato dicionário)
- `load_trilhas()`, `get_trilha()`, `formatar_trilha()`
- `gerar_desafio()`, `formatar_desafio()`
- `gerar_certificado()`, `_gerar_codigo()`

#### `test_commands.py` — Suite de testes
- 99 testes em 7 blocos (classes)
- Cobertura: `core.py` 100 %, total 98 %
- Usa fixtures do pytest, parametrize e tmp_path

#### `conftest.py` — Configuração pytest
- Ajusta `sys.path` para localizar `core.py`

---

## Regra de Ouro da Estrutura

> Todo código, dado e documentação do projeto fica **dentro de `geo_explorer/`**.  
> Apenas configurações do workspace Bob (`.bob/`, `.bobignore`) ficam na raiz.

---

_[← Anterior: Visão Geral](./01-visao-geral.md) · [Próximo: Comandos Bob →](./03-comandos-bob.md)_
