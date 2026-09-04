"""
test_commands.py
================
Suite de testes unitários para os comandos /trilha, /desafio e /certificado.

Cobertura alvo: ≥ 99 % das linhas de core.py

Execute com:
    python -m pytest tests/test_commands.py -v --tb=short
    python -m pytest tests/test_commands.py -v --cov=tests.core --cov-report=term-missing
"""

from __future__ import annotations

import json
import re
import tempfile
from datetime import date
from pathlib import Path
from unittest.mock import patch

import pytest

# ---------------------------------------------------------------------------
# Ajusta sys.path para localizar core.py quando rodado do projeto raiz
# ---------------------------------------------------------------------------
import sys
sys.path.insert(0, str(Path(__file__).parent))

from core import (
    TrilhaNotFoundError,
    _gerar_codigo,
    formatar_desafio,
    formatar_trilha,
    gerar_certificado,
    gerar_desafio,
    get_trilha,
    load_trilhas,
)


# ===========================================================================
# Fixtures
# ===========================================================================

PROJETO_ROOT = Path(__file__).parent.parent
JSON_REAL = PROJETO_ROOT / "data" / "trilhas_dio_comandos.json"


@pytest.fixture()
def json_path() -> Path:
    """Retorna o caminho real do JSON de trilhas."""
    return JSON_REAL


@pytest.fixture()
def json_invalido(tmp_path: Path) -> Path:
    """JSON sem a chave 'trilhas'."""
    p = tmp_path / "invalido.json"
    p.write_text('{"outro": {}}', encoding="utf-8")
    return p


@pytest.fixture()
def json_vazio(tmp_path: Path) -> Path:
    """JSON com 'trilhas' vazio."""
    p = tmp_path / "vazio.json"
    p.write_text('{"trilhas": {}}', encoding="utf-8")
    return p


@pytest.fixture()
def json_java_only(tmp_path: Path) -> Path:
    """JSON com apenas a trilha java (subset do real)."""
    with open(JSON_REAL, encoding="utf-8") as fh:
        data = json.load(fh)
    subset = {"trilhas": {"java": data["trilhas"]["java"]}}
    p = tmp_path / "java_only.json"
    p.write_text(json.dumps(subset, ensure_ascii=False), encoding="utf-8")
    return p


# ===========================================================================
# BLOCO 1 – load_trilhas
# ===========================================================================

class TestLoadTrilhas:
    """Testa o carregamento do JSON de trilhas."""

    def test_retorna_dicionario(self, json_path: Path):
        trilhas = load_trilhas(json_path)
        assert isinstance(trilhas, dict)

    def test_chaves_esperadas(self, json_path: Path):
        trilhas = load_trilhas(json_path)
        esperadas = {"javascript", "python", "react", "java", "devops"}
        assert esperadas.issubset(trilhas.keys())

    def test_java_tem_campos_obrigatorios(self, json_path: Path):
        trilhas = load_trilhas(json_path)
        java = trilhas["java"]
        for campo in ("nome", "nivel", "duracao", "descricao", "modulos"):
            assert campo in java, f"Campo '{campo}' ausente em java"

    def test_java_tem_cinco_modulos(self, json_path: Path):
        trilhas = load_trilhas(json_path)
        assert len(trilhas["java"]["modulos"]) == 5

    def test_arquivo_nao_encontrado(self, tmp_path: Path):
        with pytest.raises(FileNotFoundError):
            load_trilhas(tmp_path / "nao_existe.json")

    def test_json_sem_chave_trilhas(self, json_invalido: Path):
        with pytest.raises(KeyError):
            load_trilhas(json_invalido)

    def test_json_vazio_retorna_dict_vazio(self, json_vazio: Path):
        assert load_trilhas(json_vazio) == {}


# ===========================================================================
# BLOCO 2 – get_trilha
# ===========================================================================

