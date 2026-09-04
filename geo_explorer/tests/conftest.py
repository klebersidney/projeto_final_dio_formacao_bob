"""
conftest.py – configurações globais do pytest para o projeto.
"""
import sys
from pathlib import Path

# Garante que a pasta tests/ esteja no path para importar core.py
sys.path.insert(0, str(Path(__file__).parent))
