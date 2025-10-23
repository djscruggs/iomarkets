// Migration script: Remove all investments except #51 and load seed.sql data
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DATABASE_PATH || join(__dirname, '../db/iomarkets.db');
const SEED_FILE = join(__dirname, '../db/seed.sql');

console.log('Starting migration...');
console.log('Database:', DB_PATH);

const db = new Database(DB_PATH);

try {
  // Start transaction
  const migrate = db.transaction(() => {
    // 1. Get current state
    const totalInvestments = db.prepare('SELECT COUNT(*) as count FROM investments').get() as { count: number };
    console.log(`Current investments: ${totalInvestments.count}`);

    // 2. Delete all investment-sponsor relationships except for investment 51
    const deletedRelationships = db.prepare(`
      DELETE FROM investment_sponsors
      WHERE investment_id != '51'
    `).run();
    console.log(`✓ Deleted ${deletedRelationships.changes} investment-sponsor relationships`);

    // 3. Delete all due diligence assets except for investment 51
    const deletedAssets = db.prepare(`
      DELETE FROM due_diligence_assets
      WHERE investment_id != '51'
    `).run();
    console.log(`✓ Deleted ${deletedAssets.changes} due diligence assets`);

    // 4. Delete all sponsors except s51 and s52 (DJ & Manuel)
    const deletedSponsors = db.prepare(`
      DELETE FROM sponsors
      WHERE id NOT IN ('s51', 's52')
    `).run();
    console.log(`✓ Deleted ${deletedSponsors.changes} sponsors`);

    // 5. Delete all investments except 51
    const deletedInvestments = db.prepare(`
      DELETE FROM investments
      WHERE id != '51'
    `).run();
    console.log(`✓ Deleted ${deletedInvestments.changes} investments`);

    // 6. Delete all RAG-related data for old investments
    db.prepare('DELETE FROM investment_data_stores WHERE investment_id != \'51\'').run();
    db.prepare('DELETE FROM indexed_documents WHERE investment_id != \'51\'').run();
    db.prepare('DELETE FROM rag_stores WHERE investment_id != \'51\'').run();
    console.log('✓ Cleaned up RAG data');

    // 7. Delete all bookmarks for deleted investments
    const deletedBookmarks = db.prepare(`
      DELETE FROM bookmarks
      WHERE investment_id != '51'
    `).run();
    console.log(`✓ Deleted ${deletedBookmarks.changes} bookmarks`);
  });

  // Execute the migration
  migrate();

  console.log('\n--- Database cleaned, now loading seed data ---\n');

  // Read seed file and modify INSERT statements to use INSERT OR REPLACE
  const seedSQL = readFileSync(SEED_FILE, 'utf-8');
  const modifiedSQL = seedSQL.replace(/INSERT INTO/g, 'INSERT OR REPLACE INTO');

  // Execute the seed SQL directly with the database connection
  // Split by semicolons and execute each statement
  const statements = modifiedSQL
    .split('\n')
    .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
    .join('\n')
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  console.log(`Executing ${statements.length} SQL statements from seed.sql...`);

  for (const statement of statements) {
    db.exec(statement);
  }

  console.log('✓ Seed data loaded successfully\n');

  // 9. Verify new data
  const investmentCount = db.prepare('SELECT COUNT(*) as count FROM investments').get() as { count: number };
  const sponsorCount = db.prepare('SELECT COUNT(*) as count FROM sponsors').get() as { count: number };
  const relationshipCount = db.prepare('SELECT COUNT(*) as count FROM investment_sponsors').get() as { count: number };
  const assetCount = db.prepare('SELECT COUNT(*) as count FROM due_diligence_assets').get() as { count: number };

  console.log('\n--- Migration Complete ---');
  console.log(`✓ Total investments: ${investmentCount.count}`);
  console.log(`✓ Total sponsors: ${sponsorCount.count}`);
  console.log(`✓ Total relationships: ${relationshipCount.count}`);
  console.log(`✓ Total assets: ${assetCount.count}`);

  // Verify investment 51 still exists
  const holiday = db.prepare('SELECT name FROM investments WHERE id = \'51\'').get() as { name: string } | undefined;
  if (holiday) {
    console.log(`✓ Investment #51 preserved: ${holiday.name}`);
  } else {
    console.error('⚠️  WARNING: Investment #51 not found!');
  }

  db.close();

  console.log('\n✅ Migration completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}
