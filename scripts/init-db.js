// Initialize SQLite database with schema
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DATABASE_PATH || join(__dirname, '../db/iomarkets.db');
const SCHEMA_PATH = join(__dirname, '../db/schema.sql');

console.log('Initializing database at:', DB_PATH);

// Create database and apply schema
const db = new Database(DB_PATH);
const schema = readFileSync(SCHEMA_PATH, 'utf8');

console.log('Executing schema...');

try {
  // Execute the entire schema at once - SQLite can handle multiple statements
  db.exec(schema);
  console.log('✓ Database schema created successfully!');
} catch (error) {
  console.error('Error creating schema:', error);
  throw error;
} finally {
  db.close();
}
