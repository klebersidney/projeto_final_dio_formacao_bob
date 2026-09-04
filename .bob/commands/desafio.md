---
description: Gera um desafio de código aleatório baseado na tecnologia e nível escolhidos
argument-hint: <tecnologia> <nivel>
---

O usuário quer um desafio de código. Os argumentos fornecidos são: **$ARGUMENTS**

Interprete os argumentos da seguinte forma:
- O primeiro argumento é a **tecnologia** (ex: javascript, python, react, java, devops)
- O segundo argumento é o **nível** (ex: iniciante, intermediário, avançado)

Se nenhum argumento for fornecido, pergunte ao usuário qual tecnologia e nível ele deseja antes de continuar.

Com base na tecnologia e nível informados, **crie um desafio de código original e criativo** seguindo o template abaixo:

---

# ⚡ Desafio de Código

**Tecnologia:** {tecnologia}  
**Nível:** {nivel}  
**Tempo sugerido:** {X minutos dependendo do nível: Iniciante=15min, Intermediário=30min, Avançado=60min}

---

## 📋 Descrição do Desafio

{Descrição clara e objetiva do problema a ser resolvido. O desafio deve ser realista e relevante para a tecnologia escolhida.}

## 🎯 Requisitos

- {Requisito 1}
- {Requisito 2}
- {Requisito 3}
- {Requisito adicional se avançado}

## 📥 Entrada Esperada

```
{Exemplo de entrada, se aplicável}
```

## 📤 Saída Esperada

```
{Exemplo de saída esperada}
```

## 💡 Dicas

- {Dica 1 relevante para o nível}
- {Dica 2}

## 🏆 Critérios de Avaliação

- [ ] O código resolve o problema corretamente
- [ ] O código está limpo e legível
- [ ] Boas práticas da linguagem foram seguidas
- {Critério extra para nível avançado, se aplicável}

---

> Quando terminar, cole seu código aqui no chat para eu revisar e dar feedback! 🚀

---

**Regras para geração do desafio:**
- Nível **iniciante**: problemas simples de lógica, manipulação de strings, arrays básicos, funções simples
- Nível **intermediário**: algoritmos com complexidade moderada, uso de estruturas de dados, paradigmas da linguagem, consumo de APIs simuladas
- Nível **avançado**: design patterns, otimização de performance, arquitetura de código, problemas complexos de algoritmos
- Seja criativo e varie os tipos de desafio a cada invocação (não repita sempre o mesmo problema)
