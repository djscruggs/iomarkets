/**
 * PDF Text Extraction Service
 *
 * Extracts text content from PDF documents using pdf-parse
 * Can be upgraded to use Google Cloud Document AI for better OCR
 */

import { getGCPConfig } from './config.js';
import { Storage } from '@google-cloud/storage';
import * as fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Extract text from a PDF file using Document AI
 *
 * @param gcsUri - GCS URI of the PDF file (gs://bucket/path/file.pdf)
 * @returns Extracted text content
 */
export async function extractTextFromPDF(gcsUri: string): Promise<string> {
  // For now, download from GCS and use the local method
  // This is simpler than setting up GCS input for Document AI
  const config = getGCPConfig();

  // Read credentials file and parse as JSON
  const credentialsContent = fs.readFileSync(config.credentials, 'utf8');
  const credentials = JSON.parse(credentialsContent);

  const storage = new Storage({
    projectId: config.projectId,
    credentials,
  });

  console.log(`Extracting text from ${gcsUri}...`);

  try {
    // Parse GCS URI to get bucket and file path
    const match = gcsUri.match(/^gs:\/\/([^\/]+)\/(.+)$/);
    if (!match) {
      throw new Error(`Invalid GCS URI: ${gcsUri}`);
    }

    const [, bucketName, filePath] = match;
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);

    // Download file content to temp file
    const tempFilePath = `/tmp/${Date.now()}.pdf`;
    await file.download({ destination: tempFilePath });

    // Extract text from the temp file
    const text = await extractTextFromLocalPDF(tempFilePath);

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    return text;
  } catch (error: any) {
    console.error(`Error extracting text from ${gcsUri}:`, error.message);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Extract text from a local PDF file using pdf-parse
 *
 * @param localFilePath - Path to local PDF file
 * @returns Extracted text content
 */
export async function extractTextFromLocalPDF(localFilePath: string): Promise<string> {
  console.log(`Extracting text from ${localFilePath}...`);

  try {
    // Read the PDF file
    const dataBuffer = fs.readFileSync(localFilePath);

    // Parse PDF with pdf-parse
    // When using require(), the function is directly available
    const data = await pdfParse(dataBuffer);

    // Extract text
    const text = data.text;

    console.log(`✓ Extracted ${text.length} characters from ${localFilePath}`);

    return text;
  } catch (error: any) {
    console.error(`Error extracting text from ${localFilePath}:`, error.message);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}
