/**
 * Test pdf-parse import to understand its structure
 */

import { createRequire } from 'module';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

console.log('typeof pdfParse:', typeof pdfParse);
console.log('pdfParse keys:', Object.keys(pdfParse));
console.log('typeof pdfParse.default:', typeof pdfParse.default);
console.log('pdfParse:', pdfParse);

// Try to use it
const testPdfPath = path.join(__dirname, '..', 'public', 'duediligence', 'holidayterrace', 'Ex 3 SA receipt.pdf');
const dataBuffer = fs.readFileSync(testPdfPath);

console.log('\nTrying to parse PDF...');

try {
  const data = await pdfParse(dataBuffer);
  console.log('SUCCESS with pdfParse(dataBuffer)');
  console.log('Text length:', data.text.length);
} catch (error: any) {
  console.log('FAILED with pdfParse(dataBuffer):', error.message);

  try {
    const data = await pdfParse.default(dataBuffer);
    console.log('SUCCESS with pdfParse.default(dataBuffer)');
    console.log('Text length:', data.text.length);
  } catch (error2: any) {
    console.log('FAILED with pdfParse.default(dataBuffer):', error2.message);

    try {
      const parser = new pdfParse.PDFParse();
      const data = await parser.parse(dataBuffer);
      console.log('SUCCESS with new pdfParse.PDFParse().parse(dataBuffer)');
      console.log('Text length:', data.text.length);
    } catch (error3: any) {
      console.log('FAILED with new pdfParse.PDFParse().parse(dataBuffer):', error3.message);
    }
  }
}
