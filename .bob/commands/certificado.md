---
description: Gera um certificado fictício de conclusão de trilha em Markdown
argument-hint: <seu-nome> <trilha>
---

O usuário quer gerar um certificado de conclusão. Os argumentos fornecidos são: **$ARGUMENTS**

Interprete os argumentos da seguinte forma:
- Tudo antes da última palavra é o **nome do usuário**
- A última palavra é a **trilha concluída**

Se os argumentos não estiverem claros, pergunte:
1. Qual é o seu nome completo?
2. Qual trilha você concluiu?

Com base nas informações fornecidas, gere o certificado fictício abaixo em Markdown. Leia o arquivo `geo_explorer/data/trilhas_dio_comandos.json` para obter o nome oficial da trilha correspondente à tecnologia informada.

---

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║              D I G I T A L   I N N O V A T I O N   O N E        ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

# 🏅 CERTIFICADO DE CONCLUSÃO

---

*A Digital Innovation One certifica que*

## {NOME DO USUÁRIO EM MAIÚSCULAS}

*concluiu com êxito a trilha de aprendizado*

# 🎓 {Nome oficial da trilha}

---

**Conteúdo abordado:**
- ✅ Módulo 1: {título do módulo 1 da trilha do JSON}
- ✅ Módulo 2: {título do módulo 2 da trilha do JSON}
- ✅ Módulo 3: {título do módulo 3 da trilha do JSON}
- ✅ Módulo 4: {título do módulo 4 da trilha do JSON}
- ✅ Módulo 5: {título do módulo 5 da trilha do JSON}

---

| | |
|---|---|
| **Carga Horária Total** | {duracao da trilha do JSON} |
| **Nível** | {nivel da trilha do JSON} |
| **Data de Emissão** | {data atual no formato DD/MM/AAAA} |
| **Código do Certificado** | DIO-{ANO}{HASH aleatório de 8 caracteres maiúsculos} |

---

*"O aprendizado é a única coisa que a mente nunca esgota, nunca teme e nunca lamenta."*  
*— Leonardo da Vinci*

---

> 🔒 **Nota:** Este é um certificado fictício gerado para fins de estudo e prática com o Bob AI.  
> Para certificados oficiais, acesse [dio.me](https://www.dio.me).

---

**Regras de geração:**
- Use o arquivo `geo_explorer/data/trilhas_dio_comandos.json` para preencher os títulos dos módulos, duração e nível da trilha corretamente
- Se a trilha não existir no JSON, informe quais trilhas estão disponíveis
- O código do certificado deve ser único: combine o ano atual + 8 caracteres alfanuméricos aleatórios maiúsculos
- A data de emissão deve ser a data de hoje
- Formate o certificado de forma visualmente bonita e profissional em Markdown
