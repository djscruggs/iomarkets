#!/usr/bin/env tsx

/**
 * Test script to verify Deal 51 chat functionality
 */

import { getDb } from '../src/lib/db.js';
import { getInvestmentById } from '../src/lib/queries.js';
import { getDataStoreInfo } from '../src/lib/queries-rag.js';

function testDeal51Setup(): void {
  console.log('🏠 Testing Deal 51 (Holiday Terrace) Setup');
  console.log('==========================================');
  
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
    
    // 2. Check data store status
    console.log('\n2️⃣ Checking data store status...');
    const dataStore = getDataStoreInfo('51');
    if (dataStore) {
      console.log(`✅ Data store found: ${dataStore.status}`);
      console.log(`   • Document count: ${dataStore.documentCount}`);
      console.log(`   • Indexed at: ${dataStore.indexedAt}`);
    } else {
      console.log('❌ No data store found for deal 51');
    }
    
    // 3. Check indexed documents
    console.log('\n3️⃣ Checking indexed documents...');
    const stmt = db.prepare(`
      SELECT id, asset_id, content_length, status, indexed_at
      FROM indexed_documents 
      WHERE investment_id = '51'
      ORDER BY content_length DESC
    `);
    
    const documents = stmt.all() as Array<{
      id: string;
      asset_id: string;
      content_length: number;
      status: string;
      indexed_at: string;
    }>;
    
    if (documents.length > 0) {
      console.log(`✅ Found ${documents.length} indexed documents:`);
      documents.forEach((doc, index) => {
        console.log(`   ${index + 1}. ${doc.asset_id} (${doc.content_length} chars) - ${doc.status}`);
      });
      
      const totalContent = documents.reduce((sum, doc) => sum + doc.content_length, 0);
      console.log(`   📊 Total content: ${totalContent.toLocaleString()} characters`);
    } else {
      console.log('❌ No indexed documents found');
    }
    
    // 4. Test search functionality
    console.log('\n4️⃣ Testing document search...');
    const searchStmt = db.prepare(`
      SELECT asset_id, content_length, 
             substr(content, 1, 100) as content_preview
      FROM indexed_documents 
      WHERE investment_id = '51' 
        AND status = 'indexed'
        AND content LIKE '%Holiday%'
      LIMIT 3
    `);
    
    const searchResults = searchStmt.all() as Array<{
      asset_id: string;
      content_length: number;
      content_preview: string;
    }>;
    
    if (searchResults.length > 0) {
      console.log(`✅ Search test successful - found ${searchResults.length} documents with "Holiday":`);
      searchResults.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.asset_id}: "${result.content_preview}..."`);
      });
    } else {
      console.log('⚠️  No documents found with "Holiday" search term');
    }
    
    // 5. Summary
    console.log('\n📊 Summary:');
    console.log(`   • Investment: ${investment ? '✅' : '❌'}`);
    console.log(`   • Data Store: ${dataStore ? dataStore.status : '❌'}`);
    console.log(`   • Documents: ${documents.length} indexed`);
    console.log(`   • Search: ${searchResults.length > 0 ? '✅' : '⚠️'}`);
    
    if (investment && dataStore && documents.length > 0) {
      console.log('\n🎉 Deal 51 is ready for AI chat!');
      console.log('\n🚀 Next steps:');
      console.log('   1. Start dev server: npm run dev');
      console.log('   2. Navigate to: http://localhost:5173/investment/51/due-diligence');
      console.log('   3. Test AI chat with questions like:');
      console.log('      • "What is the projected return for Holiday Terrace?"');
      console.log('      • "Who are the sponsors of this deal?"');
      console.log('      • "What are the key terms of the investment?"');
    } else {
      console.log('\n❌ Deal 51 is not ready. Please run: npm run genai:index-deal-51');
    }
    
  } catch (error: any) {
    console.error('❌ Error testing setup:', error.message);
  }
}

// Run the test
testDeal51Setup();
