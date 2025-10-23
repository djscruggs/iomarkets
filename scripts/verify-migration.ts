// Verify migration results
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DATABASE_PATH || join(__dirname, '../db/iomarkets.db');

console.log('Verifying migration results...\n');

const db = new Database(DB_PATH, { readonly: true });

try {
  // Get counts
  const investmentCount = db.prepare('SELECT COUNT(*) as count FROM investments').get() as { count: number };
  const sponsorCount = db.prepare('SELECT COUNT(*) as count FROM sponsors').get() as { count: number };
  const relationshipCount = db.prepare('SELECT COUNT(*) as count FROM investment_sponsors').get() as { count: number };
  const assetCount = db.prepare('SELECT COUNT(*) as count FROM due_diligence_assets').get() as { count: number };

  console.log('Database Counts:');
  console.log(`  Investments: ${investmentCount.count}`);
  console.log(`  Sponsors: ${sponsorCount.count}`);
  console.log(`  Relationships: ${relationshipCount.count}`);
  console.log(`  Assets: ${assetCount.count}\n`);

  // Check Holiday Terrace
  const holiday = db.prepare(`
    SELECT id, name, featured, description
    FROM investments
    WHERE id = '51'
  `).get() as { id: string; name: string; featured: number; description: string | null } | undefined;

  if (holiday) {
    console.log('Investment #51 (Holiday Terrace):');
    console.log(`  ✓ Name: ${holiday.name}`);
    console.log(`  ✓ Featured: ${holiday.featured === 1 ? 'Yes' : 'No'}`);
    console.log(`  ✓ Description: ${holiday.description || 'None'}`);

    // Get sponsors for Holiday Terrace
    const sponsors = db.prepare(`
      SELECT s.name
      FROM sponsors s
      JOIN investment_sponsors isp ON s.id = isp.sponsor_id
      WHERE isp.investment_id = '51'
    `).all() as { name: string }[];

    console.log(`  ✓ Sponsors: ${sponsors.map(s => s.name).join(', ')}`);

    // Get asset count
    const assets = db.prepare(`
      SELECT COUNT(*) as count
      FROM due_diligence_assets
      WHERE investment_id = '51'
    `).get() as { count: number };

    console.log(`  ✓ Due Diligence Assets: ${assets.count}\n`);
  } else {
    console.log('⚠️  Investment #51 not found!\n');
  }

  // Show sample of other investments
  const sampleInvestments = db.prepare(`
    SELECT id, name, sponsor
    FROM investments
    WHERE id != '51'
    ORDER BY id
    LIMIT 5
  `).all() as { id: string; name: string; sponsor: string }[];

  console.log('Sample of new investments:');
  sampleInvestments.forEach(inv => {
    console.log(`  - ${inv.name} (ID: ${inv.id})`);
  });

  console.log('\n✅ Verification complete!');
} catch (error) {
  console.error('❌ Verification failed:', error);
  process.exit(1);
} finally {
  db.close();
}
