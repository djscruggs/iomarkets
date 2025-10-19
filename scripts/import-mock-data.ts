// Import all mock data from TypeScript files into SQLite
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DATABASE_PATH || join(__dirname, '../db/iomarkets.db');

// Import mock data (we'll need to manually convert from TS)
// For now, we'll use the data directly since this is a JS file
import { mockInvestments } from '../src/data/mockInvestments.js';
import { mockSponsors, mockDueDiligenceAssets } from '../src/data/mockDueDiligence.js';

console.log('Opening database at:', DB_PATH);
const db = new Database(DB_PATH);

// Prepare insert statements
const insertInvestment = db.prepare(`
  INSERT OR REPLACE INTO investments (id, name, sponsor, target_raise, amount_raised, image_url, type, location, min_investment, projected_return, term)
  VALUES (@id, @name, @sponsor, @targetRaise, @amountRaised, @imageUrl, @type, @location, @minInvestment, @projectedReturn, @term)
`);

const insertSponsor = db.prepare(`
  INSERT OR REPLACE INTO sponsors (id, name, email, phone, linkedin_url, photo_url, total_deals, total_value)
  VALUES (@id, @name, @email, @phone, @linkedInUrl, @photoUrl, @totalDeals, @totalValue)
`);

const insertInvestmentSponsor = db.prepare(`
  INSERT OR REPLACE INTO investment_sponsors (investment_id, sponsor_id)
  VALUES (@investmentId, @sponsorId)
`);

const insertAsset = db.prepare(`
  INSERT OR REPLACE INTO due_diligence_assets (id, investment_id, name, type, url, thumbnail_url, uploaded_date, size)
  VALUES (@id, @investmentId, @name, @type, @url, @thumbnailUrl, @uploadedDate, @size)
`);

// Use transaction for better performance
const importAll = db.transaction(() => {
  console.log(`Importing ${mockInvestments.length} investments...`);

  // Import investments
  for (const investment of mockInvestments) {
    insertInvestment.run({
      id: investment.id,
      name: investment.name,
      sponsor: investment.sponsor,
      targetRaise: investment.targetRaise,
      amountRaised: investment.amountRaised,
      imageUrl: investment.imageUrl,
      type: investment.type,
      location: investment.location || null,
      minInvestment: investment.minInvestment,
      projectedReturn: investment.projectedReturn,
      term: investment.term
    });
  }
  console.log(`✓ Imported ${mockInvestments.length} investments`);

  // Import sponsors
  let sponsorCount = 0;
  for (const [investmentId, sponsors] of Object.entries(mockSponsors)) {
    for (const sponsor of sponsors) {
      insertSponsor.run({
        id: sponsor.id,
        name: sponsor.name,
        email: sponsor.email,
        phone: sponsor.phone,
        linkedInUrl: sponsor.linkedInUrl,
        photoUrl: sponsor.photoUrl,
        totalDeals: sponsor.totalDeals,
        totalValue: sponsor.totalValue
      });
      sponsorCount++;
    }
  }
  console.log(`✓ Imported ${sponsorCount} sponsors`);

  // Import investment-sponsor relationships
  let relationshipCount = 0;
  for (const [investmentId, sponsors] of Object.entries(mockSponsors)) {
    for (const sponsor of sponsors) {
      insertInvestmentSponsor.run({
        investmentId: investmentId,
        sponsorId: sponsor.id
      });
      relationshipCount++;
    }
  }
  console.log(`✓ Created ${relationshipCount} investment-sponsor relationships`);

  // Import due diligence assets
  let assetCount = 0;
  for (const [investmentId, assets] of Object.entries(mockDueDiligenceAssets)) {
    for (const asset of assets) {
      insertAsset.run({
        id: asset.id,
        investmentId: investmentId,
        name: asset.name,
        type: asset.type,
        url: asset.url,
        thumbnailUrl: asset.thumbnailUrl || null,
        uploadedDate: asset.uploadedDate,
        size: asset.size || null
      });
      assetCount++;
    }
  }
  console.log(`✓ Imported ${assetCount} due diligence assets`);
});

try {
  importAll();
  console.log('\n✓ All data imported successfully!');
} catch (error) {
  console.error('Error importing data:', error);
  process.exit(1);
} finally {
  db.close();
}
