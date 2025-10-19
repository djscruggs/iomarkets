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

import { getInvestmentById, getAssetsForInvestment } from '../src/lib/queries.js';
import {
  upsertDataStore,
  trackDocumentIndexing,
  updateDocumentCount,
  getDataStoreInfo,
} from '../src/lib/queries-rag.js';
import { uploadFromUrl } from '../src/lib/gcp/storage.js';
import { createDataStore, importDocuments } from '../src/lib/gcp/discovery-engine.js';
import { getDataStoreId } from '../src/lib/gcp/config.js';

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

        const gcsUri = await uploadFromUrl(investmentId, asset.url, filename);

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

    // 5. Create Data Store
    console.log(`\n🗄️  Creating Data Store in Discovery Engine...`);
    upsertDataStore(investmentId, 'indexing');

    const dataStoreId = await createDataStore(investmentId);
    console.log(`✓ Data Store created: ${dataStoreId}`);

    // 6. Import documents into Data Store
    console.log(`\n📥 Importing documents into Data Store...`);
    console.log(`⏳ This may take several minutes...`);

    await importDocuments(investmentId, gcsUris);

    console.log(`✓ Documents successfully imported`);

    // 7. Update database with success status
    upsertDataStore(investmentId, 'ready');
    updateDocumentCount(investmentId, gcsUris.length);

    // Mark all documents as indexed
    for (const asset of pdfAssets) {
      trackDocumentIndexing(investmentId, asset.id, '', 'indexed');
    }

    console.log(`\n========================================`);
    console.log(`✅ SUCCESS!`);
    console.log(`========================================`);
    console.log(`Investment: ${investment.name}`);
    console.log(`Data Store ID: ${dataStoreId}`);
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
