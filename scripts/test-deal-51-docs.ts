#!/usr/bin/env tsx

/**
 * Test script to verify Deal 51 documents are accessible
 */

import * as fs from 'fs';
import * as path from 'path';

const DOCUMENTS_PATH = path.join(__dirname, '..', 'public', 'duediligence', 'holidayterrace');

function testDeal51Documents(): void {
  console.log('🏠 Testing Deal 51 (Holiday Terrace) Documents');
  console.log('============================================');
  console.log(`📁 Documents path: ${DOCUMENTS_PATH}`);
  
  try {
    // Check if directory exists
    if (!fs.existsSync(DOCUMENTS_PATH)) {
      console.error(`❌ Directory not found: ${DOCUMENTS_PATH}`);
      return;
    }
    
    console.log('✅ Directory exists');
    
    // List all files
    const files = fs.readdirSync(DOCUMENTS_PATH);
    console.log(`\n📄 Found ${files.length} files:`);
    
    const pdfs: string[] = [];
    const images: string[] = [];
    const others: string[] = [];
    
    for (const file of files) {
      const filepath = path.join(DOCUMENTS_PATH, file);
      const stats = fs.statSync(filepath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      if (file.toLowerCase().endsWith('.pdf')) {
        pdfs.push(file);
        console.log(`  📄 PDF: ${file} (${sizeInMB} MB)`);
      } else if (file.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
        images.push(file);
        console.log(`  🖼️  Image: ${file} (${sizeInMB} MB)`);
      } else {
        others.push(file);
        console.log(`  📁 Other: ${file} (${sizeInMB} MB)`);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   • PDF documents: ${pdfs.length}`);
    console.log(`   • Images: ${images.length}`);
    console.log(`   • Other files: ${others.length}`);
    console.log(`   • Total files: ${files.length}`);
    
    if (pdfs.length > 0) {
      console.log(`\n✅ Ready for indexing! Found ${pdfs.length} PDF documents.`);
      console.log(`\n🚀 Run: npm run genai:index-deal-51`);
    } else {
      console.log(`\n❌ No PDF documents found. Cannot proceed with indexing.`);
    }
    
  } catch (error: any) {
    console.error(`❌ Error testing documents:`, error.message);
  }
}

// Run the test
testDeal51Documents();
