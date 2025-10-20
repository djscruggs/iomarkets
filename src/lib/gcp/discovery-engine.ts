/**
 * Google Cloud Discovery Engine Service
 *
 * Handles Data Store creation and document indexing for RAG
 */

import { DocumentServiceClient, DataStoreServiceClient, EngineServiceClient, SearchServiceClient } from '@google-cloud/discoveryengine';
import { getGCPConfig, getDataStoreId, getEngineId } from './config.js';

let documentClient: DocumentServiceClient | null = null;
let dataStoreClient: DataStoreServiceClient | null = null;

/**
 * Get or create Document Service client
 */
function getDocumentClient(): DocumentServiceClient {
  if (!documentClient) {
    const config = getGCPConfig();
    documentClient = new DocumentServiceClient({
      projectId: config.projectId,
      keyFilename: config.credentials,
    });
  }
  return documentClient;
}

/**
 * Get or create Data Store Service client
 */
function getDataStoreClient(): DataStoreServiceClient {
  if (!dataStoreClient) {
    const config = getGCPConfig();
    dataStoreClient = new DataStoreServiceClient({
      projectId: config.projectId,
      keyFilename: config.credentials,
    });
  }
  return dataStoreClient;
}

/**
 * Create a Data Store for an investment
 */
export async function createDataStore(investmentId: string): Promise<string> {
  const client = getDataStoreClient();
  const config = getGCPConfig();
  const dataStoreId = getDataStoreId(investmentId);

  const parent = `projects/${config.projectId}/locations/global/collections/default_collection`;

  console.log(`Creating Data Store: ${dataStoreId}`);

  try {
    const [operation] = await client.createDataStore({
      parent,
      dataStoreId,
      dataStore: {
        displayName: `Investment ${investmentId} Due Diligence`,
        industryVertical: 'GENERIC',
        solutionTypes: ['SOLUTION_TYPE_CHAT'],
        contentConfig: 'CONTENT_REQUIRED',
      },
    });

    // Wait for the operation to complete
    const [dataStore] = await operation.promise();
    console.log(`Data Store created: ${dataStore.name}`);

    return dataStoreId;
  } catch (error: any) {
    // If data store already exists, return the ID
    if (error.code === 6) { // ALREADY_EXISTS
      console.log(`Data Store ${dataStoreId} already exists`);
      return dataStoreId;
    }
    throw error;
  }
}

/**
 * Document structure for Discovery Engine with extracted text
 */
export interface DocumentWithContent {
  id: string;
  title: string;
  uri: string;
  content: string; // Extracted text from PDF
}

/**
 * Import documents with pre-extracted text content into Discovery Engine
 * This approach works by creating inline documents rather than importing from GCS
 */
export async function importDocumentsWithContent(
  investmentId: string,
  documents: DocumentWithContent[]
): Promise<void> {
  const client = getDocumentClient();
  const config = getGCPConfig();
  const dataStoreId = getDataStoreId(investmentId);

  const parent = `projects/${config.projectId}/locations/global/collections/default_collection/dataStores/${dataStoreId}/branches/default_branch`;

  console.log(`Importing ${documents.length} documents with extracted content into ${dataStoreId}`);

  // Import documents one by one using inline documents
  // Discovery Engine's inlineSource only supports inline documents in the request
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    console.log(`  [${i + 1}/${documents.length}] Importing: ${doc.title}...`);

    try {
      await client.importDocuments({
        parent,
        inlineSource: {
          documents: [
            {
              id: doc.id,
              structData: {
                fields: {
                  id: { stringValue: doc.id },
                  title: { stringValue: doc.title },
                  uri: { stringValue: doc.uri },
                  content: { stringValue: doc.content },
                },
              },
            },
          ],
        },
        reconciliationMode: 'INCREMENTAL',
      });

      console.log(`    ✓ Imported: ${doc.title}`);
    } catch (error: any) {
      console.error(`    ✗ Failed to import ${doc.title}:`, error.message);
      throw error;
    }
  }

  console.log(`Successfully imported ${documents.length} documents with content`);
}

