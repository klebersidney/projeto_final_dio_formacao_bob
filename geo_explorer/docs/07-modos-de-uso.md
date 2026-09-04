# 07 · Modos de Uso

## Pré-requisitos

Antes de usar o projeto, garanta que:

```bash
# 1. Dependências do servidor MCP compiladas
cd geo_explorer/mcp
npm install
npm run build

# 2. Servidor registrado no Bob AI (mcp.json)
# Veja seção "Configurar no Bob AI" abaixo

# 3. Python e pytest instalados (para testes)
pip install pytest pytest-cov
```

---

## Modo 1: Comandos Slash no Bob AI

O modo mais simples — não requer servidor MCP rodando.  
Basta ter o Bob AI instalado com o projeto aberto.

### `/trilha` — Consultar plano de estudos

```
/trilha java
/trilha python
/trilha javascript
/trilha react
/trilha devops
```

**Exemplo de sessão real:**

```
Você: /trilha python

Bob: # 🎓 Trilha: Python Developer

**Nível:** Iniciante ao Avançado
**Duração total:** 100 horas
**Descrição:** Aprenda Python desde os fundamentos até aplicações avançadas...

---

## 📚 Módulos da Trilha

### Módulo 1 – Python Básico
- Sintaxe e tipos de dados
- Listas, tuplas, dicionários e sets
- Funções e módulos
- Tratamento de exceções

### Módulo 2 – Programação Orientada a Objetos
...

> 💡 Ao concluir todos os módulos, use o comando `/certificado` para gerar
> seu certificado de conclusão!
```

---

### `/desafio` — Gerar desafio de código

```
/desafio java iniciante
/desafio python intermediário
/desafio javascript avançado
/desafio                       ← Bob perguntará qual tecnologia e nível
```

**Exemplo de sessão real:**

```
Você: /desafio java intermediário

Bob: # ⚡ Desafio de Código

**Tecnologia:** Java
**Nível:** Intermediário
**Tempo sugerido:** 30 minutos

---

## 📋 Descrição do Desafio

Implemente um sistema de gerenciamento de biblioteca com operações CRUD...

## 🎯 Requisitos
- Criar classe Livro com ISBN, título, autor e disponibilidade
- Implementar busca por título e por autor com Stream API
...

> Quando terminar, cole seu código aqui no chat para eu revisar! 🚀
```

**Dica:** Após o desafio, você pode colar seu código no chat e pedir ao Bob para revisar:

```
Você: [cola o código aqui]

Você: Bob, pode revisar meu código? Verifique boas práticas e sugira melhorias.
```

---

### `/certificado` — Gerar certificado de conclusão

```
/certificado João Silva java
/certificado Maria Aparecida dos Santos python
/certificado Ana Costa react
```

**Regra:** tudo antes da última palavra = nome; última palavra = trilha

**Exemplo de sessão real:**

```
Você: /certificado Maria Silva devops

Bob: ╔══════════════════════════════════════════════════════════════════╗
     ║              D I G I T A L   I N N O V A T I O N   O N E        ║
     ╚══════════════════════════════════════════════════════════════════╝

     # 🏅 CERTIFICADO DE CONCLUSÃO

     ## MARIA SILVA

     *concluiu com êxito a trilha de aprendizado*

     # 🎓 DevOps Engineer

     **Conteúdo abordado:**
     - ✅ Módulo 1: Linux e Shell Script
     - ✅ Módulo 2: Docker e Containers
     - ✅ Módulo 3: Kubernetes
     - ✅ Módulo 4: CI/CD Pipelines
     - ✅ Módulo 5: Infraestrutura como Código

     | Data de Emissão | 14/07/2025 |
     | Código | DIO-2025ABCD1234 |
```

---

## Modo 2: Ferramentas MCP com linguagem natural

Quando o servidor MCP estiver configurado e rodando, o Bob usará as ferramentas automaticamente ao detectar a intenção na conversa.

### Configurar o servidor no Bob AI

No arquivo `mcp.json` do workspace (`.bob/mcp.json`):

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

### Exemplos com linguagem natural

