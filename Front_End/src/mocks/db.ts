/**
 * Banco de dados MOCKADO: vive em memória e é persistido no localStorage.
 * Somente os serviços em src/services/mock/ devem importar este arquivo.
 * Quando o backend existir, este módulo inteiro deixa de ser usado.
 */
import { AppError } from '@/services/errors';
import { isQuotaExceededError, storage } from '@/utils/storage';
import type { MockDatabase, TableName } from './records';
import { buildSeedDatabase } from './seed';

/** Aumente quando o formato dos dados mudar, para forçar uma nova carga dos exemplos. */
const DB_VERSION = '1';
const VERSION_KEY = 'db:version';
const TABLES: TableName[] = ['users', 'sightings', 'comments', 'likes', 'sessions'];
const tableKey = (table: TableName) => `db:${table}`;

let database: MockDatabase | null = null;

function loadFromStorage(): MockDatabase | null {
  if (storage.get(VERSION_KEY) !== DB_VERSION) return null;
  const loaded: Partial<MockDatabase> = {};
  for (const table of TABLES) {
    const rows = storage.readJSON<unknown>(tableKey(table));
    if (!Array.isArray(rows)) return null;
    Object.assign(loaded, { [table]: rows });
  }
  return loaded as MockDatabase;
}

function persist(db: MockDatabase, tables: TableName[]): void {
  for (const table of tables) storage.writeJSON(tableKey(table), db[table]);
  storage.set(VERSION_KEY, DB_VERSION);
}

function createSeeded(): MockDatabase {
  const db = buildSeedDatabase();
  try {
    persist(db, TABLES);
  } catch {
    // Sem armazenamento disponível: os dados continuam funcionando em memória.
  }
  return db;
}

export function getDatabase(): MockDatabase {
  database ??= loadFromStorage() ?? createSeeded();
  return database;
}

/**
 * Executa uma alteração de forma "transacional": se não for possível salvar
 * (ex.: armazenamento do navegador cheio), o estado em memória é restaurado.
 * Convenção: nunca altere um registro existente no lugar — substitua o objeto.
 */
export function transaction<T>(tables: TableName[], mutate: (db: MockDatabase) => T): T {
  const db = getDatabase();
  const snapshot: Partial<MockDatabase> = {};
  for (const table of tables) Object.assign(snapshot, { [table]: db[table].slice() });

  const result = mutate(db);
  try {
    persist(db, tables);
  } catch (error) {
    Object.assign(db, snapshot);
    if (isQuotaExceededError(error)) {
      throw new AppError(
        'STORAGE_FULL',
        'O armazenamento local do navegador está cheio. Remova avistamentos antigos ou restaure os dados de demonstração em Configurações.',
      );
    }
    throw error;
  }
  return result;
}

/** Apaga tudo e recria os dados de demonstração. */
export function resetDatabase(): void {
  for (const table of TABLES) storage.remove(tableKey(table));
  storage.remove(VERSION_KEY);
  database = createSeeded();
}
