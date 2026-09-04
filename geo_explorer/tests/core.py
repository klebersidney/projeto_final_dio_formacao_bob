"""
core.py – Lógica de negócio dos comandos /trilha, /desafio e /certificado.
Centraliza as regras de cada comando para facilitar testes unitários.
"""

from __future__ import annotations

import json
import random
import re
import string
from datetime import date
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Helpers de carregamento de dados
# ---------------------------------------------------------------------------

_DATA_DIR = Path(__file__).parent.parent / "data"
_JSON_PATH = _DATA_DIR / "trilhas_dio_comandos.json"


def load_trilhas(json_path: Path = _JSON_PATH) -> dict[str, Any]:
    """Carrega e retorna o dicionário de trilhas do arquivo JSON."""
    with open(json_path, encoding="utf-8") as fh:
        data = json.load(fh)
    return data["trilhas"]


# ---------------------------------------------------------------------------
# /trilha  – consulta plano de estudo
# ---------------------------------------------------------------------------

class TrilhaNotFoundError(KeyError):
    """Lançada quando a trilha solicitada não existe."""


def get_trilha(tecnologia: str, json_path: Path = _JSON_PATH) -> dict[str, Any]:
    """
    Retorna os dados brutos da trilha correspondente a *tecnologia*
    (busca case-insensitive).

    Raises
    ------
    TrilhaNotFoundError
        Quando a chave não existe no arquivo JSON.
    """
    trilhas = load_trilhas(json_path)
    key = tecnologia.strip().lower()
    if key not in trilhas:
        disponiveis = ", ".join(sorted(trilhas.keys()))
        raise TrilhaNotFoundError(
            f"Trilha '{tecnologia}' não encontrada. "
            f"Trilhas disponíveis: {disponiveis}."
        )
    return trilhas[key]


def formatar_trilha(tecnologia: str, json_path: Path = _JSON_PATH) -> str:
    """
    Retorna o plano de estudo formatado em Markdown para *tecnologia*.
    Levanta TrilhaNotFoundError se a trilha não existir.
    """
    dado = get_trilha(tecnologia, json_path)
    linhas: list[str] = []
    linhas.append(f"# 🎓 Trilha: {dado['nome']}")
    linhas.append("")
    linhas.append(f"**Nível:** {dado['nivel']}  ")
    linhas.append(f"**Duração total:** {dado['duracao']}  ")
    linhas.append(f"**Descrição:** {dado['descricao']}")
    linhas.append("")
    linhas.append("---")
    linhas.append("")
    linhas.append("## 📚 Módulos da Trilha")
    linhas.append("")
    for mod in dado["modulos"]:
        linhas.append(f"### Módulo {mod['numero']} – {mod['titulo']}")
        for topico in mod["topicos"]:
            linhas.append(f"- {topico}")
        linhas.append("")
    linhas.append("---")
    linhas.append("")
    linhas.append(
        "> 💡 **Dica:** Ao concluir todos os módulos, use o comando "
        "`/certificado` para gerar seu certificado de conclusão!"
    )
    return "\n".join(linhas)


# ---------------------------------------------------------------------------
# /desafio – geração de desafio de código
# ---------------------------------------------------------------------------

# Banco fixo de desafios por tecnologia × nível (usado nos testes)
_DESAFIOS: dict[str, dict[str, dict[str, Any]]] = {
    "java": {
        "iniciante": {
            "titulo": "Calculadora de IMC",
            "descricao": (
                "Crie um programa Java que leia peso e altura do usuário "
                "e calcule o IMC, exibindo a classificação."
            ),
            "requisitos": [
                "Ler peso (kg) e altura (m) via Scanner",
                "Calcular IMC = peso / (altura * altura)",
                "Exibir a classificação conforme tabela da OMS",
            ],
            "entrada": "70.0 1.75",
            "saida": "IMC: 22.86 – Peso Normal",
            "dicas": [
                "Use double para precisão decimal",
                "Utilize if/else if para classificar o resultado",
            ],
            "tempo": 15,
        },
        "intermediario": {
            "titulo": "Sistema de Estoque com ArrayList",
            "descricao": (
                "Implemente um CRUD básico de produtos usando ArrayList<Produto>."
            ),
            "requisitos": [
                "Criar classe Produto com id, nome e preco",
                "Implementar adicionar, listar, buscar por id e remover",
                "Tratar produto não encontrado com exceção customizada",
            ],
            "entrada": "ADD Notebook 3500.00",
            "saida": "Produto adicionado: Notebook (R$ 3500.00)",
            "dicas": [
                "Use Stream API para buscar por id",
                "Prefira Optional<Produto> ao retornar resultados",
            ],
            "tempo": 30,
        },
        "avancado": {
            "titulo": "Microsserviço de autenticação JWT com Spring Boot",
            "descricao": (
                "Desenvolva um endpoint REST de login que valide credenciais "
                "e retorne um token JWT assinado."
            ),
            "requisitos": [
                "Endpoint POST /auth/login recebe JSON {username, password}",
                "Validar credenciais em banco H2 via Spring Data JPA",
                "Retornar token JWT com expiração de 1 hora",
                "Implementar filtro de autenticação em rotas protegidas",
            ],
            "entrada": '{"username":"user","password":"pass"}',
            "saida": '{"token":"eyJhbGci..."}',
            "dicas": [
                "Use io.jsonwebtoken (JJWT) para gerar o token",
                "Configure Spring Security para liberar /auth/login",
            ],
            "tempo": 60,
        },
    }
}

