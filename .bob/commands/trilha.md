---
description: Exibe o plano de estudo formatado de uma trilha da DIO
argument-hint: <tecnologia>
---

O usuário quer consultar o plano de estudo da trilha de **$ARGUMENTS** disponível neste projeto.

Siga os passos abaixo:

1. Leia o arquivo `geo_explorer/data/trilhas_dio_comandos.json` localizado na raiz do projeto.
2. Procure pela trilha cujo nome de chave corresponda a **$ARGUMENTS** (faça a busca de forma case-insensitive, por exemplo: "JavaScript", "javascript" e "JAVASCRIPT" devem ser tratados da mesma forma).
3. Se a trilha for encontrada, formate e exiba o plano de estudo com o seguinte layout em Markdown:

---

# 🎓 Trilha: {nome da trilha}

**Nível:** {nivel}  
**Duração total:** {duracao}  
**Descrição:** {descricao}

---

## 📚 Módulos da Trilha

### Módulo 1 – {titulo do módulo 1}
- {topico 1}
- {topico 2}
- {topico 3}
- {topico 4}

### Módulo 2 – {titulo do módulo 2}
...e assim por diante para todos os módulos.

---

> 💡 **Dica:** Ao concluir todos os módulos, use o comando `/certificado` para gerar seu certificado de conclusão!

---

4. Se a tecnologia informada **não existir** no arquivo, exiba uma mensagem amigável listando as trilhas disponíveis no JSON e sugira que o usuário tente novamente com um dos nomes disponíveis.
