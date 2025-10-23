// Schema migration: Add description column to investments table
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DATABASE_PATH || join(__dirname, '../db/iomarkets.db');

console.log('Starting schema migration...');
console.log('Database:', DB_PATH);

const db = new Database(DB_PATH);

try {
  // Check if description column already exists
  const tableInfo = db.prepare("PRAGMA table_info(investments)").all() as Array<{ name: string }>;
  const hasDescription = tableInfo.some(col => col.name === 'description');

  if (hasDescription) {
    console.log('✓ Description column already exists, skipping migration');
    db.close();
    process.exit(0);
  }

  console.log('Adding description column to investments table...');

  // Add the description column
  db.exec('ALTER TABLE investments ADD COLUMN description TEXT');

  console.log('✓ Description column added successfully');

  // Verify the column was added
  const updatedTableInfo = db.prepare("PRAGMA table_info(investments)").all() as Array<{ name: string }>;
  const verified = updatedTableInfo.some(col => col.name === 'description');

  if (verified) {
    console.log('✓ Schema migration verified');
  } else {
    throw new Error('Failed to verify description column addition');
  }

  db.close();
  console.log('\n✅ Schema migration completed successfully!');
} catch (error) {
  console.error('❌ Schema migration failed:', error);
  db.close();
  process.exit(1);
}
