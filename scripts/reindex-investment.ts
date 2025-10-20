/**
 * Delete and re-index investment documents with correct configuration
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import { deleteDataStore } from '../src/lib/gcp/discovery-engine.js';
import { deleteDataStoreRecord } from '../src/lib/queries-rag.js';

const investmentId = process.argv[2];

if (!investmentId) {
  console.error('Usage: npm run rag:reindex <investment_id>');
  process.exit(1);
}

async function reindex() {
  try {
    console.log(`========================================`);
    console.log(`Re-indexing investment: ${investmentId}`);
    console.log(`========================================\n`);

    // Delete from Discovery Engine
    console.log('🗑️  Deleting Data Store from Discovery Engine...');
    await deleteDataStore(investmentId);

    // Delete from database
    console.log('🗑️  Deleting database records...');
    deleteDataStoreRecord(investmentId);

    console.log('\n✅ Cleanup complete!');
    console.log('\nNow run the indexing script:');
    console.log(`  npm run rag:index ${investmentId}`);

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

reindex();
