// Generate complete seed.sql with all investments from investment-descriptions.sql
const fs = require('fs');
const path = require('path');

console.log('Generating complete seed.sql...');

// Read the investment-descriptions.sql file
const descriptionsPath = path.join(__dirname, '../db/investment-descriptions.sql');
const descriptionsContent = fs.readFileSync(descriptionsPath, 'utf8');

// Extract the INSERT statement
const insertMatch = descriptionsContent.match(/INSERT INTO investments.*?;/s);
if (!insertMatch) {
  console.error('Could not find INSERT statement in investment-descriptions.sql');
  process.exit(1);
}

let investmentsInsert = insertMatch[0];

// Check if Holiday Terrace (#51) is already in the file
if (!investmentsInsert.includes("'51'")) {
  // Add Holiday Terrace before the closing semicolon
  investmentsInsert = investmentsInsert.replace(/\);$/, "),\n('51', 'Holiday Terrace Apartments', 'DJ Scruggs & Manuel Perez', 1100000, 900000, '/duediligence/holidayterrace/photos/Exterior_On_Schaefer.jpg', 'real-estate', 'Branson, MO', 50000, 13.8, '5 years', 1, NULL);");
}

// Get all investment IDs
const investmentIds = [];
const idMatches = descriptionsContent.matchAll(/\('([^']+)',/g);
for (const match of idMatches) {
  investmentIds.push(match[1]);
}

// Ensure '51' is in the list if not already
if (!investmentIds.includes('51')) {
  investmentIds.push('51');
}

console.log(`Found ${investmentIds.length} investments`);

