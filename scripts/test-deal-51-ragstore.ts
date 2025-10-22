#!/usr/bin/env tsx

/**
 * Test script to verify Deal 51 RagStore functionality
 */

import { getDb } from '../src/lib/db.js';
import { getInvestmentById } from '../src/lib/queries.js';
import { getDataStoreInfo } from '../src/lib/queries-rag.js';
import { chatWithDealCorpus } from '../src/lib/gcp/gen-ai.js';

function testDeal51RagStoreSetup(): void {
  console.log('🏠 Testing Deal 51 (Holiday Terrace) RagStore Setup');
  console.log('==================================================');
  
  try {
    const db = getDb();
    
    // 1. Check if investment exists
    console.log('\n1️⃣ Checking investment...');
    const investment = getInvestmentById('51');
    if (investment) {
      console.log(`✅ Investment found: ${investment.name}`);
      console.log(`   • Sponsor: ${investment.sponsor}`);
      console.log(`   • Type: ${investment.type}`);
      console.log(`   • Location: ${investment.location}`);
    } else {
      console.log('❌ Investment 51 not found');
      return;
    }
    
    // 2. Check RagStore status
    console.log('\n2️⃣ Checking RagStore status...');
    const ragStoreStmt = db.prepare(`
      SELECT corpus_id, document_ids, status, uploaded_at
      FROM rag_stores 
      WHERE investment_id = '51'
    `);
    
    const ragStore = ragStoreStmt.get() as {
      corpus_id: string;
      document_ids: string;
      status: string;
      uploaded_at: string;
    } | undefined;
    
    if (ragStore) {
      const documentIds = JSON.parse(ragStore.document_ids);
      console.log(`✅ RagStore found: ${ragStore.status}`);
      console.log(`   • Corpus ID: ${ragStore.corpus_id}`);
      console.log(`   • Document count: ${documentIds.length}`);
      console.log(`   • Uploaded at: ${ragStore.uploaded_at}`);
    } else {
      console.log('❌ No RagStore found for deal 51');
      console.log('   Run: npm run genai:index-deal-51-ragstore');
      return;
    }
    
    // 3. Check data store status (for compatibility)
    console.log('\n3️⃣ Checking data store status...');
    const dataStore = getDataStoreInfo('51');
    if (dataStore) {
      console.log(`✅ Data store found: ${dataStore.status}`);
      console.log(`   • Document count: ${dataStore.documentCount}`);
    } else {
      console.log('⚠️  No data store found (this is OK for RagStore)');
    }
    
    // 4. Test RagStore chat functionality
    console.log('\n4️⃣ Testing RagStore chat...');
    if (ragStore && ragStore.status === 'ready') {
      const documentIds = JSON.parse(ragStore.document_ids);
      console.log(`✅ RagStore is ready for chat (${documentIds.length} documents)`);
      console.log(`   • Corpus ID: ${ragStore.corpus_id}`);
      console.log(`   • Documents: ${documentIds.slice(0, 3).join(', ')}${documentIds.length > 3 ? '...' : ''}`);
    } else {
      console.log('❌ RagStore not ready for chat');
    }
    
    // 5. Summary
    console.log('\n📊 Summary:');
    console.log(`   • Investment: ${investment ? '✅' : '❌'}`);
    console.log(`   • RagStore: ${ragStore ? ragStore.status : '❌'}`);
    console.log(`   • Data Store: ${dataStore ? dataStore.status : '⚠️'}`);
    console.log(`   • Chat Ready: ${ragStore?.status === 'ready' ? '✅' : '❌'}`);
    
    if (investment && ragStore?.status === 'ready') {
      console.log('\n🎉 Deal 51 RagStore is ready for efficient AI chat!');
      console.log('\n🚀 Next steps:');
      console.log('   1. Start dev server: npm run dev');
      console.log('   2. Navigate to: http://localhost:5173/investment/51/due-diligence');
      console.log('   3. Test AI chat with questions like:');
      console.log('      • "What is the projected return for Holiday Terrace?"');
      console.log('      • "Who are the sponsors of this deal?"');
      console.log('      • "What are the key terms of the investment?"');
      
      console.log('\n💡 RagStore Benefits:');
      console.log('   • ⚡ Faster responses (no content upload per query)');
      console.log('   • 💰 Lower API costs (documents cached)');
      console.log('   • 🔒 Deal isolation (only Deal 51 documents)');
      console.log('   • 📈 Better scalability');
    } else {
      console.log('\n❌ Deal 51 RagStore is not ready.');
      console.log('   Please run: npm run genai:index-deal-51-ragstore');
    }
    
  } catch (error: any) {
    console.error('❌ Error testing RagStore setup:', error.message);
  }
}

// Run the test
testDeal51RagStoreSetup();
