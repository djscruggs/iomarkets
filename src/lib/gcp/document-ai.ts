/**
 * PDF Text Extraction Service
 *
 * Extracts text content from PDF documents using Google Cloud Document AI with pdf-parse fallback
 */

import { getGCPConfig } from './config.js';
import { Storage } from '@google-cloud/storage';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
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
 * Extract text from a local PDF file using Document AI with pdf-parse fallback
 *
 * @param localFilePath - Path to local PDF file
 * @returns Extracted text content
 */
export async function extractTextFromLocalPDF(localFilePath: string): Promise<string> {
  console.log(`Extracting text from ${localFilePath}...`);

  try {
    // Try pdf-parse first (it's free and fast)
    const dataBuffer = fs.readFileSync(localFilePath);
    const data = await pdfParse(dataBuffer);
    const pdfParseText = data.text;

    // If pdf-parse extracted meaningful content (>100 chars), use it
    if (pdfParseText.length > 100) {
      console.log(`✓ Extracted ${pdfParseText.length} characters using pdf-parse`);
      return pdfParseText;
    }

    // Otherwise, fall back to Document AI for better extraction
    console.log(`⚠️  pdf-parse only extracted ${pdfParseText.length} characters, trying Document AI...`);
    const documentAIText = await extractWithDocumentAI(dataBuffer);
    console.log(`✓ Extracted ${documentAIText.length} characters using Document AI`);
    return documentAIText;

  } catch (error: any) {
    console.error(`Error extracting text from ${localFilePath}:`, error.message);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Extract text using Google Cloud Document AI OCR
 *
 * @param pdfBuffer - PDF file buffer
 * @returns Extracted text content
 */
async function extractWithDocumentAI(pdfBuffer: Buffer): Promise<string> {
  const config = getGCPConfig();

  // Read credentials
  const credentialsContent = fs.readFileSync(config.credentials, 'utf8');
  const credentials = JSON.parse(credentialsContent);

  // Create Document AI client
  const client = new DocumentProcessorServiceClient({ credentials });

  // You need to create a processor in GCP Console first
  // For now, we'll use the OCR processor type
  // The processor name format is: projects/{project}/locations/{location}/processors/{processor}
  const processorName = process.env.DOCUMENT_AI_PROCESSOR_NAME ||
    `projects/${config.projectId}/locations/us/processors/YOUR_PROCESSOR_ID`;

  if (processorName.includes('YOUR_PROCESSOR_ID')) {
    throw new Error(
      'Document AI processor not configured. Please set DOCUMENT_AI_PROCESSOR_NAME environment variable. ' +
      'Create a processor at: https://console.cloud.google.com/ai/document-ai/processors'
    );
  }

  // Process the document
  const [result] = await client.processDocument({
    name: processorName,
    rawDocument: {
      content: pdfBuffer.toString('base64'),
      mimeType: 'application/pdf',
    },
  });

  // Extract text from all pages
  const text = result.document?.text || '';
  return text;
}
