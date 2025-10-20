/**
 * Test Discovery Engine search directly
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { SearchServiceClient } from '@google-cloud/discoveryengine';
import { getDataStoreId } from '../src/lib/gcp/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function testSearch() {
  try {
    const projectId = process.env.GCP_PROJECT_ID!;
    const dataStoreId = getDataStoreId('51');

    const searchClient = new SearchServiceClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    const servingConfig = `projects/${projectId}/locations/global/collections/default_collection/dataStores/${dataStoreId}/servingConfigs/default_config`;

    console.log('Serving Config:', servingConfig);
    console.log('\nTesting search for: "Holiday Terrace"\n');

    const [response] = await searchClient.search({
      servingConfig,
      query: 'Holiday Terrace',
      pageSize: 10,
      contentSearchSpec: {
        snippetSpec: {
          returnSnippet: true,
        },
      },
    });

    console.log('Results:', response.results?.length || 0);
    console.log('\nFull response:', JSON.stringify(response, null, 2));

    if (response.results && response.results.length > 0) {
      console.log('\n✅ Search is working!');
      response.results.forEach((result, i) => {
        console.log(`\nResult ${i + 1}:`, result);
      });
    } else {
      console.log('\n❌ No results found. Data Store might not be fully indexed yet.');
      console.log('Wait a few more minutes and try again.');
    }

  } catch (error: any) {
    console.error('❌ ERROR:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testSearch();
