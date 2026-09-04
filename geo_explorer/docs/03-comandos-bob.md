# 03 · Comandos Bob (Prompts e Slash Commands)

## O que são Comandos Slash?

Comandos slash são atalhos de texto que ativam comportamentos pré-definidos no Bob AI. Eles são definidos em arquivos Markdown na pasta `.bob/commands/` e funcionam como **prompts estruturados**: quando o usuário digita `/trilha java`, o Bob lê o arquivo `trilha.md`, substitui `$ARGUMENTS` por `"java"` e segue as instruções do prompt.

---

## Como Funcionam Tecnicamente

```
Usuário digita: /trilha python
        │
        ▼
Bob AI lê: .bob/commands/trilha.md
        │
        ▼
Substitui $ARGUMENTS → "python"
        │
        ▼
Executa as instruções do prompt:
  1. Lê geo_explorer/data/trilhas_dio_comandos.json
  2. Localiza a chave "python"
  3. Formata e exibe o plano de estudos
```

### Anatomia de um arquivo de comando

```markdown
---
description: Texto exibido no menu de comandos do Bob
argument-hint: <dica dos argumentos esperados>
---

Instruções em linguagem natural para o Bob AI.
$ARGUMENTS será substituído pelo que o usuário digitou.
```

---

## Comando `/trilha`

**Arquivo:** [`.bob/commands/trilha.md`](../../.bob/commands/trilha.md)

**Uso:**
```
/trilha <tecnologia>
```

**Tecnologias disponíveis:** `javascript`, `python`, `react`, `java`, `devops`

**Exemplos:**
```
/trilha java
/trilha Python
/trilha JAVASCRIPT
/trilha devops
```

**O que o prompt instrui o Bob a fazer:**
1. Ler `geo_explorer/data/trilhas_dio_comandos.json`
2. Buscar a trilha pela chave (case-insensitive)
3. Formatar e exibir em Markdown com:
   - Nome da trilha, nível, duração e descrição
   - Todos os módulos com seus tópicos numerados
   - Dica ao final sugerindo o `/certificado`
4. Se a tecnologia não existir, listar as disponíveis

**Saída esperada:**
```markdown
# 🎓 Trilha: Java Developer

**Nível:** Intermediário ao Avançado
**Duração total:** 120 horas
**Descrição:** Domine Java com Spring Boot...

---

## 📚 Módulos da Trilha

### Módulo 1 – Java Fundamentals
- Tipos de dados, operadores e controle de fluxo
- POO: classes, herança e polimorfismo
...
```

**Conteúdo completo do prompt:**
```markdown
---
description: Exibe o plano de estudo formatado de uma trilha da DIO
argument-hint: <tecnologia>
---

O usuário quer consultar o plano de estudo da trilha de **$ARGUMENTS**
disponível neste projeto.

Siga os passos abaixo:

1. Leia o arquivo `geo_explorer/data/trilhas_dio_comandos.json` localizado
   na raiz do projeto.
2. Procure pela trilha cujo nome de chave corresponda a **$ARGUMENTS**
   (faça a busca de forma case-insensitive).
3. Se a trilha for encontrada, formate e exiba o plano de estudo...
4. Se a tecnologia informada não existir, exiba uma mensagem amigável
   listando as trilhas disponíveis.
```

---

## Comando `/desafio`

**Arquivo:** [`.bob/commands/desafio.md`](../../.bob/commands/desafio.md)

**Uso:**
```
/desafio <tecnologia> <nivel>
```

**Tecnologias:** `javascript`, `python`, `react`, `java`, `devops`  
**Níveis:** `iniciante`, `intermediário`, `avançado`  
**Tempos sugeridos:** Iniciante = 15 min | Intermediário = 30 min | Avançado = 60 min

**Exemplos:**
```
/desafio java iniciante
/desafio python intermediário
/desafio javascript avançado
/desafio              ← o Bob perguntará tecnologia e nível
```

**O que o prompt instrui o Bob a fazer:**
- Interpretar o primeiro argumento como tecnologia
- Interpretar o segundo como nível
- Se nenhum argumento for informado, perguntar ao usuário
- Criar um desafio **original e criativo** (não fixo, gerado pelo LLM) seguindo o template
- Variar os desafios a cada invocação

