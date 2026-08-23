import * as SQLite from "expo-sqlite";

// Local SQLite database used for offline support:
// - cache:  last successful GET response per endpoint, stored as JSON text
// - outbox: writes made while offline, replayed by syncService when back online

let db: SQLite.SQLiteDatabase | null = null;

export type OutboxRequest = {
  id: number;
  method: string;
  endpoint: string;
  body: string | null;
};

// Opens the database and creates the tables. Called once from App.tsx.
export async function initDatabase() {
  db = await SQLite.openDatabaseAsync("inventorygo.db");
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cache (
      endpoint TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS outbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      method TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      body TEXT,
      created_at TEXT NOT NULL
    );
  `);
}

function getDb(): SQLite.SQLiteDatabase {
  if (!db) throw new Error("Database not initialized — call initDatabase() first");
  return db;
}

// --- cache helpers ---

export async function getCached(endpoint: string): Promise<any | null> {
  const row = await getDb().getFirstAsync<{ payload: string }>(
    "SELECT payload FROM cache WHERE endpoint = ?",
    endpoint
  );
  return row ? JSON.parse(row.payload) : null;
}

export async function setCached(endpoint: string, data: any) {
  await getDb().runAsync(
    "INSERT OR REPLACE INTO cache (endpoint, payload, updated_at) VALUES (?, ?, ?)",
    endpoint,
    JSON.stringify(data),
    new Date().toISOString()
  );
}

// --- outbox helpers ---

export async function addToOutbox(method: string, endpoint: string, body?: string | null) {
  await getDb().runAsync(
    "INSERT INTO outbox (method, endpoint, body, created_at) VALUES (?, ?, ?, ?)",
    method,
    endpoint,
    body ?? null,
    new Date().toISOString()
  );
}

export async function getOutbox(): Promise<OutboxRequest[]> {
  return getDb().getAllAsync<OutboxRequest>("SELECT * FROM outbox ORDER BY id");
}

export async function removeFromOutbox(id: number) {
  await getDb().runAsync("DELETE FROM outbox WHERE id = ?", id);
}
