/**
 * Test the chat function to diagnose issues
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import { chat } from '../src/lib/gcp/vertex-ai.js';

async function testChat() {
  try {
    console.log('Testing chat with investment 51...\n');

    const response = await chat('51', 'What is the name of this investment?');

    console.log('✅ SUCCESS!');
    console.log('\nResponse:', response.content);
    console.log('\nCitations:', response.citations);
    console.log('\nGrounding Metadata:', JSON.stringify(response.groundingMetadata, null, 2));

  } catch (error: any) {
    console.error('❌ ERROR:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testChat();
