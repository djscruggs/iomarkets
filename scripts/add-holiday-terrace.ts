// Add Holiday Terrace real investment to database
import { getDb } from '../src/lib/db.js';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const db = getDb();

console.log('Adding Holiday Terrace investment...\n');

// Investment details
const investment = {
  id: 'holiday-terrace',
  name: 'Holiday Terrace Apartments',
  sponsor: 'DJ Scruggs & Manuel Perez',
  targetRaise: 1100000,
  amountRaised: 900000,
  imageUrl: '/duediligence/holidayterrace/photos/Exterior_On_Schaefer.jpg',
  type: 'real-estate',
  location: 'Branson, MO',
  minInvestment: 50000,
  projectedReturn: 13.8,
  term: '5 years'
};

// Sponsors
const sponsors = [
  {
    id: 'dj-scruggs',
    name: 'DJ Scruggs',
    email: 'dj@djscruggs.com',  // Made unique to satisfy UNIQUE constraint
    phone: '303-808-6614',
    linkedInUrl: 'https://www.linkedin.com/in/djscruggs/',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop',
    totalDeals: 1,
    totalValue: 1100000
  },
  {
    id: 'manuel-perez',
    name: 'Manuel Perez',
    email: 'manuel@djscruggs.com',  // Made unique to satisfy UNIQUE constraint
    phone: '303-808-6614',
    linkedInUrl: 'https://www.linkedin.com/in/manny-perez-369b1541/',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop',
    totalDeals: 1,
    totalValue: 1100000
  }
];

// Begin transaction
const addHolidayTerrace = db.transaction(() => {
  // 1. Insert investment
  const insertInvestment = db.prepare(`
    INSERT OR REPLACE INTO investments
    (id, name, sponsor, target_raise, amount_raised, image_url, type, location, min_investment, projected_return, term)
    VALUES (@id, @name, @sponsor, @targetRaise, @amountRaised, @imageUrl, @type, @location, @minInvestment, @projectedReturn, @term)
  `);

  insertInvestment.run(investment);
  console.log('✓ Added investment: Holiday Terrace Apartments');

  // 2. Insert sponsors
  const insertSponsor = db.prepare(`
    INSERT OR REPLACE INTO sponsors
    (id, name, email, phone, linkedin_url, photo_url, total_deals, total_value)
    VALUES (@id, @name, @email, @phone, @linkedInUrl, @photoUrl, @totalDeals, @totalValue)
  `);

  for (const sponsor of sponsors) {
    try {
      insertSponsor.run(sponsor);
      console.log(`✓ Added sponsor: ${sponsor.name}`);
    } catch (err) {
      console.error(`Error adding sponsor ${sponsor.name}:`, err);
      throw err;
    }
  }

  // Verify sponsors were added
  const checkSponsor = db.prepare(`SELECT COUNT(*) as count FROM sponsors WHERE id IN (?, ?)`);
  const sponsorCheck = checkSponsor.get(sponsors[0].id, sponsors[1].id) as { count: number };
  console.log(`✓ Verified ${sponsorCheck.count} sponsors in database`);

  // 3. Link sponsors to investment
  // First delete existing relationships for this investment
  const deleteRelationships = db.prepare(`
    DELETE FROM investment_sponsors WHERE investment_id = ?
  `);
  deleteRelationships.run(investment.id);

  const insertRelationship = db.prepare(`
    INSERT INTO investment_sponsors (investment_id, sponsor_id)
    VALUES (?, ?)
  `);

  for (const sponsor of sponsors) {
    insertRelationship.run(investment.id, sponsor.id);
  }
  console.log('✓ Linked sponsors to investment');

  // 4. Add PDF documents as assets
  const insertAsset = db.prepare(`
    INSERT OR REPLACE INTO due_diligence_assets
    (id, investment_id, name, type, url, uploaded_date, size)
    VALUES (@id, @investmentId, @name, @type, @url, @uploadedDate, @size)
  `);

  const docsPath = 'duediligence/holidayterrace';
  const files = readdirSync(docsPath);

  let assetCount = 0;
  const today = new Date().toISOString().split('T')[0];

  // Add PDFs
  files.forEach(file => {
    if (file.endsWith('.pdf')) {
      const filePath = join(docsPath, file);
      const stats = statSync(filePath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);

      insertAsset.run({
        id: `ht-${file.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
        investmentId: investment.id,
        name: file.replace('.pdf', ''),
        type: 'pdf',
        url: `/${docsPath}/${file}`,
        uploadedDate: today,
        size: `${sizeMB} MB`
      });
      assetCount++;
    }
  });

  console.log(`✓ Added ${assetCount} PDF documents`);

  // 5. Add photos as image assets
  const photosPath = join(docsPath, 'photos');
  const photos = readdirSync(photosPath);

  let photoCount = 0;
  photos.forEach(photo => {
    if (photo.match(/\.(jpg|jpeg|png)$/i)) {
      const filePath = join(photosPath, photo);
      const stats = statSync(filePath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);

      // Use photo as both url and thumbnail
      const photoUrl = `/${photosPath}/${photo}`;

      insertAsset.run({
        id: `ht-photo-${photo.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
        investmentId: investment.id,
        name: photo.replace(/\.(jpg|jpeg|png)$/i, '').replace(/_/g, ' '),
        type: 'image',
        url: photoUrl,
        uploadedDate: today,
        size: `${sizeMB} MB`
      });
      photoCount++;
    }
  });

  console.log(`✓ Added ${photoCount} property photos`);
});

try {
  addHolidayTerrace();
  console.log('\n✅ Holiday Terrace investment added successfully!');
  console.log('\nInvestment ID: holiday-terrace');
  console.log('View at: http://localhost:5173/investment/holiday-terrace');
} catch (error) {
  console.error('❌ Error adding Holiday Terrace:', error);
  process.exit(1);
}
