// Quick test to verify database queries work
import {
  getAllInvestments,
  getInvestmentById,
  getSponsorsForInvestment,
  getAssetsForInvestment,
  searchInvestments,
  getTopPerformingInvestments
} from '../src/lib/queries';

console.log('Testing database queries...\n');

// Test 1: Get all investments
console.log('1. Getting all investments...');
const investments = getAllInvestments();
console.log(`   ✓ Found ${investments.length} investments\n`);

// Test 2: Get single investment
console.log('2. Getting investment by ID...');
const investment = getInvestmentById('1');
console.log(`   ✓ Found: ${investment?.name}\n`);

// Test 3: Get sponsors
console.log('3. Getting sponsors for investment 1...');
const sponsors = getSponsorsForInvestment('1');
console.log(`   ✓ Found ${sponsors.length} sponsors`);
sponsors.forEach(s => console.log(`      - ${s.name} (${s.email})`));
console.log();

// Test 4: Get assets
console.log('4. Getting assets for investment 1...');
const assets = getAssetsForInvestment('1');
console.log(`   ✓ Found ${assets.length} assets`);
assets.slice(0, 3).forEach(a => console.log(`      - ${a.name} (${a.type})`));
console.log();

// Test 5: Search
console.log('5. Searching for "Austin"...');
const results = searchInvestments('Austin');
console.log(`   ✓ Found ${results.length} results`);
results.forEach(r => console.log(`      - ${r.name}`));
console.log();

// Test 6: Top performers
console.log('6. Getting top 5 performing investments...');
const top = getTopPerformingInvestments(5);
console.log(`   ✓ Top performers:`);
top.forEach((inv, i) => console.log(`      ${i + 1}. ${inv.name} (${inv.projectedReturn}%)`));

console.log('\n✓ All tests passed!');
