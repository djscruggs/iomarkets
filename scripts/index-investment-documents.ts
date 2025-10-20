/**
 * Index Investment Documents Script
 *
 * Usage: tsx scripts/index-investment-documents.ts <investment-id>
 *
 * This script:
 * 1. Gets all due diligence assets (PDFs) for the investment
 * 2. Uploads them to Google Cloud Storage
 * 3. Creates a Data Store in Discovery Engine
 * 4. Imports documents into the Data Store
 * 5. Updates the database with indexing status
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import { getInvestmentById, getAssetsForInvestment } from '../src/lib/queries.js';
import {
  upsertDataStore,
  trackDocumentIndexing,
  updateDocumentCount,
  getDataStoreInfo,
} from '../src/lib/queries-rag.js';
import { uploadFromUrl, uploadDocument } from '../src/lib/gcp/storage.js';
import { createDataStore, importDocuments, importDocumentsWithContent, type DocumentWithContent } from '../src/lib/gcp/discovery-engine.js';
import { getDataStoreId } from '../src/lib/gcp/config.js';
import { extractTextFromLocalPDF, extractTextFromPDF } from '../src/lib/gcp/document-ai.js';
import fs from 'fs';

async function main() {
  const investmentId = process.argv[2];

  if (!investmentId) {
    console.error('Usage: tsx scripts/index-investment-documents.ts <investment-id>');
    process.exit(1);
  }

  console.log(`\n========================================`);
  console.log(`Indexing documents for investment: ${investmentId}`);
  console.log(`========================================\n`);

  // 1. Get investment and validate it exists
  const investment = getInvestmentById(investmentId);
  if (!investment) {
    console.error(`❌ Investment not found: ${investmentId}`);
    process.exit(1);
  }

  console.log(`✓ Found investment: ${investment.name}`);

  // 2. Get all PDF assets
  const allAssets = getAssetsForInvestment(investmentId);
  const pdfAssets = allAssets.filter(asset => asset.type === 'pdf');

  if (pdfAssets.length === 0) {
    console.error(`❌ No PDF documents found for investment ${investmentId}`);
    process.exit(1);
  }

  console.log(`✓ Found ${pdfAssets.length} PDF document(s) to index`);

  // 3. Create or update data store record
  console.log(`\n📊 Creating data store record...`);
  upsertDataStore(investmentId, 'pending');

  try {
    // 4. Upload documents to Google Cloud Storage
    console.log(`\n📤 Uploading documents to Cloud Storage...`);
    const gcsUris: string[] = [];

    for (const asset of pdfAssets) {
      try {
        console.log(`  Uploading: ${asset.name}...`);

        // Generate a clean filename
        const filename = `${asset.id}.pdf`;

        let gcsUri: string;

        // Check if URL is a local path (starts with /)
        if (asset.url.startsWith('/')) {
          // Try multiple possible locations for the file
          const possiblePaths = [
            path.join(__dirname, '..', 'public', asset.url),  // Development/local
            path.join(__dirname, '..', 'build', 'client', asset.url),  // Production build
          ];

          let localPath: string | null = null;
          for (const tryPath of possiblePaths) {
            if (fs.existsSync(tryPath)) {
              localPath = tryPath;
              break;
            }
          }

          if (!localPath) {
            throw new Error(`File not found in any location. Tried: ${possiblePaths.join(', ')}`);
          }

          gcsUri = await uploadDocument(investmentId, localPath, filename);
        } else {
          // Upload from URL
          gcsUri = await uploadFromUrl(investmentId, asset.url, filename);
        }

        gcsUris.push(gcsUri);
        trackDocumentIndexing(investmentId, asset.id, gcsUri, 'pending');

        console.log(`  ✓ Uploaded to ${gcsUri}`);
      } catch (error: any) {
        console.error(`  ❌ Failed to upload ${asset.name}: ${error.message}`);
        trackDocumentIndexing(investmentId, asset.id, '', 'failed', error.message);
      }
    }

    if (gcsUris.length === 0) {
      throw new Error('No documents were successfully uploaded');
    }

    console.log(`✓ Uploaded ${gcsUris.length} document(s) to Cloud Storage`);

    // NOTE: We're using database-based RAG, so we skip Discovery Engine creation
    // If you want to use Discovery Engine in the future, uncomment the lines below:
    //
    // console.log(`\n🗄️  Creating Data Store in Discovery Engine...`);
    // upsertDataStore(investmentId, 'indexing');
    // const dataStoreId = await createDataStore(investmentId);
    // console.log(`✓ Data Store created: ${dataStoreId}`);

    upsertDataStore(investmentId, 'indexing');

    // 5. Extract text from PDFs
    console.log(`\n📄 Extracting text from PDFs using Document AI...`);
    const documentsWithContent: DocumentWithContent[] = [];

    for (let i = 0; i < pdfAssets.length; i++) {
      const asset = pdfAssets[i];
      const gcsUri = gcsUris[i];

      try {
        console.log(`  [${i + 1}/${pdfAssets.length}] Extracting: ${asset.name}...`);

        // Check if file is local or remote
        let extractedText: string;
        if (asset.url.startsWith('/')) {
          // Try multiple possible locations for the file
          const possiblePaths = [
            path.join(__dirname, '..', 'public', asset.url),  // Development/local
            path.join(__dirname, '..', 'build', 'client', asset.url),  // Production build
          ];

          let localPath: string | null = null;
          for (const tryPath of possiblePaths) {
            if (fs.existsSync(tryPath)) {
              localPath = tryPath;
              break;
            }
          }

          if (!localPath) {
            throw new Error(`File not found in any location. Tried: ${possiblePaths.join(', ')}`);
          }

          extractedText = await extractTextFromLocalPDF(localPath);
        } else {
          // Extract from GCS
          extractedText = await extractTextFromPDF(gcsUri);
        }

        documentsWithContent.push({
          id: asset.id,
          title: asset.name,
          uri: gcsUri,
          content: extractedText,
        });

        console.log(`    ✓ Extracted ${extractedText.length} characters`);
      } catch (error: any) {
        console.error(`    ✗ Failed to extract text: ${error.message}`);
        trackDocumentIndexing(investmentId, asset.id, gcsUri, 'failed', error.message);
      }
    }

    if (documentsWithContent.length === 0) {
      throw new Error('No text could be extracted from any documents');
    }

    console.log(`✓ Extracted text from ${documentsWithContent.length} document(s)`);

    // NOTE: We're using database-based RAG, so we skip Discovery Engine import
    // If you want to use Discovery Engine in the future, uncomment the lines below:
    //
    // console.log(`\n📥 Importing documents with content into Data Store...`);
    // await importDocumentsWithContent(investmentId, documentsWithContent);
    // console.log(`✓ Documents successfully imported`);

    // 6. Update database with success status and store content
    upsertDataStore(investmentId, 'ready');
    updateDocumentCount(investmentId, gcsUris.length);

    // Mark all documents as indexed with their extracted content
    for (const doc of documentsWithContent) {
      // Find the matching asset and gcsUri
      const asset = pdfAssets.find(a => a.id === doc.id);
      const gcsUri = doc.uri;

      if (asset) {
        trackDocumentIndexing(investmentId, asset.id, gcsUri, 'indexed', null, doc.content);
      }
    }

    console.log(`\n========================================`);
    console.log(`✅ SUCCESS!`);
    console.log(`========================================`);
    console.log(`Investment: ${investment.name}`);
    console.log(`Documents indexed: ${gcsUris.length}`);
    console.log(`Status: ready`);
    console.log(`\nYou can now query this investment using the AI chat.`);
    console.log(`========================================\n`);

  } catch (error: any) {
    console.error(`\n❌ Error during indexing: ${error.message}`);
    console.error(error.stack);

    // Update status to error
    upsertDataStore(investmentId, 'error', error.message);

    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
