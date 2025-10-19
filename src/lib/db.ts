// Database connection utility
import Database from 'better-sqlite3';
import { join } from 'path';

const DB_PATH = process.env.DATABASE_PATH || join(process.cwd(), 'db/iomarkets.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH, {
      readonly: false,
      fileMustExist: true
    });

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Better performance settings
    db.pragma('journal_mode = WAL');
  }

  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

// Graceful shutdown
process.on('exit', closeDb);
process.on('SIGINT', () => {
  closeDb();
  process.exit(0);
});
