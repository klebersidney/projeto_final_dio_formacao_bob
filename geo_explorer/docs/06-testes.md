# 06 · Testes Unitários

## Visão Geral

A suite de testes cobre a lógica Python de negócio em [`tests/core.py`](../tests/core.py), validando os três comandos principais do projeto: `/trilha`, `/desafio` e `/certificado`.

| Métrica | Resultado |
|---------|-----------|
| **Total de testes** | 99 |
| **Aprovados** | 99 ✅ |
| **Reprovados** | 0 |
| **Cobertura `core.py`** | **100 %** |
| **Cobertura total** | **98 %** |
| **Tempo de execução** | ~0.5 s |

---

## Como Executar

```bash
# Da raiz do projeto
# Todos os testes
python -m pytest geo_explorer/tests/test_commands.py -v

# Com relatório de cobertura
python -m pytest geo_explorer/tests/test_commands.py -v \
  --cov=geo_explorer.tests.core \
  --cov-report=term-missing

# Executar um bloco específico
python -m pytest geo_explorer/tests/test_commands.py::TestLoadTrilhas -v
python -m pytest geo_explorer/tests/test_commands.py::TestGerarDesafio -v

# Saída resumida (sem verbosidade)
python -m pytest geo_explorer/tests/test_commands.py
```

### Pré-requisitos

```bash
pip install pytest pytest-cov
```

---

## Estrutura da Suite — 7 Blocos de Testes

### Bloco 1 — `TestLoadTrilhas` (7 testes)

Testa o carregamento do JSON de trilhas.

| Teste | O que valida |
|-------|-------------|
| `test_retorna_dicionario` | O retorno é um `dict` Python |
| `test_chaves_esperadas` | As 5 chaves (`javascript`, `python`, `react`, `java`, `devops`) existem |
| `test_java_tem_campos_obrigatorios` | Campos `nome`, `nivel`, `duracao`, `descricao`, `modulos` presentes |
| `test_java_tem_cinco_modulos` | A trilha `java` possui exatamente 5 módulos |
| `test_arquivo_nao_encontrado` | Levanta `FileNotFoundError` para arquivo inexistente |
| `test_json_sem_chave_trilhas` | Levanta `KeyError` quando falta a chave `"trilhas"` |
| `test_json_vazio_retorna_dict_vazio` | Retorna `{}` quando `"trilhas"` está vazio |

---

### Bloco 2 — `TestGetTrilha` (11 testes)

Testa a recuperação de trilhas individuais.

| Teste | O que valida |
|-------|-------------|
| `test_case_insensitive[java/JAVA/Java/  JAVA  ]` | Busca funciona independente de capitalização e espaços |
| `test_javascript` | Nível correto para JavaScript |
| `test_python` | Duração de 100h para Python |
| `test_react` | Nome correto "React Developer" |
| `test_devops` | Nível "Avançado" para DevOps |
| `test_trilha_inexistente_levanta_erro` | `TrilhaNotFoundError` para "cobol" |
| `test_mensagem_de_erro_lista_disponiveis` | Mensagem de erro contém "Trilhas disponíveis" |
| `test_trilha_vazia_levanta_erro` | Erro quando JSON tem trilhas vazio |

---

### Bloco 3 — `TestFormatarTrilha` (15 testes)

Testa a saída Markdown do comando `/trilha`.

| Teste | O que valida |
|-------|-------------|
| `test_titulo_presente` | `# 🎓 Trilha: Java Developer` no output |
| `test_nivel_presente` | Nível "Intermediário ao Avançado" presente |
| `test_duracao_presente` | "120 horas" presente |
| `test_descricao_presente` | "Spring Boot" mencionado na descrição |
| `test_cinco_modulos` | Exatamente 5 seções `### Módulo` |
| `test_modulo1_titulo` | "Java Fundamentals" presente |
| `test_modulo5_titulo` | "Cloud e DevOps" presente |
| `test_topicos_como_lista` | Pelo menos 20 itens de lista (`- `) |
| `test_dica_certificado` | Dica para `/certificado` ao final |
| `test_trilha_invalida_levanta_erro` | Erro para tecnologia "ruby" |
| `test_case_insensitive[JAVA/Java/jAvA]` | Output idêntico independente do case |

---

### Bloco 4 — `TestGerarDesafio` + `TestFormatarDesafio` (21 testes)

Testa a geração do desafio (`/desafio`).

**`TestGerarDesafio` (10 testes):**
| Teste | O que valida |
|-------|-------------|
| `test_niveis_validos[iniciante/intermediario/avancado]` | Retorna objeto com `titulo`, `descricao`, `requisitos` |
| `test_nivel_com_acento` | "avançado" normalizado para "avancado" |
| `test_nivel_maiusculo` | "Iniciante" funciona igual a "iniciante" |
| `test_tecnologia_invalida` | `ValueError` para "kotlin" |
| `test_nivel_invalido` | `ValueError` para "expert" |
| `test_iniciante_tempo_15` | Tempo exatamente 15 minutos |
| `test_intermediario_tempo_30` | Tempo exatamente 30 minutos |
| `test_avancado_tempo_60` | Tempo exatamente 60 minutos |
| `test_requisitos_sao_lista` | Campo `requisitos` é lista não-vazia |
| `test_dicas_sao_lista` | Campo `dicas` é lista |