_NIVEIS_TEMPO = {"iniciante": 15, "intermediario": 30, "avancado": 60}


def gerar_desafio(tecnologia: str, nivel: str) -> dict[str, Any]:
    """
    Retorna um dicionário com os dados do desafio para *tecnologia* e *nivel*.
    Normaliza o nível removendo acentos para comparação.

    Raises
    ------
    ValueError
        Quando tecnologia ou nível não estão disponíveis.
    """
    tec_key = tecnologia.strip().lower()
    nivel_norm = (
        nivel.strip()
        .lower()
        .replace("á", "a")
        .replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u")
        .replace("â", "a")
        .replace("ê", "e")
        .replace("ô", "o")
        .replace("ã", "a")
        .replace("õ", "o")
        .replace("ç", "c")
    )

    if tec_key not in _DESAFIOS:
        raise ValueError(
            f"Tecnologia '{tecnologia}' não possui banco de desafios. "
            f"Disponíveis: {', '.join(_DESAFIOS.keys())}."
        )
    niveis = _DESAFIOS[tec_key]
    if nivel_norm not in niveis:
        raise ValueError(
            f"Nível '{nivel}' inválido. Disponíveis: {', '.join(niveis.keys())}."
        )
    return niveis[nivel_norm]


def formatar_desafio(tecnologia: str, nivel: str) -> str:
    """Retorna o desafio formatado em Markdown."""
    dado = gerar_desafio(tecnologia, nivel)
    tempo = dado["tempo"]
    linhas: list[str] = [
        "# ⚡ Desafio de Código",
        "",
        f"**Tecnologia:** {tecnologia.capitalize()}  ",
        f"**Nível:** {nivel.capitalize()}  ",
        f"**Tempo sugerido:** {tempo} minutos",
        "",
        "---",
        "",
        "## 📋 Descrição do Desafio",
        "",
        dado["descricao"],
        "",
        "## 🎯 Requisitos",
        "",
    ]
    for req in dado["requisitos"]:
        linhas.append(f"- {req}")
    linhas += [
        "",
        "## 📥 Entrada Esperada",
        "",
        f"```\n{dado['entrada']}\n```",
        "",
        "## 📤 Saída Esperada",
        "",
        f"```\n{dado['saida']}\n```",
        "",
        "## 💡 Dicas",
        "",
    ]
    for dica in dado["dicas"]:
        linhas.append(f"- {dica}")
    linhas += [
        "",
        "## 🏆 Critérios de Avaliação",
        "",
        "- [ ] O código resolve o problema corretamente",
        "- [ ] O código está limpo e legível",
        "- [ ] Boas práticas da linguagem foram seguidas",
        "",
        "---",
        "",
        "> Quando terminar, cole seu código aqui no chat para eu revisar e dar feedback! 🚀",
    ]
    return "\n".join(linhas)


# ---------------------------------------------------------------------------
# /certificado – geração de certificado
# ---------------------------------------------------------------------------

def _gerar_codigo(ano: int, seed: int | None = None) -> str:
    """Gera código único DIO-{ANO}{8 chars aleatórios maiúsculos}."""
    chars = string.ascii_uppercase + string.digits
    rng = random.Random(seed)
    parte_aleatoria = "".join(rng.choices(chars, k=8))
    return f"DIO-{ano}{parte_aleatoria}"


def gerar_certificado(
    nome: str,
    tecnologia: str,
    data_emissao: date | None = None,
    seed: int | None = None,
    json_path: Path = _JSON_PATH,
) -> str:
    """
    Gera e retorna o certificado de conclusão em Markdown.

    Raises
    ------
    TrilhaNotFoundError
        Quando a trilha não existe no JSON.
    """
    dado = get_trilha(tecnologia, json_path)
    hoje = data_emissao or date.today()
    codigo = _gerar_codigo(hoje.year, seed)

    modulos_txt = "\n".join(
        f"- ✅ Módulo {m['numero']}: {m['titulo']}" for m in dado["modulos"]
    )

    return f"""\
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║              D I G I T A L   I N N O V A T I O N   O N E        ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

# 🏅 CERTIFICADO DE CONCLUSÃO

---

*A Digital Innovation One certifica que*

## {nome.upper()}

*concluiu com êxito a trilha de aprendizado*

# 🎓 {dado['nome']}

---

**Conteúdo abordado:**
{modulos_txt}

---

| | |
|---|---|
| **Carga Horária Total** | {dado['duracao']} |
| **Nível** | {dado['nivel']} |
| **Data de Emissão** | {hoje.strftime('%d/%m/%Y')} |
| **Código do Certificado** | {codigo} |

---

*"O aprendizado é a única coisa que a mente nunca esgota, nunca teme e nunca lamenta."*
*— Leonardo da Vinci*

---

> 🔒 **Nota:** Este é um certificado fictício gerado para fins de estudo e prática com o Bob AI.
> Para certificados oficiais, acesse [dio.me](https://www.dio.me).
"""