class TestGetTrilha:
    """Testa a recuperação de trilhas individuais."""

    @pytest.mark.parametrize("nome", ["java", "JAVA", "Java", "  JAVA  "])
    def test_case_insensitive(self, nome: str, json_path: Path):
        trilha = get_trilha(nome, json_path)
        assert trilha["nome"] == "Java Developer"

    def test_javascript(self, json_path: Path):
        trilha = get_trilha("javascript", json_path)
        assert trilha["nivel"] == "Intermediário"

    def test_python(self, json_path: Path):
        trilha = get_trilha("python", json_path)
        assert "100 horas" in trilha["duracao"]

    def test_react(self, json_path: Path):
        trilha = get_trilha("react", json_path)
        assert trilha["nome"] == "React Developer"

    def test_devops(self, json_path: Path):
        trilha = get_trilha("devops", json_path)
        assert trilha["nivel"] == "Avançado"

    def test_trilha_inexistente_levanta_erro(self, json_path: Path):
        with pytest.raises(TrilhaNotFoundError):
            get_trilha("cobol", json_path)

    def test_mensagem_de_erro_lista_disponiveis(self, json_path: Path):
        with pytest.raises(TrilhaNotFoundError, match="Trilhas disponíveis"):
            get_trilha("rust", json_path)

    def test_trilha_vazia_levanta_erro(self, json_vazio: Path):
        with pytest.raises(TrilhaNotFoundError):
            get_trilha("java", json_vazio)


# ===========================================================================
# BLOCO 3 – formatar_trilha  (/trilha)
# ===========================================================================

class TestFormatarTrilha:
    """Testa a saída Markdown do comando /trilha."""

    @pytest.fixture(autouse=True)
    def trilha_java(self, json_path: Path):
        self.saida = formatar_trilha("java", json_path)

    # --- Cabeçalho ---
    def test_titulo_presente(self):
        assert "# 🎓 Trilha: Java Developer" in self.saida

    def test_nivel_presente(self):
        assert "Intermediário ao Avançado" in self.saida

    def test_duracao_presente(self):
        assert "120 horas" in self.saida

    def test_descricao_presente(self):
        assert "Spring Boot" in self.saida

    # --- Módulos ---
    def test_cinco_modulos(self):
        assert self.saida.count("### Módulo") == 5

    def test_modulo1_titulo(self):
        assert "Java Fundamentals" in self.saida

    def test_modulo2_titulo(self):
        assert "Java Moderno" in self.saida

    def test_modulo3_titulo(self):
        assert "Spring Boot" in self.saida

    def test_modulo4_titulo(self):
        assert "Microsserviços" in self.saida

    def test_modulo5_titulo(self):
        assert "Cloud e DevOps" in self.saida

    def test_topicos_como_lista(self):
        # Deve haver pelo menos 20 tópicos (5 módulos × 4 tópicos)
        assert self.saida.count("- ") >= 20

    # --- Dica final ---
    def test_dica_certificado(self):
        assert "/certificado" in self.saida

    # --- Erro ---
    def test_trilha_invalida_levanta_erro(self, json_path: Path):
        with pytest.raises(TrilhaNotFoundError):
            formatar_trilha("ruby", json_path)

    # --- Variações case-insensitive ---
    @pytest.mark.parametrize("entrada", ["JAVA", "Java", "jAvA"])
    def test_case_insensitive(self, entrada: str, json_path: Path):
        saida = formatar_trilha(entrada, json_path)
        assert "Java Developer" in saida


# ===========================================================================
# BLOCO 4 – gerar_desafio e formatar_desafio  (/desafio)
# ===========================================================================

class TestGerarDesafio:
    """Testa a geração bruta de desafios."""

    @pytest.mark.parametrize("nivel", ["iniciante", "intermediario", "avancado"])
    def test_niveis_validos(self, nivel: str):
        dado = gerar_desafio("java", nivel)
        assert "titulo" in dado
        assert "descricao" in dado
        assert "requisitos" in dado

    def test_nivel_com_acento(self):
        """'avançado' deve normalizar para 'avancado'."""
        dado = gerar_desafio("java", "avançado")
        assert dado["tempo"] == 60

    def test_nivel_maiusculo(self):
        dado = gerar_desafio("java", "Iniciante")
        assert dado["tempo"] == 15

    def test_tecnologia_invalida(self):
        with pytest.raises(ValueError, match="Tecnologia"):
            gerar_desafio("kotlin", "iniciante")

    def test_nivel_invalido(self):
        with pytest.raises(ValueError, match="Nível"):
            gerar_desafio("java", "expert")

    def test_iniciante_tempo_15(self):
        assert gerar_desafio("java", "iniciante")["tempo"] == 15

    def test_intermediario_tempo_30(self):
        assert gerar_desafio("java", "intermediario")["tempo"] == 30

    def test_avancado_tempo_60(self):
        assert gerar_desafio("java", "avancado")["tempo"] == 60

    def test_requisitos_sao_lista(self):
        dado = gerar_desafio("java", "iniciante")
        assert isinstance(dado["requisitos"], list)
        assert len(dado["requisitos"]) > 0

    def test_dicas_sao_lista(self):
        dado = gerar_desafio("java", "avancado")
        assert isinstance(dado["dicas"], list)