/**
 * Import documents into a Data Store (legacy method - doesn't extract PDF content)
 * For PDF files, we need to use the document schema (not content schema)
 * Note: This doesn't work for PDFs - use importDocumentsWithContent instead
 */
export async function importDocuments(
  investmentId: string,
  gcsUris: string[]
): Promise<void> {
  const client = getDocumentClient();
  const config = getGCPConfig();
  const dataStoreId = getDataStoreId(investmentId);

  const parent = `projects/${config.projectId}/locations/global/collections/default_collection/dataStores/${dataStoreId}/branches/default_branch`;

  console.log(`Importing ${gcsUris.length} documents into ${dataStoreId}`);

  const [operation] = await client.importDocuments({
    parent,
    gcsSource: {
      inputUris: gcsUris,
      // Use 'document' schema for unstructured files like PDFs
      // This tells Discovery Engine to parse the PDF content
      dataSchema: 'document',
    },
    reconciliationMode: 'INCREMENTAL',
  });

  console.log('Import operation started, waiting for completion...');

  // Wait for the operation to complete (this can take several minutes)
  await operation.promise();

  console.log(`Successfully imported ${gcsUris.length} documents`);
}

/**
 * Delete a Data Store
 */
export async function deleteDataStore(investmentId: string): Promise<void> {
  const client = getDataStoreClient();
  const config = getGCPConfig();
  const dataStoreId = getDataStoreId(investmentId);

  const name = `projects/${config.projectId}/locations/global/collections/default_collection/dataStores/${dataStoreId}`;

  console.log(`Deleting Data Store: ${dataStoreId}`);

  try {
    const [operation] = await client.deleteDataStore({ name });
    await operation.promise();
    console.log(`Data Store ${dataStoreId} deleted`);
  } catch (error: any) {
    if (error.code === 5) { // NOT_FOUND
      console.log(`Data Store ${dataStoreId} does not exist`);
      return;
    }
    throw error;
  }
}

/**
 * Check if a Data Store exists
 */
export async function dataStoreExists(investmentId: string): Promise<boolean> {
  const client = getDataStoreClient();
  const config = getGCPConfig();
  const dataStoreId = getDataStoreId(investmentId);

  const name = `projects/${config.projectId}/locations/global/collections/default_collection/dataStores/${dataStoreId}`;

  try {
    await client.getDataStore({ name });
    return true;
  } catch (error: any) {
    if (error.code === 5) { // NOT_FOUND
      return false;
    }
    throw error;
  }
}

/**
 * List all documents in a Data Store
 */
export async function listDataStoreDocuments(investmentId: string): Promise<any[]> {
  const client = getDocumentClient();
  const config = getGCPConfig();
  const dataStoreId = getDataStoreId(investmentId);

  const parent = `projects/${config.projectId}/locations/global/collections/default_collection/dataStores/${dataStoreId}/branches/default_branch`;

  const [documents] = await client.listDocuments({ parent });

  return documents;
}

/**
 * Create a Search Engine/App on top of a Data Store
 * This is required for chat-enabled search with unstructured content
 */
export async function createSearchEngine(investmentId: string): Promise<string> {
  const client = new EngineServiceClient({
    keyFilename: getGCPConfig().credentials,
  });
  const config = getGCPConfig();
  const dataStoreId = getDataStoreId(investmentId);
  const engineId = getEngineId(investmentId);

  const parent = `projects/${config.projectId}/locations/global/collections/default_collection`;

  console.log(`Creating Search Engine: ${engineId}`);

  try {
    const [operation] = await client.createEngine({
      parent,
      engineId,
      engine: {
        displayName: `Investment ${investmentId} Search`,
        solutionType: 'SOLUTION_TYPE_CHAT',
        searchEngineConfig: {
          searchTier: 'SEARCH_TIER_STANDARD',
          searchAddOns: ['SEARCH_ADD_ON_LLM'],
        },
        dataStoreIds: [dataStoreId],
      },
    });

    const [engine] = await operation.promise();
    console.log(`Search Engine created: ${engine.name}`);

    return engineId;
  } catch (error: any) {
    if (error.code === 6) { // ALREADY_EXISTS
      console.log(`Search Engine ${engineId} already exists`);
      return engineId;
    }
    throw error;
  }
}
