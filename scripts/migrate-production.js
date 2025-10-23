#!/usr/bin/env node
// Migration script for production database
// This script adds the bookmarks table if it doesn't exist

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DATABASE_PATH || '/data/iomarkets.db';
const MIGRATION_PATH = join(__dirname, '../db/migrations/004_add_bookmarks.sql');

console.log('Running production migration...');
console.log('Database path:', DB_PATH);
console.log('Migration file:', MIGRATION_PATH);

try {
  const db = new Database(DB_PATH);
  
  // Check if bookmarks table exists
  const tableExists = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='bookmarks'
  `).get();
  
  if (tableExists) {
    console.log('✅ Bookmarks table already exists');
  } else {
    console.log('📝 Adding bookmarks table...');
    const migration = readFileSync(MIGRATION_PATH, 'utf8');
    db.exec(migration);
    console.log('✅ Bookmarks table created successfully!');
  }
  
  // Verify the table was created
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
  `).all();
  
  console.log('📋 Current tables:', tables.map(t => t.name).join(', '));
  
  db.close();
  console.log('✅ Migration completed successfully!');
  
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}
