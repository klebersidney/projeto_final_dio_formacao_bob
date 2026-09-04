/**
 * data-loader.ts
 * ==============
 * Carrega e valida o arquivo JSON de trilhas DIO.
 * Localiza automaticamente o JSON subindo a árvore de diretórios a partir
 * deste arquivo, compatível tanto com execução local (mcp/build/) quanto
 * com o caminho canônico data/trilhas_dio.json na raiz do projeto.
 */

import { readFileSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface Badge {
  nome: string;
  raridade: string;
  icone: string;
}

export interface Promocao {
  desconto_percentual: number;
  validade: string | null;
  codigo: string | null;
}

export interface LiveAoVivo {
  titulo: string;
  data: string;
  duracao_min: number;
}

export interface Trilha {
  id: number;
  nome: string;
  descricao: string;
  tecnologia: string;
  nivel: string;
  numero_modulos: number;
  xp_total: number;
  badges: Badge[];
  promocoes: Promocao | null;
  vitalicio: boolean;
  lives_ao_vivo: LiveAoVivo[];
}

export interface TrilhasMeta {
  total_trilhas: number;
  fonte: string;
  versao: string;
  ultima_atualizacao: string;
  niveis_disponiveis: string[];
  raridades_badges: string[];
  xp_total_plataforma: number;
}

export interface TrilhasDatabase {
  trilhas: Trilha[];
  meta: TrilhasMeta;
}

// ---------------------------------------------------------------------------
// Resolução de caminho
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Procura o arquivo trilhas_dio.json subindo a árvore de diretórios.
 * Procura em: build/ → mcp/ → raiz do projeto → data/
 */
function findJsonPath(): string {
  // Caminhos candidatos relativos ao diretório do arquivo compilado (build/)
  const candidates = [
    join(__dirname, "..", "..", "geo_explorer", "data", "trilhas_dio.json"),        // raiz/geo_explorer/data/
    join(__dirname, "..", "..", "..", "geo_explorer", "data", "trilhas_dio.json"),   // um nível acima
    join(__dirname, "..", "geo_explorer", "data", "trilhas_dio.json"),               // mcp/geo_explorer/data/
    join(__dirname, "..", "..", "data", "trilhas_dio.json"),                          // raiz/data/ (fallback)
    join(__dirname, "..", "data", "trilhas_dio.json"),                                // mcp/data/
    // Fallback para variável de ambiente
    process.env["TRILHAS_JSON_PATH"] ?? "",
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      readFileSync(candidate); // teste de leitura
      return candidate;
    } catch {
      // não encontrado, tenta próximo
    }
  }

  throw new Error(
    "Arquivo trilhas_dio.json não encontrado. " +
      "Defina a variável de ambiente TRILHAS_JSON_PATH com o caminho absoluto."
  );
}

// ---------------------------------------------------------------------------
// Cache em memória
// ---------------------------------------------------------------------------

let _cache: TrilhasDatabase | null = null;

export function loadDatabase(forceReload = false): TrilhasDatabase {
  if (_cache && !forceReload) return _cache;
  const jsonPath = findJsonPath();
  const raw = readFileSync(jsonPath, "utf-8");
  _cache = JSON.parse(raw) as TrilhasDatabase;
  return _cache;
}

export function listTrilhas(): Trilha[] {
  return loadDatabase().trilhas;
}

export function findTrilhaById(id: number): Trilha | undefined {
  return listTrilhas().find((t) => t.id === id);
}

export function findTrilhasByNivel(nivel: string): Trilha[] {
  const normalized = nivel.trim().toLowerCase();
  return listTrilhas().filter((t) => t.nivel.toLowerCase() === normalized);
}

export function findTrilhasByTecnologia(tecnologia: string): Trilha[] {
  const term = tecnologia.trim().toLowerCase();
  return listTrilhas().filter((t) => t.tecnologia.toLowerCase().includes(term));
}

export function getMeta(): TrilhasMeta {
  return loadDatabase().meta;
}
