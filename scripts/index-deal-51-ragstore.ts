#!/usr/bin/env tsx

/**
 * Index Deal 51 (Holiday Terrace) Documents for Google Gen AI RagStore
 * 
 * This script:
 * 1. Reads PDF documents from /public/duediligence/holidayterrace
 * 2. Extracts text content using Document AI + pdf-parse
 * 3. Creates a RagCorpus for Deal 51
 * 4. Uploads documents to RagStore (upload once, reference many)
 * 5. Stores RagStore info in database for efficient chat
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { extractTextFromLocalPDF } from '../src/lib/gcp/document-ai.js';
import { getDb } from '../src/lib/db.js';
import { 
  createDealRagCorpus, 
  uploadDocumentsToDealCorpus 
} from '../src/lib/gcp/gen-ai.js';

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
 * Store RagStore info in database
 */
function storeRagStoreInfo(
  investmentId: string,
  corpusId: string,
  documentIds: string[]
): void {
  const db = getDb();
  
  try {
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO rag_stores 
      (investment_id, corpus_id, document_ids, status, uploaded_at)
      VALUES (?, ?, ?, 'ready', datetime('now'))
    `);
    
    insertStmt.run(
      investmentId,
      corpusId,
      JSON.stringify(documentIds)
    );
    
    console.log(`✓ Stored RagStore info for deal ${investmentId}`);
  } catch (error: any) {
    console.error('Error storing RagStore info:', error);
    throw error;
  }
}

/**
 * Update investment data store status (for compatibility)
 */
function updateDataStoreStatus(investmentId: string, documentCount: number): void {
  const db = getDb();
  
  try {
    const upsertStmt = db.prepare(`
      INSERT OR REPLACE INTO investment_data_stores 
      (investment_id, data_store_id, gcs_folder_path, status, document_count, indexed_at)
      VALUES (?, ?, ?, 'ready', ?, datetime('now'))
    `);
    
    upsertStmt.run(
      investmentId,
      `ragstore-deal-${investmentId}`,
      `/duediligence/holidayterrace/`,
      documentCount
    );
    
    console.log(`✓ Updated data store status for deal ${investmentId}`);
  } catch (error: any) {
    console.error('Error updating data store status:', error);
    throw error;
  }
}

/**
 * Main indexing function
 */
async function indexDeal51WithRagStore(): Promise<void> {
  console.log(`\n🏠 Indexing Deal ${INVESTMENT_ID}: ${DEAL_NAME} with RagStore`);
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
    
    // 3. Create RagCorpus for Deal 51
    console.log(`\n🏗️  Creating RagCorpus for Deal ${INVESTMENT_ID}...`);
    const corpusInfo = await createDealRagCorpus(INVESTMENT_ID, DEAL_NAME);
    console.log(`✓ Created RagCorpus: ${corpusInfo.corpusId}`);
    
    // 4. Upload documents to RagStore
    console.log(`\n☁️  Uploading documents to RagStore...`);
    const uploadResult = await uploadDocumentsToDealCorpus(
      INVESTMENT_ID,
      corpusInfo.corpusId,
      documentsWithContent.map(doc => ({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        mimeType: 'text/plain'
      }))
    );
    
    console.log(`✓ Uploaded ${uploadResult.documentIds.length} documents to RagStore`);
    
    // 5. Store RagStore info in database
    console.log(`\n💾 Storing RagStore info in database...`);
    storeRagStoreInfo(INVESTMENT_ID, corpusInfo.corpusId, uploadResult.documentIds);
    
    // 6. Update data store status (for compatibility)
    console.log(`\n✅ Updating data store status...`);
    updateDataStoreStatus(INVESTMENT_ID, documentsWithContent.length);
    
    // 7. Summary
    const totalContentLength = documentsWithContent.reduce((sum, doc) => sum + doc.contentLength, 0);
    
    console.log(`\n🎉 Deal ${INVESTMENT_ID} RagStore indexing complete!`);
    console.log(`📈 Summary:`);
    console.log(`   • Documents processed: ${documentsWithContent.length}`);
    console.log(`   • Total content: ${totalContentLength.toLocaleString()} characters`);
    console.log(`   • RagCorpus ID: ${corpusInfo.corpusId}`);
    console.log(`   • Document IDs: ${uploadResult.documentIds.length}`);
    console.log(`   • Status: Ready for efficient AI chat`);
    
    console.log(`\n🚀 Next steps:`);
    console.log(`   1. Start the dev server: npm run dev`);
    console.log(`   2. Navigate to: http://localhost:5173/investment/51/due-diligence`);
    console.log(`   3. Test AI chat with questions like:`);
    console.log(`      • "What is the projected return for Holiday Terrace?"`);
    console.log(`      • "Who are the sponsors of this deal?"`);
    console.log(`      • "What are the key terms of the investment?"`);
    
    console.log(`\n💡 Benefits of RagStore:`);
    console.log(`   • ⚡ Faster responses (no content upload with each query)`);
    console.log(`   • 💰 Lower costs (documents cached in Google's system)`);
    console.log(`   • 🔒 Deal isolation (documents only accessible to Deal 51)`);
    console.log(`   • 📈 Better scalability (supports unlimited deals)`);
    
  } catch (error: any) {
    console.error(`\n❌ Error indexing Deal ${INVESTMENT_ID}:`, error.message);
    process.exit(1);
  }
}

/**
 * Check if RagStore is already set up
 */
function checkExistingRagStore(): boolean {
  const db = getDb();
  
  try {
    const stmt = db.prepare(`
      SELECT corpus_id, document_ids, status
      FROM rag_stores 
      WHERE investment_id = ? AND status = 'ready'
    `);
    
    const result = stmt.get(INVESTMENT_ID) as {
      corpus_id: string;
      document_ids: string;
      status: string;
    } | undefined;
    
    return !!result;
  } catch (error) {
    return false;
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('🏠 Holiday Terrace Deal 51 - RagStore Indexing');
  console.log('===============================================');
  
  // Check if already indexed
  if (checkExistingRagStore()) {
    console.log(`\n⚠️  Deal ${INVESTMENT_ID} RagStore is already set up.`);
    console.log(`   To re-index, delete existing RagStore records first.`);
    
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
  await indexDeal51WithRagStore();
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}
