# 08 · Dicas, Boas Práticas e Insights

> Este documento é dirigido a futuros profissionais que estudarão ou estenderão este projeto.
> Ele reúne lições aprendidas, padrões aplicados, armadilhas evitadas e visão de mercado.

---

## Sobre o Projeto e o que ele Ensina

Este projeto não é apenas um "servidor MCP que lista trilhas". Ele é um **estudo de caso** sobre como construir sistemas de IA assistida de forma estruturada, testável e extensível. Cada decisão de design tem uma razão — e entender o "porquê" é mais valioso do que copiar o "como".

---

## 1. MCP: o Protocolo que Muda o Jogo

### O que é MCP na prática

O **Model Context Protocol** é para agentes de IA o que REST é para aplicações web: um contrato de comunicação padronizado. Antes do MCP, cada integração de IA com ferramentas externas era feita de forma proprietária. Com MCP, qualquer cliente (Bob, Claude Desktop, IDEs) pode se conectar a qualquer servidor MCP.

### Por que isso importa para sua carreira

```
Sem MCP:  LLM + ferramentas = integração customizada para cada par
Com MCP:  LLM + ferramentas = uma vez, funciona em qualquer cliente MCP
```

Dominar MCP hoje é equivalente a ter dominado REST em 2010 — cedo o suficiente para ser diferencial de mercado.

### Dica prática

> Sempre implemente seus servidores MCP com **dois transportes**: stdio (para clientes locais) e HTTP/SSE (para acesso remoto). O custo de implementar os dois é baixo, mas a flexibilidade é enorme. Este projeto demonstra exatamente esse padrão em [`index.ts`](../mcp/src/index.ts) e [`http-server.ts`](../mcp/src/http-server.ts).

---

## 2. Validação com Zod: Nunca Confie na Entrada