class TestFormatarDesafio:
    """Testa o Markdown gerado para /desafio."""

    @pytest.fixture(autouse=True)
    def desafio_iniciante(self):
        self.saida = formatar_desafio("java", "iniciante")

    def test_cabecalho(self):
        assert "# ⚡ Desafio de Código" in self.saida

    def test_tecnologia_no_cabecalho(self):
        assert "**Tecnologia:** Java" in self.saida

    def test_nivel_no_cabecalho(self):
        assert "**Nível:** Iniciante" in self.saida

    def test_tempo_no_cabecalho(self):
        assert "15 minutos" in self.saida

    def test_secao_descricao(self):
        assert "## 📋 Descrição do Desafio" in self.saida

    def test_secao_requisitos(self):
        assert "## 🎯 Requisitos" in self.saida

    def test_secao_entrada(self):
        assert "## 📥 Entrada Esperada" in self.saida

    def test_secao_saida(self):
        assert "## 📤 Saída Esperada" in self.saida

    def test_secao_dicas(self):
        assert "## 💡 Dicas" in self.saida

    def test_secao_criterios(self):
        assert "## 🏆 Critérios de Avaliação" in self.saida

    def test_call_to_action(self):
        assert "cole seu código aqui" in self.saida

    def test_intermediario_tempo_30(self):
        saida = formatar_desafio("java", "intermediario")
        assert "30 minutos" in saida

    def test_avancado_tempo_60(self):
        saida = formatar_desafio("java", "avancado")
        assert "60 minutos" in saida

    def test_erro_tecnologia_invalida(self):
        with pytest.raises(ValueError):
            formatar_desafio("scala", "iniciante")

    def test_erro_nivel_invalido(self):
        with pytest.raises(ValueError):
            formatar_desafio("java", "beginner")


# ===========================================================================
# BLOCO 5 – _gerar_codigo
# ===========================================================================

class TestGerarCodigo:
    """Testa a geração do código único do certificado."""

    def test_formato_basico(self):
        codigo = _gerar_codigo(2025, seed=0)
        assert re.match(r"^DIO-2025[A-Z0-9]{8}$", codigo), f"Formato inválido: {codigo}"

    def test_ano_correto(self):
        codigo = _gerar_codigo(2030, seed=1)
        assert codigo.startswith("DIO-2030")

    def test_parte_aleatoria_oito_chars(self):
        codigo = _gerar_codigo(2025, seed=42)
        parte = codigo.replace("DIO-2025", "")
        assert len(parte) == 8

    def test_seed_diferente_gera_codigo_diferente(self):
        c1 = _gerar_codigo(2025, seed=1)
        c2 = _gerar_codigo(2025, seed=2)
        assert c1 != c2

    def test_sem_seed_nao_levanta_erro(self):
        codigo = _gerar_codigo(2025)
        assert codigo.startswith("DIO-2025")


# ===========================================================================
# BLOCO 6 – gerar_certificado  (/certificado)
# ===========================================================================

