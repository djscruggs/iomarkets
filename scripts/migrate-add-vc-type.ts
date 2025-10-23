// Migration: Identify and tag venture capital deals
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DATABASE_PATH || join(__dirname, '../db/iomarkets.db');

console.log('Starting VC type migration...');
console.log('Database:', DB_PATH);

const db = new Database(DB_PATH);

try {
  // First, update the schema constraint to allow 'venture-capital'
  // Note: SQLite doesn't support ALTER TABLE to modify constraints directly
  // We need to check if the constraint allows it or handle it at application level

  // List of investments that are venture capital funds based on their descriptions
  const vcInvestmentIds = [
    '4431954244', // Crestline Capital - VC fund
    '14796012117', // Maghreb Ventures - VC fund
    '6586481253', // Foundry Capital - VC Fund II
    '3033537001', // Sterling Ventures EIS - EIS fund
    '14062510978', // Ascendant Capital Partners - Hedge Fund
    '11764377724', // Atlas Capital - Hedge fund
    '29468147298', // Constellation Digital Capital - Fund of Funds
  ];

  console.log(`Updating ${vcInvestmentIds.length} investments to venture-capital type...`);

  // Update each investment
  const updateStmt = db.prepare('UPDATE investments SET type = ? WHERE id = ?');

  const update = db.transaction(() => {
    let updated = 0;
    for (const id of vcInvestmentIds) {
      const result = updateStmt.run('venture-capital', id);
      if (result.changes > 0) {
        updated++;
      }
    }
    return updated;
  });

  const updatedCount = update();

  console.log(`✓ Updated ${updatedCount} investments to venture-capital type`);

  // Verify the changes
  const vcCount = db.prepare("SELECT COUNT(*) as count FROM investments WHERE type = 'venture-capital'").get() as { count: number };
  const peCount = db.prepare("SELECT COUNT(*) as count FROM investments WHERE type = 'private-equity'").get() as { count: number };
  const reCount = db.prepare("SELECT COUNT(*) as count FROM investments WHERE type = 'real-estate'").get() as { count: number };

  console.log('\n--- Investment Type Distribution ---');
  console.log(`  Real Estate: ${reCount.count}`);
  console.log(`  Private Equity: ${peCount.count}`);
  console.log(`  Venture Capital: ${vcCount.count}`);
  console.log(`  Total: ${reCount.count + peCount.count + vcCount.count}`);

  // Show sample VC investments
  const samples = db.prepare(`
    SELECT id, name, description
    FROM investments
    WHERE type = 'venture-capital'
    LIMIT 5
  `).all() as Array<{ id: string; name: string; description: string }>;

  console.log('\nSample Venture Capital investments:');
  samples.forEach(inv => {
    console.log(`  - ${inv.name}`);
  });

  db.close();
  console.log('\n✅ Migration completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error);
  db.close();
  process.exit(1);
}
