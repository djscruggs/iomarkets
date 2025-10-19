// Generate complete seed.sql file from TypeScript mock data
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mockInvestments } from '../src/data/mockInvestments.js';
import { mockSponsors, mockDueDiligenceAssets } from '../src/data/mockDueDiligence.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SEED_PATH = join(__dirname, '../db/seed.sql');

// Escape SQL strings
function escapeSql(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  return `'${value.replace(/'/g, "''")}'`;
}

let sql = `-- Seed data for IOMarkets MVP
-- Auto-generated from TypeScript mock data
-- DO NOT EDIT MANUALLY - regenerate with: npm run db:generate-seed

`;

// Generate investments
sql += `-- Insert all ${mockInvestments.length} investments\n`;
sql += `INSERT INTO investments (id, name, sponsor, target_raise, amount_raised, image_url, type, location, min_investment, projected_return, term) VALUES\n`;

const investmentValues = mockInvestments.map(inv => {
  return `(${escapeSql(inv.id)}, ${escapeSql(inv.name)}, ${escapeSql(inv.sponsor)}, ${inv.targetRaise}, ${inv.amountRaised}, ${escapeSql(inv.imageUrl)}, ${escapeSql(inv.type)}, ${inv.location ? escapeSql(inv.location) : 'NULL'}, ${inv.minInvestment}, ${inv.projectedReturn}, ${escapeSql(inv.term)})`;
});

sql += investmentValues.join(',\n') + ';\n\n';

// Generate sponsors
const uniqueSponsors = new Map<string, any>();
for (const sponsors of Object.values(mockSponsors)) {
  for (const sponsor of sponsors) {
    uniqueSponsors.set(sponsor.id, sponsor);
  }
}

sql += `-- Insert all ${uniqueSponsors.size} sponsors\n`;
sql += `INSERT INTO sponsors (id, name, email, phone, linkedin_url, photo_url, total_deals, total_value) VALUES\n`;

const sponsorValues = Array.from(uniqueSponsors.values()).map(sponsor => {
  return `(${escapeSql(sponsor.id)}, ${escapeSql(sponsor.name)}, ${escapeSql(sponsor.email)}, ${escapeSql(sponsor.phone)}, ${escapeSql(sponsor.linkedInUrl)}, ${escapeSql(sponsor.photoUrl)}, ${sponsor.totalDeals}, ${sponsor.totalValue})`;
});

sql += sponsorValues.join(',\n') + ';\n\n';

// Generate investment-sponsor relationships
sql += `-- Insert investment-sponsor relationships\n`;
sql += `INSERT INTO investment_sponsors (investment_id, sponsor_id) VALUES\n`;

const relationshipValues: string[] = [];
for (const [investmentId, sponsors] of Object.entries(mockSponsors)) {
  for (const sponsor of sponsors) {
    relationshipValues.push(`(${escapeSql(investmentId)}, ${escapeSql(sponsor.id)})`);
  }
}

sql += relationshipValues.join(',\n') + ';\n\n';

// Generate due diligence assets
let totalAssets = 0;
for (const assets of Object.values(mockDueDiligenceAssets)) {
  totalAssets += assets.length;
}

sql += `-- Insert all ${totalAssets} due diligence assets\n`;
sql += `INSERT INTO due_diligence_assets (id, investment_id, name, type, url, thumbnail_url, uploaded_date, size) VALUES\n`;

const assetValues: string[] = [];
for (const [investmentId, assets] of Object.entries(mockDueDiligenceAssets)) {
  for (const asset of assets) {
    assetValues.push(
      `(${escapeSql(asset.id)}, ${escapeSql(investmentId)}, ${escapeSql(asset.name)}, ${escapeSql(asset.type)}, ${escapeSql(asset.url)}, ${asset.thumbnailUrl ? escapeSql(asset.thumbnailUrl) : 'NULL'}, ${escapeSql(asset.uploadedDate)}, ${asset.size ? escapeSql(asset.size) : 'NULL'})`
    );
  }
}

sql += assetValues.join(',\n') + ';\n';

// Write to file
writeFileSync(SEED_PATH, sql, 'utf8');

console.log('✓ Generated seed.sql successfully!');
console.log(`  - ${mockInvestments.length} investments`);
console.log(`  - ${uniqueSponsors.size} sponsors`);
console.log(`  - ${relationshipValues.length} investment-sponsor relationships`);
console.log(`  - ${totalAssets} due diligence assets`);
console.log(`\nFile: ${SEED_PATH}`);
