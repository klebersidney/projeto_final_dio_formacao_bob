# 01 · Visão Geral do Projeto

## O que é o Geo Explorer DIO?

O **Geo Explorer DIO** é o projeto final da **Formação Bob AI** da [Digital Innovation One](https://www.dio.me). Seu propósito é demonstrar, de forma prática e completa, como criar um **servidor MCP (Model Context Protocol)** integrado ao agente **Bob AI**, capaz de:

- Consultar trilhas de aprendizado da DIO com detalhes completos
- Gerar desafios de código práticos por tecnologia e nível de dificuldade
- Emitir certificados fictícios de conclusão personalizados
- Fornecer estatísticas da plataforma via ferramenta dedicada

---

## Objetivos Pedagógicos

| Objetivo | Descrição |
|----------|-----------|
| **Aprender MCP** | Entender como o Model Context Protocol funciona e como criar servidores que estendem capacidades do Bob |
| **TypeScript moderno** | Praticar TypeScript com ES modules, tipos avançados, Zod para validação |
| **Python para testes** | Escrever testes unitários robustos com pytest, cobertura ≥ 98 % |
| **Arquitetura real** | Projetar um sistema com separação de responsabilidades (data-loader, core, server) |
| **Prompt Engineering** | Criar comandos slash reutilizáveis que orientam o Bob via arquivos Markdown |
| **Integração dual** | Expor o mesmo servidor tanto via stdio (local) quanto via HTTP/SSE (remoto) |

---

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        Usuário                              │
│              (chat no Bob AI / terminal)                    │
└───────────────────┬─────────────────────────────────────────┘
                    │  comandos slash ou linguagem natural
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      Bob AI Agent                           │
│  ┌──────────────────┐    ┌──────────────────────────────┐  │
│  │  .bob/commands/  │    │   Ferramenta MCP registrada  │  │
│  │  trilha.md       │    │   (listar_trilhas,           │  │
│  │  desafio.md      │◄──►│    gerar_desafio,            │  │
│  │  certificado.md  │    │    gerar_certificado, ...)   │  │
│  └──────────────────┘    └──────────────┬───────────────┘  │
└──────────────────────────────────────────┼──────────────────┘
                                           │ stdio / SSE
                    ┌──────────────────────▼──────────────────┐
                    │         Geo Explorer MCP Server          │
                    │  ┌──────────┐  ┌──────┐  ┌──────────┐  │
                    │  │index.ts  │  │core  │  │http-     │  │
                    │  │(stdio)   │  │.ts   │  │server.ts │  │
                    │  └────┬─────┘  └──┬───┘  └────┬─────┘  │
                    │       └───────────┼────────────┘        │
                    │              ┌────▼────┐                 │
                    │              │data-    │                 │
                    │              │loader   │                 │
                    │              └────┬────┘                 │
                    └───────────────────┼─────────────────────┘
                                        │ readFileSync
                    ┌───────────────────▼─────────────────────┐
                    │         geo_explorer/data/               │
                    │  trilhas_dio.json          (MCP/array)   │
                    │  trilhas_dio_comandos.json (Bob/dict)    │
                    └─────────────────────────────────────────┘
```

---

## Fluxo de uma requisição

### Via Comando Slash (Bob AI)

```
1. Usuário digita: /trilha java

2. Bob lê .bob/commands/trilha.md
   → Instrução: ler geo_explorer/data/trilhas_dio_comandos.json

3. Bob lê o arquivo JSON, localiza a chave "java"

4. Bob formata e exibe o plano de estudos em Markdown
```

### Via Ferramenta MCP (stdio)

```
1. Usuário diz: "Liste as trilhas de nível Avançado"

2. Bob identifica a intenção e invoca: listar_trilhas(nivel="Avançado")

3. MCP Server (index.ts) recebe o chamado via stdio
   → data-loader.ts lê trilhas_dio.json
   → Filtra por nivel = "Avançado"

4. Retorna lista formatada em Markdown ao Bob

5. Bob exibe o resultado no chat
```

### Via HTTP/SSE (remoto)

```
1. Cliente conecta em: GET http://localhost:3000/sse

2. http-server.ts cria sessão SSE e associa McpServer

3. Cliente envia mensagens MCP via: POST /messages?sessionId=<id>

4. Servidor processa, invoca core.ts, retorna resposta SSE
```

---

## Tecnologias Utilizadas

| Camada | Tecnologia | Versão | Propósito |
|--------|-----------|--------|-----------|
| **MCP Server** | TypeScript | 5.4+ | Lógica principal do servidor |
| **Runtime** | Node.js | 18+ | Execução do servidor |
| **Validação** | Zod | 3.23+ | Validação de parâmetros das ferramentas |
| **HTTP** | Express | 4.18+ | Servidor HTTP/SSE alternativo |
| **CORS** | cors | 2.8+ | Cabeçalhos de segurança HTTP |
| **MCP SDK** | @modelcontextprotocol/sdk | 1.12+ | Protocolo MCP |
| **Testes** | Python + pytest | 3.14 / 9.1 | Suite de testes unitários |
| **Cobertura** | pytest-cov | 7.1+ | Relatório de cobertura de código |
| **Dados** | JSON | — | Banco de dados de trilhas |
| **Comandos** | Markdown | — | Definição de comandos slash |

---

## Requisitos do Ambiente

```
Node.js  >= 18.0.0
npm      >= 9.0.0
Python   >= 3.10
pytest   >= 9.0
Bob AI   (instalado e configurado)
```

---

_[← Voltar ao índice](./README.md) · [Próximo: Estrutura do Projeto →](./02-estrutura-projeto.md)_
