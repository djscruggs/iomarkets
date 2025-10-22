/**
 * Generate SQL INSERT statements from deal_names.csv
 *
 * This script reads the CSV and generates SQL INSERT statements
 * for new investments with all required fields.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeSqlString(str: string): string {
  // Escape single quotes by doubling them
  return str.replace(/'/g, "''");
}

function parseCsvLine(line: string): { id: string; name: string; description: string; category: string } | null {
  // More robust CSV parsing to handle quoted fields with commas
  const regex = /(?:^|,)("(?:[^"]|"")*"|[^,]*)/g;
  const matches = [...line.matchAll(regex)];
  const fields = matches.map(m => {
    let field = m[1];
    // Remove surrounding quotes if present
    if (field.startsWith('"') && field.endsWith('"')) {
      field = field.slice(1, -1);
      // Unescape double quotes
      field = field.replace(/""/g, '"');
    }
    return field.trim();
  }).filter(f => f !== '');

  if (fields.length < 4) {
    return null;
  }

  return {
    id: fields[0],
    name: fields[1],
    description: fields[2],
    category: fields[3]
  };
}

function categoryToType(category: string): 'real-estate' | 'private-equity' {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('real estate') || lowerCategory.includes('infrastructure')) {
    return 'real-estate';
  }
  return 'private-equity';
}

function extractRaiseAmount(description: string): number {
  // Match patterns like "raising USD 25M", "raise EUR 6.5M", "seeking GBP 1.25M", "looking for USD 500K", etc.
  // Also matches "circa USD 20M", "up to GBP 5M", "initial USD 135M"
  const patterns = [
    // Matches: "raising/seeking/looking for [circa/up to/initial] USD/EUR/GBP 25M"
    /(?:raising|raise|seeking|looking for|looking to raise|required for)\s+(?:circa|up to|initial|a)?\s*(?:USD|EUR|GBP)\s*([\d,.]+)\s*([KMB])/i,
    // Matches: "circa/up to/initial USD/EUR/GBP 20M"
    /(?:circa|up to|initial)\s+(?:USD|EUR|GBP)\s*([\d,.]+)\s*([KMB])/i,
    // Matches: "USD/EUR/GBP 15M bridge loan" or just "EUR 15M"
    /(?:USD|EUR|GBP)\s*([\d,.]+)\s*([KMB])\s+(?:bridge|loan|fund|round|equity|debt|pre-IPO|for)/i,
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(',', '.'));
      const unit = match[2].toUpperCase();

      // Convert to base currency (assuming USD, will store in database as-is)
      if (unit === 'M') {
        return Math.round(amount * 1000000);
      } else if (unit === 'B') {
        return Math.round(amount * 1000000000);
      } else if (unit === 'K') {
        return Math.round(amount * 1000);
      }
    }
  }

  // Default to 1M if no amount found
  return 1000000;
}

function getTechAndPESponsors(): string[] {
  // Tech-focused venture capital and private equity sponsors
  return [
    // Venture Capital - Tech Focus
    'Accel Partners',
    'Andreessen Horowitz',
    'Benchmark Capital',
    'Sequoia Capital',
    'Greylock Partners',
    'Kleiner Perkins',
    'Index Ventures',
    'Lightspeed Venture Partners',
    'NEA (New Enterprise Associates)',
    'General Catalyst',
    'Insight Partners',
    'Battery Ventures',
    'Foundation Capital',
    'FirstMark Capital',
    'Emergence Capital',

    // Growth Equity & Late Stage
    'Tiger Global Management',
    'Coatue Management',
    'DST Global',
    'SoftBank Vision Fund',
    'General Atlantic',
    'Silver Lake Partners',
    'Vista Equity Partners',
    'Thoma Bravo',
    'Francisco Partners',
    'Blackstone Growth',

    // Sector-Specific VC
    'Khosla Ventures',
    'Founders Fund',
    'Union Square Ventures',
    'Spark Capital',
    'Redpoint Ventures',
    'GGV Capital',
    'DCM Ventures',
    'Balderton Capital',
    'Atomico',
    'Bessemer Venture Partners',

    // Early Stage & Seed
    'Y Combinator',
    'Techstars Ventures',
    '500 Global',
    'First Round Capital',
    'Initialized Capital',
    'Plug and Play Ventures',
    'SV Angel',
    'Seedcamp',

    // European Tech
    'Northzone',
    'Partech Partners',
    'Lakestar',
    'EQT Ventures',
    'Creandum',

    // Asia-Pacific Tech
    'Vertex Ventures',
    'Gobi Partners',
    'Monk\'s Hill Ventures',
    'East Ventures',

    // Impact & Clean Tech
    'Energy Impact Partners',
    'Breakthrough Energy Ventures',
    'Congruent Ventures',
    'Lowercarbon Capital',
    'Prime Impact Fund',

    // Healthcare & BioTech
    'Sofinnova Partners',
    'OrbiMed',
    'RA Capital Management',
    'Versant Ventures',
    'Atlas Venture',

    // Fintech Focused
    'Ribbit Capital',
    'QED Investors',
    'Anthemis Group',
    'Commerce Ventures',

    // Consumer & Enterprise
    'IVP (Institutional Venture Partners)',
    'Norwest Venture Partners',
    'Scale Venture Partners',
    'Canaan Partners',
    'Menlo Ventures'
  ];
}

function getRandomSponsor(sponsors: string[]): string {
  return sponsors[Math.floor(Math.random() * sponsors.length)];
}

function getRandomAmountRaised(targetRaise: number): number {
  // Generate random amount between 0 and 90% of target_raise
  const percentage = Math.random() * 0.9; // 0 to 0.9 (0% to 90%)
  const rawAmount = targetRaise * percentage;

  // Round to nearest 50,000
  const roundTo = 50000;
  return Math.round(rawAmount / roundTo) * roundTo;
}

async function main() {
  const csvPath = path.join(__dirname, '..', 'deal_names.csv');
  const outputPath = path.join(__dirname, '..', 'db', 'investment-descriptions.sql');

  // Use tech and private equity focused sponsors
  console.log('Loading tech and PE sponsors...');
  const sponsors = getTechAndPESponsors();
  console.log(`✓ Loaded ${sponsors.length} tech/PE sponsors`);

  // Read CSV file
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');

  // Skip header row
  const dataLines = lines.slice(1).filter(line => line.trim().length > 0);

  const sqlStatements: string[] = [];
  sqlStatements.push('-- Generated investment INSERT statements');
  sqlStatements.push('-- Source: deal_names.csv');
  sqlStatements.push('-- Generated on: ' + new Date().toISOString());
  sqlStatements.push('-- Note: Uses random tech/PE sponsors and amount_raised (0-90% of target_raise)');
  sqlStatements.push('');

  const values: string[] = [];

  for (const line of dataLines) {
    const parsed = parseCsvLine(line);

    if (!parsed) {
      console.warn(`Skipping malformed line: ${line}`);
      continue;
    }

    const { id, name, description, category } = parsed;
    const type = categoryToType(category);
    const targetRaise = extractRaiseAmount(description);
    const amountRaised = getRandomAmountRaised(targetRaise);
    const sponsor = getRandomSponsor(sponsors);

    // Generate INSERT statement with random sponsor and amount_raised (0-90% of target)
    // Required fields: id, name, sponsor, target_raise, amount_raised, image_url, type, min_investment, projected_return, term, description
    const value = `('${id}', '${escapeSqlString(name)}', '${escapeSqlString(sponsor)}', ${targetRaise}, ${amountRaised}, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop', '${type}', NULL, 50000, 15.0, '5 years', 0, '${escapeSqlString(description)}')`;
    values.push(value);
  }

  // Create multi-row INSERT statement
  sqlStatements.push('INSERT INTO investments (id, name, sponsor, target_raise, amount_raised, image_url, type, location, min_investment, projected_return, term, featured, description) VALUES');

  // Join values with commas and semicolon at the end
  for (let i = 0; i < values.length; i++) {
    const suffix = i < values.length - 1 ? ',' : ';';
    sqlStatements.push(values[i] + suffix);
  }

  // Write to output file
  const outputContent = sqlStatements.join('\n');
  fs.writeFileSync(outputPath, outputContent, 'utf-8');

  console.log(`✓ Generated INSERT statement with ${values.length} investments`);
  console.log(`✓ Output written to: ${outputPath}`);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