**`TestFormatarDesafio` (11 testes):**
| Teste | O que valida |
|-------|-------------|
| `test_cabecalho` | `# ⚡ Desafio de Código` presente |
| `test_tecnologia_no_cabecalho` | `**Tecnologia:** Java` presente |
| `test_nivel_no_cabecalho` | `**Nível:** Iniciante` presente |
| `test_tempo_no_cabecalho` | "15 minutos" presente |
| `test_secao_descricao` | `## 📋 Descrição do Desafio` presente |
| `test_secao_requisitos` | `## 🎯 Requisitos` presente |
| `test_secao_entrada` | `## 📥 Entrada Esperada` presente |
| `test_secao_saida` | `## 📤 Saída Esperada` presente |
| `test_secao_dicas` | `## 💡 Dicas` presente |
| `test_secao_criterios` | `## 🏆 Critérios de Avaliação` presente |
| `test_call_to_action` | "cole seu código aqui" presente |

---

### Bloco 5 — `TestGerarCodigo` (5 testes)

Testa a geração do código único do certificado.

| Teste | O que valida |
|-------|-------------|
| `test_formato_basico` | Regex `^DIO-2025[A-Z0-9]{8}$` |
| `test_ano_correto` | Ano correto no prefixo |
| `test_parte_aleatoria_oito_chars` | Exatamente 8 caracteres após o ano |
| `test_seed_diferente_gera_codigo_diferente` | Seeds distintas → códigos distintos |
| `test_sem_seed_nao_levanta_erro` | Execução sem seed não lança exceção |

---

### Bloco 6 — `TestGerarCertificado` (18 testes)

Testa a geração completa do certificado (`/certificado`).

| Teste | O que valida |
|-------|-------------|
| `test_banner_presente` | Banner ASCII "D I G I T A L   I N N O V A T I O N" |
| `test_nome_maiusculo` | Nome do aluno em maiúsculas |
| `test_nome_da_trilha` | "Java Developer" presente |
| `test_cinco_modulos_certificados` | 5 entradas `✅ Módulo` |
| `test_duracao` | "120 horas" presente |
| `test_nivel` | "Intermediário ao Avançado" presente |
| `test_data_emissao_formato` | Data no formato `DD/MM/AAAA` |
| `test_codigo_formato` | Código no padrão `DIO-2025XXXXXXXX` |
| `test_nota_ficticio` | Aviso "certificado fictício" |
| `test_link_diome` | Link `dio.me` presente |
| `test_trilha_inexistente_levanta_erro` | Erro para trilha "fortran" |
| `test_data_padrao_usa_hoje` | Sem data informada, usa data de hoje |
| `test_tecnologia_case_insensitive[JAVA/Java/jAvA]` | Case não importa |
| `test_outras_trilhas[python/javascript/react/devops]` | Todas as 4 trilhas geram certificado correto |

---

### Bloco 7 — `TestFluxoCompletoJava` (12 testes)

Testa o fluxo ponta-a-ponta (integração): `/trilha` → `/desafio` → `/certificado` para Java.

```python
# Fixture: executa os três comandos antes de cada teste
self.trilha_md  = formatar_trilha("java", json_path)
self.desafio_md = formatar_desafio("java", "intermediario")
self.cert_md    = gerar_certificado("Maria Aparecida", "java", ...)
```

Valida que o fluxo completo funciona end-to-end sem erros.

---

## Relatório de Cobertura

```
Name                              Stmts   Miss  Cover   Missing
---------------------------------------------------------------
tests/__init__.py                     0      0   100%
tests/conftest.py                     3      0   100%
tests/core.py                        77      0   100%   ← 100% ✅
tests/test_commands.py              284      6    98%   75-80
---------------------------------------------------------------
TOTAL                               364      6    98%
```

> As 6 linhas não cobertas (75-80 em `test_commands.py`) correspondem ao bloco de importações
> `from unittest.mock import patch` que não é chamado nos testes atuais — normal para o delta de 2 %.

---

## Fixtures Utilizadas

```python
@pytest.fixture()
def json_path() -> Path:
    """Retorna caminho real do JSON de trilhas."""
    return PROJETO_ROOT / "data" / "trilhas_dio_comandos.json"

@pytest.fixture()
def json_invalido(tmp_path: Path) -> Path:
    """JSON sem a chave 'trilhas'."""
    p = tmp_path / "invalido.json"
    p.write_text('{"outro": {}}', encoding="utf-8")
    return p

@pytest.fixture()
def json_java_only(tmp_path: Path) -> Path:
    """JSON com apenas a trilha java (subset do real)."""
    ...
```

---

## Como Adicionar Novos Testes

Para cobrir uma nova funcionalidade:

```python
class TestNovaFuncionalidade:
    """Testa a nova funcionalidade XYZ."""

    @pytest.fixture(autouse=True)
    def setup(self, json_path: Path):
        # Preparar dados compartilhados
        self.resultado = nova_funcao("param", json_path)

    def test_retorna_string(self):
        assert isinstance(self.resultado, str)

    def test_conteudo_esperado(self):
        assert "texto esperado" in self.resultado

    @pytest.mark.parametrize("entrada,esperado", [
        ("caso1", "resultado1"),
        ("caso2", "resultado2"),
    ])
    def test_parametrizado(self, entrada, esperado, json_path):
        assert nova_funcao(entrada, json_path) == esperado
```

---

_[← Anterior: Dados](./05-dados.md) · [Próximo: Modos de Uso →](./07-modos-de-uso.md)_
