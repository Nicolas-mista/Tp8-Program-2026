import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { Variant } from "./experiment";

const IMPRESSION_WINDOW_MS = 30 * 60 * 1000;

type Counts = Record<Variant, { impressions: number; conversions: number }>;

function createDb(): DatabaseSync {
  const dir = join(process.cwd(), "data");
  mkdirSync(dir, { recursive: true });

  const db = new DatabaseSync(join(dir, "experiment.db"));
  db.exec("PRAGMA busy_timeout = 5000");
  try {
    db.exec("PRAGMA journal_mode = WAL");
  } catch {
    // Otro proceso puede estar inicializando la base; el modo por defecto sirve.
  }
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_id TEXT NOT NULL,
      variant TEXT NOT NULL CHECK (variant IN ('a', 'b')),
      type TEXT NOT NULL CHECK (type IN ('impression', 'conversion')),
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_events_visitor_type
      ON events (visitor_id, type, created_at DESC);
    CREATE UNIQUE INDEX IF NOT EXISTS one_conversion_per_visitor
      ON events (visitor_id) WHERE type = 'conversion';
  `);

  return db;
}

// En desarrollo Next puede reevaluar módulos: reutilizamos la conexión.
// La base se abre recién en el primer evento para no bloquear el build.
const globalForDb = globalThis as unknown as { __tp8Db?: DatabaseSync };

function getDb(): DatabaseSync {
  if (globalForDb.__tp8Db) return globalForDb.__tp8Db;
  const db = createDb();
  globalForDb.__tp8Db = db;
  return db;
}

/** Una impresión por visitante cada 30 minutos. */
export function recordImpression(visitorId: string, variant: Variant): boolean {
  const db = getDb();
  const now = Date.now();
  const last = db
    .prepare(
      `SELECT created_at FROM events
       WHERE visitor_id = ? AND type = 'impression'
       ORDER BY created_at DESC LIMIT 1`,
    )
    .get(visitorId) as { created_at: number } | undefined;

  if (last && now - last.created_at < IMPRESSION_WINDOW_MS) {
    return false;
  }

  db.prepare(
    `INSERT INTO events (visitor_id, variant, type, created_at)
     VALUES (?, ?, 'impression', ?)`,
  ).run(visitorId, variant, now);

  return true;
}

/** Una conversión por visitante. El índice único hace la deduplicación. */
export function recordConversion(visitorId: string, variant: Variant): boolean {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT OR IGNORE INTO events (visitor_id, variant, type, created_at)
       VALUES (?, ?, 'conversion', ?)`,
    )
    .run(visitorId, variant, Date.now());

  return Number(result.changes) > 0;
}

export function getCounts(): Counts {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT variant, type, COUNT(*) AS total
       FROM events
       GROUP BY variant, type`,
    )
    .all() as Array<{ variant: Variant; type: string; total: number }>;

  const counts: Counts = {
    a: { impressions: 0, conversions: 0 },
    b: { impressions: 0, conversions: 0 },
  };

  for (const row of rows) {
    if (row.type === "impression") {
      counts[row.variant].impressions = Number(row.total);
    } else if (row.type === "conversion") {
      counts[row.variant].conversions = Number(row.total);
    }
  }

  return counts;
}
