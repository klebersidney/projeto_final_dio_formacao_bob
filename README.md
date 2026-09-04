# Geo Explorer DIO — Projeto Final · Formação Bob AI

Projeto final da **Formação Bob AI** da [Digital Innovation One](https://www.dio.me).  
Demonstra como criar um servidor MCP completo integrado ao Bob AI, com trilhas de aprendizado, desafios de código e certificados de conclusão.

---

## Início Rápido

```bash
# 1. Compilar o servidor MCP
cd geo_explorer/mcp
npm install && npm run build

# 2. Registrar no Bob AI (mcp.json)
# Veja: docs/04-servidor-mcp.md

# 3. Usar os comandos no chat
/trilha java
/desafio python intermediário
/certificado Seu Nome java

# 4. Executar os testes
python -m pytest geo_explorer/tests/test_commands.py -v
```

---

## Comandos Disponíveis

| Comando | Uso | Descrição |
|---------|-----|-----------|
| `/trilha` | `/trilha <tecnologia>` | Exibe plano de estudos completo |
| `/desafio` | `/desafio <tecnologia> <nivel>` | Gera desafio de código prático |
| `/certificado` | `/certificado <nome> <trilha>` | Emite certificado de conclusão |

**Tecnologias (comandos):** `javascript` · `python` · `react` · `java` · `devops`

---

## Ferramentas MCP

Quando o servidor estiver ativo, o Bob usa automaticamente:

`listar_trilhas` · `buscar_trilha` · `ver_trilha` · `gerar_desafio` · `gerar_certificado` · `estatisticas`

---

## Estrutura

```
geo_explorer/
├── data/          # JSONs de trilhas (MCP e comandos Bob)
├── docs/          # Documentação completa
├── mcp/           # Servidor MCP TypeScript (stdio + HTTP/SSE)
└── tests/         # Testes Python — 99 testes, cobertura 98%
```

---

## Documentação Completa

Toda a documentação está em [`geo_explorer/docs/`](./docs/):

| Doc | Conteúdo |
|-----|----------|
| [Visão Geral](geo_explorer/docs/01-visao-geral.md) | Objetivos, arquitetura e fluxo do sistema |
| [Estrutura](geo_explorer/docs/02-estrutura-projeto.md) | Mapa de arquivos e responsabilidades |
| [Comandos Bob](geo_explorer/docs/03-comandos-bob.md) | Prompts, comandos slash e prompt engineering |
| [Servidor MCP](geo_explorer/docs/04-servidor-mcp.md) | Ferramentas, transportes, configuração |
| [Dados](geo_explorer/docs/05-dados.md) | Schema dos JSONs e trilhas disponíveis |
| [Testes](geo_explorer/docs/06-testes.md) | Suite de 99 testes e relatório de cobertura |
| [Modos de Uso](geo_explorer/docs/07-modos-de-uso.md) | Exemplos reais de conversas e sessões |
| [Dicas & Insights](geo_explorer/docs/08-dicas-e-insights.md) | Boas práticas para futuros profissionais |

---

## Resultados dos Testes

```
99 passed in 0.51s
core.py coverage: 100%  |  total: 98%
```

---

_Projeto educacional — DIO Formação Bob AI · 2025_
