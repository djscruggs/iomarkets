// Apply image URL migration
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DATABASE_PATH || join(__dirname, '../db/iomarkets.db');
const MIGRATION_FILE = join(__dirname, '../db/migration-update-images.sql');

console.log('Starting image URL migration...');
console.log('Database:', DB_PATH);

const db = new Database(DB_PATH);

try {
  // Read migration SQL
  const migrationSQL = readFileSync(MIGRATION_FILE, 'utf-8');

  // Split into individual statements
  const statements = migrationSQL
    .split('\n')
    .filter(line => line.trim().startsWith('UPDATE'))
    .map(stmt => stmt.trim());

  console.log(`Found ${statements.length} image updates to apply`);

  // Execute in transaction
  const migrate = db.transaction(() => {
    let updated = 0;
    for (const statement of statements) {
      const result = db.prepare(statement).run();
      if (result.changes > 0) {
        updated++;
      }
    }
    return updated;
  });

  const updatedCount = migrate();

  console.log(`\n✅ Updated ${updatedCount} investment images`);

  // Show some examples
  const examples = db.prepare(`
    SELECT id, name, image_url
    FROM investments
    WHERE id IN ('14062510371', '9066524200', '21256265876', '10423128146', '51')
    ORDER BY id
  `).all() as Array<{ id: string; name: string; image_url: string }>;

  console.log('\nSample updated images:');
  examples.forEach(inv => {
    const urlPath = inv.image_url.split('photo-')[1]?.split('?')[0] || 'unchanged';
    console.log(`  ${inv.name}: ...${urlPath.substring(0, 20)}`);
  });

  db.close();
  console.log('\n✅ Migration completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error);
  db.close();
  process.exit(1);
}