class TestGerarCertificado:
    """Testa a geração completa do certificado."""

    DATA_FIXA = date(2025, 7, 14)
    SEED_FIXO = 99

    @pytest.fixture(autouse=True)
    def certificado_java(self, json_path: Path):
        self.cert = gerar_certificado(
            nome="João Silva",
            tecnologia="java",
            data_emissao=self.DATA_FIXA,
            seed=self.SEED_FIXO,
            json_path=json_path,
        )

    # --- Banner DIO ---
    def test_banner_presente(self):
        assert "D I G I T A L   I N N O V A T I O N   O N E" in self.cert

    # --- Nome do aluno ---
    def test_nome_maiusculo(self):
        assert "JOÃO SILVA" in self.cert

    # --- Trilha ---
    def test_nome_da_trilha(self):
        assert "Java Developer" in self.cert

    # --- Módulos ---
    def test_cinco_modulos_certificados(self):
        assert self.cert.count("✅ Módulo") == 5

    def test_modulo1(self):
        assert "Java Fundamentals" in self.cert

    def test_modulo5(self):
        assert "Cloud e DevOps" in self.cert

    # --- Metadados ---
    def test_duracao(self):
        assert "120 horas" in self.cert

    def test_nivel(self):
        assert "Intermediário ao Avançado" in self.cert

    def test_data_emissao_formato(self):
        assert "14/07/2025" in self.cert

    def test_codigo_formato(self):
        assert re.search(r"DIO-2025[A-Z0-9]{8}", self.cert)

    # --- Nota de rodapé ---
    def test_nota_ficticio(self):
        assert "certificado fictício" in self.cert

    def test_link_diome(self):
        assert "dio.me" in self.cert

    # --- Erros ---
    def test_trilha_inexistente_levanta_erro(self, json_path: Path):
        with pytest.raises(TrilhaNotFoundError):
            gerar_certificado("Ana", "fortran", json_path=json_path)

    # --- Data padrão (hoje) ---
    def test_data_padrao_usa_hoje(self, json_path: Path):
        cert = gerar_certificado("Fulano", "java", seed=0, json_path=json_path)
        hoje_str = date.today().strftime("%d/%m/%Y")
        assert hoje_str in cert

    # --- Case-insensitive para tecnologia ---
    @pytest.mark.parametrize("tec", ["JAVA", "Java", "jAvA"])
    def test_tecnologia_case_insensitive(self, tec: str, json_path: Path):
        cert = gerar_certificado(
            "Teste", tec, data_emissao=self.DATA_FIXA, seed=1, json_path=json_path
        )
        assert "Java Developer" in cert

    # --- Outras trilhas ---
    @pytest.mark.parametrize("tec,nome_esperado", [
        ("python", "Python Developer"),
        ("javascript", "JavaScript Fullstack Developer"),
        ("react", "React Developer"),
        ("devops", "DevOps Engineer"),
    ])
    def test_outras_trilhas(self, tec: str, nome_esperado: str, json_path: Path):
        cert = gerar_certificado(
            "Aluno Teste", tec, data_emissao=self.DATA_FIXA, seed=5, json_path=json_path
        )
        assert nome_esperado in cert


# ===========================================================================
# BLOCO 7 – Fluxo completo de integração (java)
# ===========================================================================

class TestFluxoCompletoJava:
    """
    Testa o fluxo ponta-a-ponta:
      1. /trilha java  → consultar plano de estudo
      2. /desafio java intermediario  → gerar desafio
      3. /certificado "Nome" java  → gerar certificado
    """

    ALUNO = "Maria Aparecida dos Santos"
    DATA = date(2025, 7, 14)

    @pytest.fixture(autouse=True)
    def executar_fluxo(self, json_path: Path):
        self.trilha_md = formatar_trilha("java", json_path)
        self.desafio_md = formatar_desafio("java", "intermediario")
        self.cert_md = gerar_certificado(
            self.ALUNO, "java", data_emissao=self.DATA, seed=77, json_path=json_path
        )

    # /trilha
    def test_trilha_retorna_string(self):
        assert isinstance(self.trilha_md, str)

    def test_trilha_contem_nome_java(self):
        assert "Java Developer" in self.trilha_md

    def test_trilha_contem_spring_boot(self):
        assert "Spring Boot" in self.trilha_md

    def test_trilha_contem_microservicos(self):
        assert "Microsserviços" in self.trilha_md

    # /desafio
    def test_desafio_retorna_string(self):
        assert isinstance(self.desafio_md, str)

    def test_desafio_tempo_30_minutos(self):
        assert "30 minutos" in self.desafio_md

    def test_desafio_tecnologia_java(self):
        assert "Java" in self.desafio_md

    # /certificado
    def test_certificado_retorna_string(self):
        assert isinstance(self.cert_md, str)

    def test_certificado_nome_aluno(self):
        assert self.ALUNO.upper() in self.cert_md

    def test_certificado_trilha_java(self):
        assert "Java Developer" in self.cert_md

    def test_certificado_data(self):
        assert "14/07/2025" in self.cert_md

    def test_certificado_cinco_modulos(self):
        assert self.cert_md.count("✅ Módulo") == 5
