// Export complete database with schema to seed.sql
import Database from 'better-sqlite3';
import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || join(__dirname, '..', 'db', 'iomarkets.db');
const SEED_PATH = join(__dirname, '../db/seed.sql');
const SCHEMA_PATH = join(__dirname, '../db/schema.sql');

const db = new Database(dbPath);

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

console.log('Exporting complete database to seed.sql...\n');

// Start with schema
const schema = readFileSync(SCHEMA_PATH, 'utf8');

let sql = `-- Complete IOMarkets Database Seed File
-- Auto-generated from production database
-- Last generated: ${new Date().toISOString()}
--
-- This file contains the complete schema and data.
-- To use: sqlite3 db/iomarkets.db < db/seed.sql
--

${schema}

-- ============================================================================
-- DATA IMPORT
-- ============================================================================

`;

// Export investments
const investments = db.prepare('SELECT * FROM investments ORDER BY id').all();
sql += `-- Insert all ${investments.length} investments\n`;
sql += `INSERT OR REPLACE INTO investments (id, name, sponsor, target_raise, amount_raised, image_url, type, location, min_investment, projected_return, term, featured, description) VALUES\n`;

const investmentValues = investments.map((inv: any) => {
  return `(${escapeSql(inv.id)}, ${escapeSql(inv.name)}, ${escapeSql(inv.sponsor)}, ${inv.target_raise}, ${inv.amount_raised}, ${escapeSql(inv.image_url)}, ${escapeSql(inv.type)}, ${inv.location ? escapeSql(inv.location) : 'NULL'}, ${inv.min_investment}, ${inv.projected_return}, ${escapeSql(inv.term)}, ${inv.featured || 0}, ${inv.description ? escapeSql(inv.description) : 'NULL'})`;
});

sql += investmentValues.join(',\n') + ';\n\n';

// Export sponsors
const sponsors = db.prepare('SELECT * FROM sponsors ORDER BY id').all();
if (sponsors.length > 0) {
  sql += `-- Insert all ${sponsors.length} sponsors\n`;
  sql += `INSERT OR REPLACE INTO sponsors (id, name, email, phone, linkedin_url, photo_url, total_deals, total_value) VALUES\n`;

  const sponsorValues = sponsors.map((s: any) => {
    return `(${escapeSql(s.id)}, ${escapeSql(s.name)}, ${escapeSql(s.email)}, ${escapeSql(s.phone)}, ${escapeSql(s.linkedin_url)}, ${escapeSql(s.photo_url)}, ${s.total_deals}, ${s.total_value})`;
  });

  sql += sponsorValues.join(',\n') + ';\n\n';
} else {
  sql += `-- No sponsors to insert\n\n`;
}

// Export investment-sponsor relationships
const relationships = db.prepare('SELECT * FROM investment_sponsors ORDER BY investment_id, sponsor_id').all();
if (relationships.length > 0) {
  sql += `-- Insert ${relationships.length} investment-sponsor relationships\n`;
  sql += `INSERT OR REPLACE INTO investment_sponsors (investment_id, sponsor_id) VALUES\n`;

  const relationshipValues = relationships.map((r: any) => {
    return `(${escapeSql(r.investment_id)}, ${escapeSql(r.sponsor_id)})`;
  });

  sql += relationshipValues.join(',\n') + ';\n\n';
} else {
  // Always include Holiday Terrace sponsor relationships
  sql += `-- Investment-sponsor relationships for Holiday Terrace\n`;
  sql += `INSERT OR REPLACE INTO investment_sponsors (investment_id, sponsor_id) VALUES\n`;
  sql += `('51', 's51'),\n`;
  sql += `('51', 's52');\n\n`;
}