// Create 15 sponsors (s1-s15)
const sponsorNames = [
  { id: 's1', name: 'Michael Rodriguez', email: 'mrodriguez@ventures.com', phone: '+1 (512) 555-0123', linkedin: 'https://linkedin.com/in/michael-rodriguez', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop' },
  { id: 's2', name: 'Sarah Chen', email: 'schen@capital.com', phone: '+1 (650) 555-0124', linkedin: 'https://linkedin.com/in/sarah-chen', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop' },
  { id: 's3', name: 'David Park', email: 'dpark@partners.com', phone: '+1 (415) 555-0200', linkedin: 'https://linkedin.com/in/david-park', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop' },
  { id: 's4', name: 'James Thompson', email: 'jthompson@ventures.com', phone: '+1 (512) 555-0125', linkedin: 'https://linkedin.com/in/james-thompson', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop' },
  { id: 's5', name: 'Emily Martinez', email: 'emartinez@capital.com', phone: '+1 (305) 555-0126', linkedin: 'https://linkedin.com/in/emily-martinez', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop' },
  { id: 's6', name: 'Robert Kim', email: 'rkim@partners.com', phone: '+1 (212) 555-0127', linkedin: 'https://linkedin.com/in/robert-kim', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop' },
  { id: 's7', name: 'Jennifer Liu', email: 'jliu@ventures.com', phone: '+1 (415) 555-0128', linkedin: 'https://linkedin.com/in/jennifer-liu', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop' },
  { id: 's8', name: 'Thomas Anderson', email: 'tanderson@capital.com', phone: '+1 (617) 555-0129', linkedin: 'https://linkedin.com/in/thomas-anderson', photo: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&auto=format&fit=crop' },
  { id: 's9', name: 'Maria Garcia', email: 'mgarcia@partners.com', phone: '+1 (310) 555-0130', linkedin: 'https://linkedin.com/in/maria-garcia', photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&auto=format&fit=crop' },
  { id: 's10', name: 'William Foster', email: 'wfoster@ventures.com', phone: '+1 (404) 555-0131', linkedin: 'https://linkedin.com/in/william-foster', photo: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop' },
  { id: 's11', name: 'Lisa Patel', email: 'lpatel@capital.com', phone: '+1 (512) 555-0132', linkedin: 'https://linkedin.com/in/lisa-patel', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop' },
  { id: 's12', name: 'Christopher Lee', email: 'clee@partners.com', phone: '+1 (206) 555-0133', linkedin: 'https://linkedin.com/in/christopher-lee', photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop' },
  { id: 's13', name: 'Amanda Wright', email: 'awright@ventures.com', phone: '+1 (303) 555-0134', linkedin: 'https://linkedin.com/in/amanda-wright', photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop' },
  { id: 's14', name: 'Daniel Brown', email: 'dbrown@capital.com', phone: '+1 (512) 555-0135', linkedin: 'https://linkedin.com/in/daniel-brown', photo: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&auto=format&fit=crop' },
  { id: 's15', name: 'Rachel Cohen', email: 'rcohen@partners.com', phone: '+1 (617) 555-0136', linkedin: 'https://linkedin.com/in/rachel-cohen', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop' },
  { id: 's51', name: 'DJ Scruggs', email: 'dj@djscruggs.com', phone: '303-808-6614', linkedin: 'https://www.linkedin.com/in/djscruggs/', photo: 'https://media.licdn.com/dms/image/v2/D4E03AQGs3VKL9Tw6ig/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1723215901933?e=1762387200&v=beta&t=2KjajlPp9d2Rte_il5IOnk_zX1f8XDQT4zK2U5kPy3M' },
  { id: 's52', name: 'Manuel Perez', email: 'dj+manuel@djscruggs.com', phone: '303-808-6614', linkedin: 'https://www.linkedin.com/in/manny-perez-369b1541/', photo: 'https://media.licdn.com/dms/image/v2/C4E03AQGmajoAoV1OgQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1522183510537?e=1762387200&v=beta&t=LBPuvUpsPei2SkAadppuW1xrvRCx1VsaQoEy8vyRmA8' },
];

const sponsorsInsert = 'INSERT INTO sponsors (id, name, email, phone, linkedin_url, photo_url, total_deals, total_value) VALUES\n' +
  sponsorNames.map(s => {
    const deals = s.id.startsWith('s5') ? 1 : Math.floor(Math.random() * 20) + 10;
    const value = s.id.startsWith('s5') ? 1100000 : Math.floor(Math.random() * 500000000) + 200000000;
    return `('${s.id}', '${s.name}', '${s.email}', '${s.phone}', '${s.linkedin}', '${s.photo}', ${deals}, ${value})`;
  }).join(',\n') + ';';

// Generate random sponsor assignments
const sponsors = Array.from({length: 15}, (_, i) => 's' + (i + 1));
const assignments = [];

for (const invId of investmentIds) {
  if (invId === '51') {
    // Holiday Terrace gets DJ & Manuel
    continue;
  }

  const numSponsors = Math.floor(Math.random() * 3) + 2; // 2-4 sponsors
  const shuffled = [...sponsors].sort(() => Math.random() - 0.5);
  const selectedSponsors = shuffled.slice(0, numSponsors);

  for (const sponsorId of selectedSponsors) {
    assignments.push(`('${invId}', '${sponsorId}')`);
  }
}

// Add Holiday Terrace sponsors
assignments.push("('51', 's51')");
assignments.push("('51', 's52')");

console.log(`Generated ${assignments.length} sponsor-investment relationships`);

const relationshipsInsert = 'INSERT INTO investment_sponsors (investment_id, sponsor_id) VALUES\n' +
  assignments.join(',\n') + ';';

// Due diligence assets for Holiday Terrace
const assetsInsert = `INSERT INTO due_diligence_assets (id, investment_id, name, type, url, thumbnail_url, uploaded_date, size) VALUES
('ht-ex-1-cert-of-lp-51-pdf', '51', 'Ex 1 Cert of LP Holiday Terrace', 'pdf', '/duediligence/holidayterrace/Ex 1 Cert of LP Holiday Terrace.pdf', NULL, '2025-10-19', '0.2 MB'),
('ht-ex-2-lpa-51-04182018-pdf', '51', 'Ex 2 LPA Holiday Terrace 04182018', 'pdf', '/duediligence/holidayterrace/Ex 2 LPA Holiday Terrace 04182018.pdf', NULL, '2025-10-19', '0.8 MB'),
('ht-ex-3-sa-51-pdf', '51', 'Ex 3 SA Holiday Terrace', 'pdf', '/duediligence/holidayterrace/Ex 3 SA Holiday Terrace.pdf', NULL, '2025-10-19', '0.3 MB'),
('ht-ex-3-sa-receipt-pdf', '51', 'Ex 3 SA receipt', 'pdf', '/duediligence/holidayterrace/Ex 3 SA receipt.pdf', NULL, '2025-10-19', '0.1 MB'),
('ht-photo-1b-bedrm-jpg', '51', '1B Bedrm', 'image', '/duediligence/holidayterrace/photos/1B_Bedrm.jpg', NULL, '2025-10-19', '0.2 MB'),
('ht-photo-1b-kitchen-jpg', '51', '1B Kitchen', 'image', '/duediligence/holidayterrace/photos/1B_Kitchen.jpg', NULL, '2025-10-19', '0.2 MB'),
('ht-photo-1b-liv-rm-jpg', '51', '1B Liv Rm', 'image', '/duediligence/holidayterrace/photos/1B_Liv_Rm.jpg', NULL, '2025-10-19', '0.2 MB'),
('ht-photo-bath-vanity-jpg', '51', 'Bath Vanity', 'image', '/duediligence/holidayterrace/photos/Bath_Vanity.jpg', NULL, '2025-10-19', '0.2 MB'),
('ht-photo-clubhouse-jpg', '51', 'Clubhouse', 'image', '/duediligence/holidayterrace/photos/Clubhouse.JPG', NULL, '2025-10-19', '2.0 MB'),
('ht-photo-exercise-rm-jpg', '51', 'Exercise Rm', 'image', '/duediligence/holidayterrace/photos/Exercise_Rm.jpg', NULL, '2025-10-19', '0.1 MB'),
('ht-photo-exterior-on-schaefer-jpg', '51', 'Exterior On Schaefer', 'image', '/duediligence/holidayterrace/photos/Exterior_On_Schaefer.jpg', NULL, '2025-10-19', '0.2 MB'),
('ht-photo-indoor-pool-jpg', '51', 'Indoor Pool', 'image', '/duediligence/holidayterrace/photos/Indoor_Pool.jpg', NULL, '2025-10-19', '0.2 MB'),
('ht-photo-laundry-jpg', '51', 'Laundry', 'image', '/duediligence/holidayterrace/photos/Laundry.jpg', NULL, '2025-10-19', '0.1 MB'),
('ht-photo-map-1-png', '51', 'Map 1', 'image', '/duediligence/holidayterrace/photos/Map_1.png', NULL, '2025-10-19', '0.1 MB'),
('ht-ppm-51-04182018-pdf', '51', 'PPM Holiday Terrace 04182018', 'pdf', '/duediligence/holidayterrace/PPM Holiday Terrace 04182018.pdf', NULL, '2025-10-19', '0.7 MB'),
('ht-supp-sa-51-pdf', '51', 'Supp SA Holiday Terrace', 'pdf', '/duediligence/holidayterrace/Supp SA Holiday Terrace.pdf', NULL, '2025-10-19', '0.2 MB');`;

// Build the complete seed file
const seedContent = `-- Seed data for IOMarkets MVP
-- Auto-generated seed file
-- Last updated: ${new Date().toISOString().split('T')[0]}
-- DO NOT EDIT MANUALLY - regenerate using npm run db:generate-full-seed

-- Import ALL investment data from investment-descriptions.sql
${investmentsInsert}

-- Insert sponsors (management team members)
${sponsorsInsert}

-- Generate random investment-sponsor relationships
-- Each investment gets 2-4 random sponsors from s1-s15
-- Investment 51 (Holiday Terrace) gets DJ & Manuel
${relationshipsInsert}

-- Insert due diligence assets for Holiday Terrace (investment 51)
${assetsInsert}
`;

// Write the seed file
const seedPath = path.join(__dirname, '../db/seed.sql');
fs.writeFileSync(seedPath, seedContent, 'utf8');

console.log(`\n✅ Generated complete seed.sql with:`);
console.log(`   - ${investmentIds.length} investments`);
console.log(`   - ${sponsorNames.length} sponsors`);
console.log(`   - ${assignments.length} sponsor-investment relationships`);
console.log(`   - 16 due diligence assets`);
console.log(`\nFile: ${seedPath}`);