**Template de saída:**
```markdown
# ⚡ Desafio de Código

**Tecnologia:** Java
**Nível:** Iniciante
**Tempo sugerido:** 15 minutos

---

## 📋 Descrição do Desafio
{problema a resolver}

## 🎯 Requisitos
- Requisito 1
- Requisito 2

## 📥 Entrada Esperada
```
{exemplo de entrada}
```

## 📤 Saída Esperada
```
{saída esperada}
```

## 💡 Dicas
- Dica relevante

## 🏆 Critérios de Avaliação
- [ ] O código resolve o problema corretamente
- [ ] O código está limpo e legível
- [ ] Boas práticas da linguagem foram seguidas
```

**Regras de geração por nível:**
| Nível | Características |
|-------|----------------|
| **Iniciante** | Lógica simples, strings, arrays básicos, funções simples |
| **Intermediário** | Estruturas de dados, paradigmas da linguagem, APIs simuladas |
| **Avançado** | Design patterns, performance, arquitetura, algoritmos complexos |

---

## Comando `/certificado`

**Arquivo:** [`.bob/commands/certificado.md`](../../.bob/commands/certificado.md)

**Uso:**
```
/certificado <seu-nome> <trilha>
```

**Exemplos:**
```
/certificado João Silva java
/certificado Maria Aparecida dos Santos python
/certificado Ana Costa react
```

**Regra de interpretação dos argumentos:**
- Tudo **antes da última palavra** = nome do usuário
- A **última palavra** = trilha concluída

**O que o prompt instrui o Bob a fazer:**
1. Interpretar o nome e a trilha dos argumentos
2. Se os argumentos não estiverem claros, perguntar nome e trilha separadamente
3. Ler `geo_explorer/data/trilhas_dio_comandos.json` para obter dados oficiais da trilha
4. Gerar o certificado seguindo o template ASCII + Markdown

**Template do certificado:**
```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║              D I G I T A L   I N N O V A T I O N   O N E        ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

# 🏅 CERTIFICADO DE CONCLUSÃO

*A Digital Innovation One certifica que*

## JOÃO SILVA

*concluiu com êxito a trilha de aprendizado*

# 🎓 Java Developer

---

**Conteúdo abordado:**
- ✅ Módulo 1: Java Fundamentals
- ✅ Módulo 2: Java Moderno (8+)
...

| Data de Emissão | 14/07/2025 |
| Código | DIO-2025XXXXXXXX |
```

**Regras do certificado:**
- Títulos dos módulos extraídos diretamente do JSON (dados reais)
- Código único: `DIO-{ANO}{8 chars alfanuméricos aleatórios maiúsculos}`
- Data = data atual no momento da geração
- Se a trilha não existir no JSON, listar as disponíveis

---

## Comparação: Comandos Slash vs Ferramentas MCP

| Característica | Comandos Slash | Ferramentas MCP |
|----------------|---------------|-----------------|
| **Ativação** | `/trilha java` | Linguagem natural |
| **Implementação** | Prompt Markdown | TypeScript `server.tool()` |
| **Criatividade** | Alta (LLM gera conteúdo) | Determinística (dados fixos) |
| **Dados usados** | `trilhas_dio_comandos.json` | `trilhas_dio.json` |
| **Badges/XP** | Não | Sim |
| **Promoções/Lives** | Não | Sim |
| **Sem servidor** | Sim (só Bob) | Não (requer MCP rodando) |

---

## Dicas para Escrever Bons Prompts de Comando

1. **Seja explícito sobre o arquivo a ler** — sempre referencie o caminho exato
2. **Defina o formato de saída** — mostre o template esperado no Markdown
3. **Trate erros no prompt** — instrua o Bob sobre o que fazer se o input for inválido
4. **Use case-insensitive** — sempre instrua busca sem distinção de maiúsculas
5. **Guie com passos numerados** — o Bob segue melhor instruções sequenciais
6. **Inclua `argument-hint`** — aparece no menu de ajuda do Bob

---

_[← Anterior: Estrutura](./02-estrutura-projeto.md) · [Próximo: Servidor MCP →](./04-servidor-mcp.md)_
