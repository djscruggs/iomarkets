// Export current database to seed.sql
import { getDb } from '../src/lib/db.js';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SEED_PATH = join(__dirname, '../db/seed.sql');

const db = getDb();

// Escape SQL strings
function escapeSql(value: any): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  return `'${value.toString().replace(/'/g, "''")}'`;
}

console.log('Exporting database to seed.sql...\n');

let sql = `-- Seed data for IOMarkets MVP
-- Auto-generated from database export
-- Last generated: ${new Date().toISOString()}
-- DO NOT EDIT MANUALLY

`;

// Export investments
const investments = db.prepare('SELECT * FROM investments ORDER BY id').all();
sql += `-- Insert all ${investments.length} investments\n`;
sql += `INSERT INTO investments (id, name, sponsor, target_raise, amount_raised, image_url, type, location, min_investment, projected_return, term) VALUES\n`;

const investmentValues = investments.map((inv: any) => {
  return `(${escapeSql(inv.id)}, ${escapeSql(inv.name)}, ${escapeSql(inv.sponsor)}, ${inv.target_raise}, ${inv.amount_raised}, ${escapeSql(inv.image_url)}, ${escapeSql(inv.type)}, ${inv.location ? escapeSql(inv.location) : 'NULL'}, ${inv.min_investment}, ${inv.projected_return}, ${escapeSql(inv.term)})`;
});

sql += investmentValues.join(',\n') + ';\n\n';

// Export sponsors
const sponsors = db.prepare('SELECT * FROM sponsors ORDER BY id').all();
sql += `-- Insert all ${sponsors.length} sponsors\n`;
sql += `INSERT INTO sponsors (id, name, email, phone, linkedin_url, photo_url, total_deals, total_value) VALUES\n`;

const sponsorValues = sponsors.map((s: any) => {
  return `(${escapeSql(s.id)}, ${escapeSql(s.name)}, ${escapeSql(s.email)}, ${escapeSql(s.phone)}, ${escapeSql(s.linkedin_url)}, ${escapeSql(s.photo_url)}, ${s.total_deals}, ${s.total_value})`;
});

sql += sponsorValues.join(',\n') + ';\n\n';

// Export investment-sponsor relationships
const relationships = db.prepare('SELECT * FROM investment_sponsors ORDER BY investment_id, sponsor_id').all();
sql += `-- Insert investment-sponsor relationships\n`;
sql += `INSERT INTO investment_sponsors (investment_id, sponsor_id) VALUES\n`;

const relationshipValues = relationships.map((r: any) => {
  return `(${escapeSql(r.investment_id)}, ${escapeSql(r.sponsor_id)})`;
});

sql += relationshipValues.join(',\n') + ';\n\n';

// Export due diligence assets
const assets = db.prepare('SELECT * FROM due_diligence_assets ORDER BY investment_id, id').all();
sql += `-- Insert all ${assets.length} due diligence assets\n`;
sql += `INSERT INTO due_diligence_assets (id, investment_id, name, type, url, thumbnail_url, uploaded_date, size) VALUES\n`;

const assetValues = assets.map((a: any) => {
  return `(${escapeSql(a.id)}, ${escapeSql(a.investment_id)}, ${escapeSql(a.name)}, ${escapeSql(a.type)}, ${escapeSql(a.url)}, ${a.thumbnail_url ? escapeSql(a.thumbnail_url) : 'NULL'}, ${escapeSql(a.uploaded_date)}, ${a.size ? escapeSql(a.size) : 'NULL'})`;
});

sql += assetValues.join(',\n') + ';\n';

// Write to file
writeFileSync(SEED_PATH, sql, 'utf8');

console.log('✓ Generated seed.sql successfully!');
console.log(`  - ${investments.length} investments`);
console.log(`  - ${sponsors.length} sponsors`);
console.log(`  - ${relationships.length} investment-sponsor relationships`);
console.log(`  - ${assets.length} due diligence assets`);
console.log(`\nFile: ${SEED_PATH}`);
