# 📖 Documentação — Geo Explorer DIO

> Documentação completa do Projeto Final da Formação Bob AI na DIO.

---

## Índice de Documentos

| Documento | Conteúdo |
|-----------|----------|
| [01 · Visão Geral](./01-visao-geral.md) | Objetivos, contexto, arquitetura e fluxo do sistema |
| [02 · Estrutura do Projeto](./02-estrutura-projeto.md) | Mapa de pastas, responsabilidades de cada arquivo |
| [03 · Comandos Bob](./03-comandos-bob.md) | Todos os prompts, comandos slash e como usá-los |
| [04 · Servidor MCP](./04-servidor-mcp.md) | Ferramentas MCP, transportes stdio e HTTP/SSE, configuração |
| [05 · Dados](./05-dados.md) | Schema dos JSONs, trilhas disponíveis, campos e exemplos |
| [06 · Testes](./06-testes.md) | Suite de testes Python, cobertura 98 %, como executar |
| [07 · Modos de Uso](./07-modos-de-uso.md) | Guia prático de uso com exemplos reais de conversa |
| [08 · Dicas & Insights](./08-dicas-e-insights.md) | Boas práticas, lições aprendidas e conselhos para profissionais |

---

## Início Rápido

```bash
# 1. Instalar dependências do servidor MCP
cd geo_explorer/mcp && npm install && npm run build

# 2. Registrar o servidor no Bob (mcp.json)
# Veja: 04-servidor-mcp.md

# 3. Usar os comandos no chat do Bob
/trilha java
/desafio python intermediario
/certificado João Silva java
```

---

## Sobre o Projeto

**Geo Explorer DIO** é um projeto educacional construído como trabalho final da **Formação Bob AI** da [Digital Innovation One](https://www.dio.me). Ele demonstra como criar um servidor MCP completo que expõe trilhas de aprendizado, gera desafios de código e emite certificados de conclusão, tudo integrado ao agente Bob AI.

---

_Última atualização: 2025 · Projeto Educacional DIO_
