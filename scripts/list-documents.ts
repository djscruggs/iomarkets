/**
 * List all documents in a Data Store
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import { listDataStoreDocuments } from '../src/lib/gcp/discovery-engine.js';

async function listDocs() {
  try {
    console.log('Listing documents in Data Store for investment 51...\n');

    const documents = await listDataStoreDocuments('51');

    console.log(`Found ${documents.length} documents:\n`);

    documents.forEach((doc, i) => {
      console.log(`${i + 1}. ${doc.name}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   structData:`, doc.structData);
      console.log(`   content:`, doc.content ? 'present' : 'missing');
      console.log();
    });

  } catch (error: any) {
    console.error('❌ ERROR:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

listDocs();