// Export due diligence assets
const assets = db.prepare('SELECT * FROM due_diligence_assets ORDER BY investment_id, id').all();
if (assets.length > 0) {
  sql += `-- Insert all ${assets.length} due diligence assets\n`;
  sql += `INSERT OR REPLACE INTO due_diligence_assets (id, investment_id, name, type, url, thumbnail_url, uploaded_date, size) VALUES\n`;

  const assetValues = assets.map((a: any) => {
    return `(${escapeSql(a.id)}, ${escapeSql(a.investment_id)}, ${escapeSql(a.name)}, ${escapeSql(a.type)}, ${escapeSql(a.url)}, ${a.thumbnail_url ? escapeSql(a.thumbnail_url) : 'NULL'}, ${escapeSql(a.uploaded_date)}, ${a.size ? escapeSql(a.size) : 'NULL'})`;
  });

  sql += assetValues.join(',\n') + ';\n\n';
} else {
  // Always include Holiday Terrace assets
  sql += `-- Holiday Terrace Due Diligence Assets (PDF Documents & Photos)\n`;
  sql += `INSERT OR REPLACE INTO due_diligence_assets (id, investment_id, name, type, url, thumbnail_url, uploaded_date, size) VALUES\n`;
  const holidayTerraceAssets = [
    // PDFs
    `('ht-ex-1-cert-of-lp-holiday-terrace-pdf', '51', 'Ex 1 Cert of LP Holiday Terrace', 'pdf', '/duediligence/holidayterrace/Ex 1 Cert of LP Holiday Terrace.pdf', NULL, '2022-02-22', '242 KB')`,
    `('ht-ex-2-lpa-holiday-terrace-04182018-pdf', '51', 'Ex 2 LPA Holiday Terrace 04182018', 'pdf', '/duediligence/holidayterrace/Ex 2 LPA Holiday Terrace 04182018.pdf', NULL, '2022-02-22', '780 KB')`,
    `('ht-ex-3-sa-holiday-terrace-pdf', '51', 'Ex 3 SA Holiday Terrace', 'pdf', '/duediligence/holidayterrace/Ex 3 SA Holiday Terrace.pdf', NULL, '2022-02-22', '299 KB')`,
    `('ht-ex-3-sa-receipt-pdf', '51', 'Ex 3 SA receipt', 'pdf', '/duediligence/holidayterrace/Ex 3 SA receipt.pdf', NULL, '2022-02-22', '89 KB')`,
    `('ht-ppm-holiday-terrace-04182018-pdf', '51', 'PPM Holiday Terrace 04182018', 'pdf', '/duediligence/holidayterrace/PPM Holiday Terrace 04182018.pdf', NULL, '2022-02-22', '712 KB')`,
    `('ht-supp-sa-holiday-terrace-pdf', '51', 'Supp SA Holiday Terrace', 'pdf', '/duediligence/holidayterrace/Supp SA Holiday Terrace.pdf', NULL, '2022-02-22', '205 KB')`,
    // Photos
    `('ht-photo-1b-bedrm-jpg', '51', '1B Bedrm', 'image', '/duediligence/holidayterrace/photos/1B_Bedrm.jpg', '/duediligence/holidayterrace/photos/1B_Bedrm.jpg', '2022-02-22', '157 KB')`,
    `('ht-photo-1b-kitchen-jpg', '51', '1B Kitchen', 'image', '/duediligence/holidayterrace/photos/1B_Kitchen.jpg', '/duediligence/holidayterrace/photos/1B_Kitchen.jpg', '2022-02-22', '177 KB')`,
    `('ht-photo-1b-liv-rm-jpg', '51', '1B Liv Rm', 'image', '/duediligence/holidayterrace/photos/1B_Liv_Rm.jpg', '/duediligence/holidayterrace/photos/1B_Liv_Rm.jpg', '2022-02-22', '194 KB')`,
    `('ht-photo-bath-vanity-jpg', '51', 'Bath Vanity', 'image', '/duediligence/holidayterrace/photos/Bath_Vanity.jpg', '/duediligence/holidayterrace/photos/Bath_Vanity.jpg', '2022-02-22', '200 KB')`,
    `('ht-photo-clubhouse-jpg', '51', 'Clubhouse', 'image', '/duediligence/holidayterrace/photos/Clubhouse.JPG', '/duediligence/holidayterrace/photos/Clubhouse.JPG', '2022-02-22', '2.0 MB')`,
    `('ht-photo-exercise-rm-jpg', '51', 'Exercise Rm', 'image', '/duediligence/holidayterrace/photos/Exercise_Rm.jpg', '/duediligence/holidayterrace/photos/Exercise_Rm.jpg', '2022-02-22', '150 KB')`,
    `('ht-photo-exterior-on-schaefer-jpg', '51', 'Exterior On Schaefer', 'image', '/duediligence/holidayterrace/photos/Exterior_On_Schaefer.jpg', '/duediligence/holidayterrace/photos/Exterior_On_Schaefer.jpg', '2022-02-22', '253 KB')`,
    `('ht-photo-indoor-pool-jpg', '51', 'Indoor Pool', 'image', '/duediligence/holidayterrace/photos/Indoor_Pool.jpg', '/duediligence/holidayterrace/photos/Indoor_Pool.jpg', '2022-02-22', '192 KB')`,
    `('ht-photo-laundry-jpg', '51', 'Laundry', 'image', '/duediligence/holidayterrace/photos/Laundry.jpg', '/duediligence/holidayterrace/photos/Laundry.jpg', '2022-02-22', '141 KB')`,
    `('ht-photo-map-1-png', '51', 'Map 1', 'image', '/duediligence/holidayterrace/photos/Map_1.png', '/duediligence/holidayterrace/photos/Map_1.png', '2022-02-22', '115 KB')`
  ];
  sql += holidayTerraceAssets.join(',\n') + ';\n\n';
}

// Add summary stats
const typeStats = db.prepare(`
  SELECT type, COUNT(*) as count
  FROM investments
  GROUP BY type
  ORDER BY type
`).all();

sql += `-- Database Summary:\n`;
sql += `-- Total investments: ${investments.length}\n`;
typeStats.forEach((stat: any) => {
  sql += `--   ${stat.type}: ${stat.count}\n`;
});
sql += `-- Total sponsors: ${sponsors.length}\n`;
sql += `-- Total sponsor relationships: ${relationships.length}\n`;
sql += `-- Total due diligence assets: ${assets.length}\n`;

// Write to file
writeFileSync(SEED_PATH, sql, 'utf8');

console.log('✅ Generated complete seed.sql successfully!\n');
console.log('Summary:');
console.log(`  - ${investments.length} investments`);
typeStats.forEach((stat: any) => {
  console.log(`      ${stat.type}: ${stat.count}`);
});
console.log(`  - ${sponsors.length} sponsors`);
console.log(`  - ${relationships.length} investment-sponsor relationships`);
console.log(`  - ${assets.length} due diligence assets`);
console.log(`\nFile: ${SEED_PATH}`);
console.log('\nThis file can now be used to initialize fresh databases with:');
console.log('  sqlite3 db/iomarkets.db < db/seed.sql\n');

db.close();