Um dos padrões mais importantes do projeto está no uso do [Zod](https://zod.dev/) para validar parâmetros das ferramentas MCP:

```typescript
// ❌ Sem validação — vulnerável a inputs inesperados
server.tool("gerar_desafio", {}, async ({ tecnologia, nivel }) => {
  // tecnologia pode ser undefined, null, número...
})

// ✅ Com Zod — tipo garantido em runtime
server.tool("gerar_desafio", {
  tecnologia: z.enum(["java", "python", "javascript"]),
  nivel:      z.enum(["iniciante", "intermediario", "avancado"]),
}, async ({ tecnologia, nivel }) => {
  // tecnologia É string, É um dos valores válidos, garantido
})
```

**Insight:** Em sistemas de IA, a validação de entrada é duplamente importante — você recebe dados parseados pelo LLM, que pode interpretar "avançado" como "advanced", "Avançado", ou qualquer variação. Use `z.enum()` para limitar as possibilidades.

---

## 3. Erros Customizados: Diagnosticabilidade

O projeto usa `TrilhaNotFoundError` em vez de lançar `Error` genérico:

```typescript
// ❌ Genérico — difícil de diferenciar no catch
throw new Error("Trilha não encontrada")

// ✅ Customizado — catch seletivo, mensagens ricas
export class TrilhaNotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "TrilhaNotFoundError"
  }
}
```

**Insight:** Em Python, a suite de testes valida `pytest.raises(TrilhaNotFoundError)` — isso só funciona porque o erro é um tipo específico. Erros customizados tornam os testes mais precisos e o debugging mais rápido.

---

## 4. Cache em Memória: Simples e Eficaz

```typescript
let _cache: TrilhasDatabase | null = null;

export function loadDatabase(forceReload = false): TrilhasDatabase {
  if (_cache && !forceReload) return _cache;
  _cache = JSON.parse(readFileSync(jsonPath, "utf-8"));
  return _cache;
}
```

Este padrão simples evita leituras desnecessárias de disco a cada chamada de ferramenta. Para um servidor MCP que pode receber dezenas de requisições por sessão, essa diferença é significativa.

**Quando usar:** sempre que seus dados são estáticos (ou raramente atualizados) e carregá-los tem custo mensurável.

**Quando NÃO usar:** dados que mudam frequentemente ou que têm TTL (use Redis, cache distribuído, etc.).

---

## 5. Resolução de Caminhos Robusta

O `data-loader.ts` usa uma lista de candidatos para encontrar o JSON:

```typescript
const candidates = [
  join(__dirname, "..", "..", "geo_explorer", "data", "trilhas_dio.json"),
  join(__dirname, "..", "..", "..", "geo_explorer", "data", "trilhas_dio.json"),
  process.env["TRILHAS_JSON_PATH"] ?? "",
]
```

**Por que não hardcodar o caminho?**  
O servidor pode ser executado de diferentes diretórios de trabalho, empacotado como npm package global, ou rodado dentro de um container. Hardcodar caminhos absolutos quebra em qualquer ambiente diferente do original.

**Padrão de ouro:**
1. Tente caminhos relativos conhecidos (múltiplos candidatos)
2. Permita override via variável de ambiente
3. Falhe com mensagem clara se nenhum funcionar

---

## 6. Dois JSONs em Vez de Um: Decisão Conscienciosa

O projeto usa dois arquivos de dados com formatos diferentes:
- `trilhas_dio.json` — array rico para o MCP TypeScript
- `trilhas_dio_comandos.json` — dicionário simples para comandos Bob

**Por que não unificar?**

Porque os dois têm **propósitos e consumidores diferentes**:
- O MCP precisa de ids numéricos para filtragem, badges para exibição, XP para gamificação
- Os comandos Bob precisam de chave de texto para busca case-insensitive simples

Forçar um único formato prejudicaria um dos dois casos. A decisão de manter ambos é um exemplo de **evolução incremental** — o primeiro formato existia, o segundo foi adicionado sem quebrar nada.

**Insight profissional:** Em projetos reais, você encontrará situações assim o tempo todo. A solução correta raramente é "reescrever tudo" — é "adicionar o que falta sem quebrar o que funciona".

---

## 7. Prompts como Contratos (Prompt Engineering)

Os arquivos `.bob/commands/*.md` são, na essência, **contratos comportamentais** para o LLM. Bons prompts de comando têm:

```markdown
---
description: Uma linha descritiva                   ← apareça no /help
argument-hint: <arg1> <arg2>                         ← mostre como usar
---

Instrução de papel                                   ← diga QUEM o LLM é
Instrução de tarefa                                  ← diga O QUE fazer
Instrução de formato                                 ← diga COMO formatar
Instrução de erro                                    ← diga O QUE fazer se falhar
```

**Armadilha comum:** Prompts vagos como "explique a trilha" produzem saídas inconsistentes. Prompts com template explícito (como os deste projeto) produzem saídas previsíveis e testáveis.

**Insight:** Tratar prompts como código — versionados, revisados, testados — é uma das principais competências de engenheiro de IA em 2025.

---

## 8. Testes como Documentação Viva

A suite de testes Python deste projeto tem uma propriedade rara: ela documenta o **comportamento esperado** de cada função melhor do que qualquer comentário:

```python
@pytest.mark.parametrize("entrada", ["JAVA", "Java", "jAvA"])
def test_case_insensitive(self, entrada: str, json_path: Path):
    saida = formatar_trilha(entrada, json_path)
    assert "Java Developer" in saida
```

Lendo este teste, você aprende:
1. A função `formatar_trilha` aceita strings em qualquer capitalização
2. O resultado sempre contém "Java Developer" para entrada "java"
3. Isso é garantido e testado — não é um "achismo"

**Dica:** Quando encontrar código sem testes, escreva os testes primeiro antes de modificar. Os testes revelam o comportamento real, não o presumido.

---

## 9. Separação de Responsabilidades (SRP)

O MCP server está dividido em 4 arquivos com responsabilidades claras:

| Arquivo | Responsabilidade | Não faz |
|---------|-----------------|---------|
| `data-loader.ts` | Carrega dados do JSON | Não formata, não valida regras de negócio |
| `core.ts` | Lógica de negócio | Não sabe de stdio nem HTTP |
| `index.ts` | Transporte stdio | Não implementa lógica — delega para core |
| `http-server.ts` | Transporte HTTP | Não implementa lógica — delega para core |

**Por que isso importa:** Se você precisar mudar o formato do JSON, muda **só** `data-loader.ts`. Se precisar mudar como o certificado é formatado, muda **só** `core.ts`. Sem essa separação, qualquer mudança é um risco de efeitos colaterais.

---

## 10. Autenticação Bearer Token: Base para SSO

O middleware de autenticação em `http-server.ts` é intencionalmente simples:

```typescript
if (token !== API_KEY) {
  res.status(401).json({ error: "Unauthorized" })
  return
}
```

Mas está preparado para evolução:

```typescript
// Para SSO/OAuth2 no futuro:
// Substitua a comparação direta por validação JWT:
const decoded = jwt.verify(token, process.env.SSO_PUBLIC_KEY!, { algorithms: ["RS256"] })
```

**Padrão:** Comece simples, mas projete para expansão. O `API_KEY` é a versão "v1" — a estrutura já suporta a "v2" com JWT sem precisar refatorar o fluxo principal.

---

## 11. Insights para a Carreira

### O que este projeto demonstra no portfólio

Quando mostrar este projeto em entrevistas ou LinkedIn, enfatize:

1. **Conhecimento de MCP** — pouquíssimos profissionais têm experiência prática com o protocolo
2. **Dual transport** — você implementou stdio E HTTP/SSE, demonstrando conhecimento do ecossistema
3. **TypeScript + Python** — capacidade de trabalhar em múltiplas linguagens no mesmo projeto
4. **Cobertura de testes 98 %** — demonstra disciplina e cultura de qualidade
5. **Prompt Engineering estruturado** — diferencial raro no mercado

### Tendências que este projeto toca

| Tendência | Como o projeto se conecta |
|-----------|--------------------------|
| **AI Agents** | MCP é o protocolo padrão para ferramentas de agentes |
| **LLMOps** | Separação de dados, testes de comportamento de prompts |
| **Segurança em IA** | As trilhas do `trilhas_dio.json` cobrem OWASP Top 10 LLM |
| **Developer Experience** | Comandos slash que tornam o agente mais produtivo |

### Próximos passos sugeridos

```
1. Adicionar persistência (SQLite/PostgreSQL) em vez de JSON
2. Implementar autenticação OAuth2/JWT real no http-server
3. Criar ferramenta MCP para salvar progresso do usuário
4. Adicionar webhook para notificações (ex: lembrete de live)
5. Containerizar com Docker Compose (Node.js + Redis para cache)
6. Adicionar rate limiting por IP no http-server
7. Escrever testes de integração para o servidor MCP TypeScript
8. Publicar o servidor MCP como pacote npm
```

---

## 12. Armadilhas Comuns (e Como Evitar)

| Armadilha | Sintoma | Solução |
|-----------|---------|---------|
| Hardcoding de caminhos absolutos | Funciona na sua máquina, quebra em CI/CD | Use lista de candidatos + variável de ambiente |
| JSON sem schema | Campos adicionados/removidos quebram silenciosamente | Use Zod (TS) ou Pydantic (Python) para validação |
| Testes que testam mocks, não código real | 100 % de cobertura, 0 % de confiança | Use o JSON real nas fixtures, não dummies |
| Prompts genéricos | Saídas inconsistentes a cada chamada | Inclua templates explícitos nos prompts |
| Um arquivo fazendo tudo | Código impossível de testar e manter | Separe em módulos por responsabilidade |
| `node_modules` no git | Repositório gigante, conflitos frequentes | `.gitignore` node_modules, use `npm ci` em CI |

---

## Citação Final

> *"A complexidade só se justifica quando a simplicidade não é suficiente.  
> Este projeto é simples o suficiente para aprender, mas completo o suficiente para ser real."*

Use este projeto como base. Quebre-o, estenda-o, melhore-o. O aprendizado está no processo, não no produto final.

---

_[← Anterior: Modos de Uso](./07-modos-de-uso.md) · [← Voltar ao índice](./README.md)_
