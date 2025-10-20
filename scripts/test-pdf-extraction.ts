import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import { extractTextFromLocalPDF } from '../src/lib/gcp/document-ai.js';

async function main() {
  const pdfPath = './public/duediligence/holidayterrace/Ex 1 Cert of LP Holiday Terrace.pdf';

  console.log(`Testing PDF extraction for: ${pdfPath}\n`);

  try {
    const text = await extractTextFromLocalPDF(pdfPath);
    console.log('✓ Extraction successful');
    console.log('Length:', text.length, 'characters');
    console.log('\nFirst 500 characters:');
    console.log(text.substring(0, 500));
    console.log('\nLast 500 characters:');
    console.log(text.substring(Math.max(0, text.length - 500)));
  } catch (error: any) {
    console.error('✗ Extraction failed:', error.message);
  }
}

main();
