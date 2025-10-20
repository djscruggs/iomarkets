/**
 * Google Cloud Discovery Engine Service
 *
 * Handles Data Store creation and document indexing for RAG
 */

import { DocumentServiceClient, DataStoreServiceClient } from '@google-cloud/discoveryengine';
import { getGCPConfig, getDataStoreId } from './config.js';

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
 * Import documents into a Data Store
 * For PDF files, we need to use the document schema (not content schema)
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
