/**
 * Check Indexing Status Script
 *
 * Usage: tsx scripts/check-indexing-status.ts [investment-id]
 *
 * Shows the indexing status for one or all investments
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import { getInvestmentById } from '../src/lib/queries.js';
import { getDataStoreInfo, getAllDataStores, getIndexingStatus } from '../src/lib/queries-rag.js';

function displayStatus(investmentId: string) {
  const investment = getInvestmentById(investmentId);
  const dataStore = getDataStoreInfo(investmentId);
  const status = getIndexingStatus(investmentId);

  console.log(`\n📊 Investment: ${investment?.name || investmentId}`);
  console.log(`   ID: ${investmentId}`);

  if (!dataStore) {
    console.log(`   Status: ❌ Not indexed`);
    return;
  }

  const statusIcon = {
    pending: '⏳',
    indexing: '⚙️',
    ready: '✅',
    error: '❌',
  }[dataStore.status] || '❓';

  console.log(`   Status: ${statusIcon} ${dataStore.status.toUpperCase()}`);
  console.log(`   Data Store ID: ${dataStore.dataStoreId}`);
  console.log(`   Documents: ${dataStore.documentCount}`);

  if (dataStore.indexedAt) {
    console.log(`   Indexed at: ${new Date(dataStore.indexedAt).toLocaleString()}`);
  }

  if (dataStore.errorMessage) {
    console.log(`   Error: ${dataStore.errorMessage}`);
  }

  if (status.total > 0) {
    console.log(`   Document Details:`);
    console.log(`     - Total: ${status.total}`);
    console.log(`     - Indexed: ${status.indexed}`);
    console.log(`     - Pending: ${status.pending}`);
    console.log(`     - Failed: ${status.failed}`);
  }
}

function main() {
  const investmentId = process.argv[2];

  console.log(`\n========================================`);
  console.log(`RAG Indexing Status`);
  console.log(`========================================`);

  if (investmentId) {
    // Show status for specific investment
    const investment = getInvestmentById(investmentId);
    if (!investment) {
      console.error(`\n❌ Investment not found: ${investmentId}`);
      process.exit(1);
    }

    displayStatus(investmentId);
  } else {
    // Show status for all investments with data stores
    const dataStores = getAllDataStores();

    if (dataStores.length === 0) {
      console.log(`\nNo investments have been indexed yet.`);
      console.log(`\nTo index an investment, run:`);
      console.log(`  tsx scripts/index-investment-documents.ts <investment-id>`);
    } else {
      for (const ds of dataStores) {
        displayStatus(ds.investmentId);
      }

      console.log(`\n📈 Summary:`);
      console.log(`   Total indexed investments: ${dataStores.length}`);
      console.log(`   Ready: ${dataStores.filter(ds => ds.status === 'ready').length}`);
      console.log(`   Indexing: ${dataStores.filter(ds => ds.status === 'indexing').length}`);
      console.log(`   Pending: ${dataStores.filter(ds => ds.status === 'pending').length}`);
      console.log(`   Errors: ${dataStores.filter(ds => ds.status === 'error').length}`);
    }
  }

  console.log(`\n========================================\n`);
}

main();
