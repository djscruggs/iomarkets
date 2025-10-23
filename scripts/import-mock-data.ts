// Import all mock data from seed.sql into SQLite using sqlite3 CLI
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DATABASE_PATH || join(__dirname, '../db/iomarkets.db');
const SEED_FILE = join(__dirname, '../db/seed.sql');

console.log('Opening database at:', DB_PATH);

try {
  // Use sqlite3 CLI to execute the seed file (supports .read command)
  execSync(`sqlite3 "${DB_PATH}" < "${SEED_FILE}"`, {
    stdio: 'inherit'
  });

  // Get counts for verification using better-sqlite3
  const db = new Database(DB_PATH, { readonly: true });
  const investmentCount = db.prepare('SELECT COUNT(*) as count FROM investments').get() as { count: number };
  const sponsorCount = db.prepare('SELECT COUNT(*) as count FROM sponsors').get() as { count: number };
  const relationshipCount = db.prepare('SELECT COUNT(*) as count FROM investment_sponsors').get() as { count: number };
  const assetCount = db.prepare('SELECT COUNT(*) as count FROM due_diligence_assets').get() as { count: number };
  db.close();

  console.log(`✓ Imported ${investmentCount.count} investments`);
  console.log(`✓ Imported ${sponsorCount.count} sponsors`);
  console.log(`✓ Created ${relationshipCount.count} investment-sponsor relationships`);
  console.log(`✓ Imported ${assetCount.count} due diligence assets`);
  console.log('\n✓ All data imported successfully!');
} catch (error) {
  console.error('Error importing data:', error);
  process.exit(1);
}
