#!/usr/bin/env tsx

/**
 * Index Deal 51 (Holiday Terrace) Documents with Hybrid Approach
 * 
 * This script:
 * 1. Reads PDF documents from /public/duediligence/holidayterrace
 * 2. Extracts text content using Document AI + pdf-parse
 * 3. Stores content in database with smart caching
 * 4. Optimizes for efficient chat with document selection
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { extractTextFromLocalPDF } from '../src/lib/gcp/document-ai.js';
import { indexDocumentsHybrid } from '../src/lib/gcp/gen-ai-hybrid.js';
import { getDb } from '../src/lib/db.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INVESTMENT_ID = '51';
const DEAL_NAME = 'Holiday Terrace Apartments';
const DOCUMENTS_PATH = path.join(__dirname, '..', 'public', 'duediligence', 'holidayterrace');

interface DocumentWithContent {
  id: string;
  title: string;
  content: string;
  contentLength: number;
}

/**
 * Get all PDF files from the Holiday Terrace directory
 */
function getHolidayTerracePDFs(): Array<{
  filename: string;
  filepath: string;
  size: string;
}> {
  const pdfs: Array<{ filename: string; filepath: string; size: string }> = [];
  
  try {
    const files = fs.readdirSync(DOCUMENTS_PATH);
    
    for (const file of files) {
      if (file.toLowerCase().endsWith('.pdf')) {
        const filepath = path.join(DOCUMENTS_PATH, file);
        const stats = fs.statSync(filepath);
        const sizeInMB = (stats.size / (1024 * 1024)).toFixed(1);
        
        pdfs.push({
          filename: file,
          filepath,
          size: `${sizeInMB} MB`
        });
      }
    }
    
    console.log(`Found ${pdfs.length} PDF files in Holiday Terrace directory`);
    return pdfs;
  } catch (error) {
    console.error('Error reading Holiday Terrace directory:', error);
    return [];
  }
}

/**
 * Extract text from a PDF file
 */
async function extractPDFText(filepath: string, filename: string): Promise<string> {
  try {
    console.log(`Extracting text from ${filename}...`);
    const text = await extractTextFromLocalPDF(filepath);
    console.log(`✓ Extracted ${text.length} characters from ${filename}`);
    return text;
  } catch (error: any) {
    console.error(`✗ Failed to extract text from ${filename}:`, error.message);
    throw error;
  }
}

/**
 * Main indexing function
 */
async function indexDeal51WithHybrid(): Promise<void> {
  console.log(`\n🏠 Indexing Deal ${INVESTMENT_ID}: ${DEAL_NAME} with Hybrid Approach`);
  console.log(`📁 Documents path: ${DOCUMENTS_PATH}`);
  
  try {
    // 1. Get all PDF files
    const pdfFiles = getHolidayTerracePDFs();
    
    if (pdfFiles.length === 0) {
      throw new Error('No PDF files found in Holiday Terrace directory');
    }
    
    console.log(`\n📄 Found ${pdfFiles.length} PDF documents:`);
    pdfFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.filename} (${file.size})`);
    });
    
    // 2. Extract text from each PDF
    console.log(`\n🔍 Extracting text content...`);
    const documentsWithContent: DocumentWithContent[] = [];
    
    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i];
      
      try {
        const content = await extractPDFText(file.filepath, file.filename);
        
        // Create document ID from filename
        const docId = file.filename
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        documentsWithContent.push({
          id: docId,
          title: file.filename,
          content,
          contentLength: content.length
        });
        
        console.log(`  ✓ [${i + 1}/${pdfFiles.length}] ${file.filename} - ${content.length} chars`);
      } catch (error: any) {
        console.error(`  ✗ [${i + 1}/${pdfFiles.length}] Failed: ${file.filename} - ${error.message}`);
        // Continue with other files
      }
    }
    
    if (documentsWithContent.length === 0) {
      throw new Error('No documents could be processed successfully');
    }
    
    console.log(`\n📊 Successfully processed ${documentsWithContent.length}/${pdfFiles.length} documents`);
    
    // 3. Index with hybrid approach
    console.log(`\n🚀 Indexing with hybrid approach...`);
    await indexDocumentsHybrid(INVESTMENT_ID, documentsWithContent);
    
    // 4. Summary
    const totalContentLength = documentsWithContent.reduce((sum, doc) => sum + doc.contentLength, 0);
    
    console.log(`\n🎉 Deal ${INVESTMENT_ID} hybrid indexing complete!`);
    console.log(`📈 Summary:`);
    console.log(`   • Documents processed: ${documentsWithContent.length}`);
    console.log(`   • Total content: ${totalContentLength.toLocaleString()} characters`);
    console.log(`   • Average per document: ${Math.round(totalContentLength / documentsWithContent.length).toLocaleString()} characters`);
    console.log(`   • Status: Ready for optimized AI chat`);
    
    console.log(`\n💡 Hybrid Approach Benefits:`);
    console.log(`   • ⚡ Smart document selection (only relevant content sent)`);
    console.log(`   • 🧠 Intelligent keyword matching`);
    console.log(`   • 📊 Optimized token usage (max 8K tokens per query)`);
    console.log(`   • 🔄 Efficient caching and retrieval`);
    console.log(`   • 💰 Cost-effective (reduces API costs)`);
    
    console.log(`\n🚀 Next steps:`);
    console.log(`   1. Start the dev server: npm run dev`);
    console.log(`   2. Navigate to: http://localhost:5173/investment/51/due-diligence`);
    console.log(`   3. Test AI chat with questions like:`);
    console.log(`      • "What is the projected return for Holiday Terrace?"`);
    console.log(`      • "Who are the sponsors of this deal?"`);
    console.log(`      • "What are the key terms of the investment?"`);
    
  } catch (error: any) {
    console.error(`\n❌ Error indexing Deal ${INVESTMENT_ID}:`, error.message);
    process.exit(1);
  }
}

/**
 * Check if documents are already indexed
 */
function checkExistingIndex(): boolean {
  const db = getDb();
  
  try {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count 
      FROM indexed_documents 
      WHERE investment_id = ? AND status = 'indexed'
    `);
    
    const result = stmt.get(INVESTMENT_ID) as { count: number };
    return result.count > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('🏠 Holiday Terrace Deal 51 - Hybrid Indexing');
  console.log('===========================================');
  
  // Check if already indexed
  if (checkExistingIndex()) {
    console.log(`\n⚠️  Deal ${INVESTMENT_ID} documents are already indexed.`);
    console.log(`   To re-index, delete existing records first.`);
    
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise<string>((resolve) => {
      rl.question('Do you want to re-index anyway? (y/N): ', resolve);
    });
    
    rl.close();
    
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('Indexing cancelled.');
      return;
    }
  }
  
  // Run indexing
  await indexDeal51WithHybrid();
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}