**Listar trilhas:**
```
Você: Quais trilhas de IA estão disponíveis?

Bob: [invoca listar_trilhas() automaticamente]

## 📚 Trilhas DIO – 20 resultado(s)

**[1]** LLM01 - Injeção de Prompt: Fundamentos e Defesas
  ↳ Python / LangChain | Iniciante | 1200 XP | 6 módulos

**[2]** LLM02 - Tratamento Inseguro de Saída
  ↳ JavaScript / Node.js | Intermediário | 1800 XP | 8 módulos
...
```

**Filtrar por nível:**
```
Você: Mostre apenas trilhas para iniciantes

Bob: [invoca listar_trilhas(nivel="Iniciante")]
```

**Filtrar por tecnologia:**
```
Você: Tem alguma trilha que usa Python?

Bob: [invoca listar_trilhas(tecnologia="Python")]
```

**Ver trilha completa:**
```
Você: Me mostre os detalhes da trilha de id 7

Bob: [invoca ver_trilha(id=7)]

# 🎓 Trilha: LLM07 - Design de Agentes Inseguros

**Nível:** Avançado
**XP Total:** 3000 XP

## 🏅 Badges
  🤖 **Agent Architect** (Raro)
  👤 **Human-in-the-Loop** (Épico)
  ⚡ **Autonomous Guardian** (Lendário)

## 💰 Promoções
**Promoção:** 30% off com código `AGENT30` até 2025-08-31
```

**Gerar desafio via MCP:**
```
Você: Quero um desafio de Python nível avançado

Bob: [invoca gerar_desafio(tecnologia="python", nivel="avancado")]

# ⚡ Desafio de Código
**Tempo sugerido:** 60 minutos

## Pipeline de ML com scikit-learn e MLflow
...
```

**Emitir certificado via MCP:**
```
Você: Emita um certificado para "João Silva" na trilha 3

Bob: [invoca gerar_certificado(nome="João Silva", id_trilha=3)]
```

**Ver estatísticas:**
```
Você: Quantas trilhas existem na plataforma? Qual o XP total?

Bob: [invoca estatisticas()]

## 📊 Estatísticas da Plataforma DIO

| Total de Trilhas | 20 |
| XP Total | 40.000 XP |
| Total de Badges | 50+ |
```

---

## Modo 3: Servidor HTTP/SSE (remoto)

Para integrações via API REST ou acesso de múltiplos usuários.

```bash
# Iniciar servidor
$env:MCP_API_KEY="meu_token_secreto"
$env:PORT="3000"
node geo_explorer/mcp/build/http-server.js

# Verificar saúde
curl http://localhost:3000/health

# Conectar no Bob (mcp.json)
# "url": "http://localhost:3000/sse",
# "headers": { "Authorization": "Bearer meu_token_secreto" }
```

---

## Modo 4: Executar Testes

```bash
# Todos os 99 testes
python -m pytest geo_explorer/tests/test_commands.py -v

# Com cobertura
python -m pytest geo_explorer/tests/test_commands.py -v --cov=geo_explorer.tests.core

# Apenas um bloco
python -m pytest geo_explorer/tests/test_commands.py::TestGerarCertificado -v
```

---

## Fluxo de Aprendizado Recomendado

```
1. /trilha java          → estude o plano de estudos
        ↓
2. /desafio java iniciante   → pratique com um desafio
        ↓
3. [cole seu código no chat] → receba feedback do Bob
        ↓
4. /desafio java intermediário  → próximo nível
        ↓
5. /desafio java avancado      → desafio avançado
        ↓
6. /certificado Seu Nome java  → comemore! 🎉
```

---

## Combinações Avançadas de Uso

### Comparar trilhas
```
Você: Compare as trilhas de Java e Python. Qual é mais longa?
      Mostre detalhes de ambas usando as ferramentas disponíveis.
```

### Plano de estudo personalizado
```
Você: Sou iniciante em programação. Qual trilha você recomenda?
      Depois me dê um desafio de aquecimento para a trilha recomendada.
```

### Sessão de review de código
```
Você: /desafio python intermediário

[Bob gera desafio]

Você: [código Python]
def api_task_manager():
    tasks = []
    ...

Você: Revise este código. Siga as boas práticas do FastAPI e sugira melhorias.
```

---

_[← Anterior: Testes](./06-testes.md) · [Próximo: Dicas & Insights →](./08-dicas-e-insights.md)_
