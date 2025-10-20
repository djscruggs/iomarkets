/**
 * Google Cloud Storage Service
 *
 * Handles document upload and management in Cloud Storage
 */

import { Storage } from '@google-cloud/storage';
import { getGCPConfig, getGCSFolderPath } from './config.js';
import fs from 'fs';
import path from 'path';

let storageClient: Storage | null = null;

/**
 * Get or create Storage client
 */
export function getStorageClient(): Storage {
  if (!storageClient) {
    const config = getGCPConfig();

    // Read credentials file and parse as JSON for more reliable authentication
    let credentials;
    try {
      const credentialsContent = fs.readFileSync(config.credentials, 'utf8');
      credentials = JSON.parse(credentialsContent);
    } catch (error: any) {
      throw new Error(`Failed to read credentials file: ${error.message}`);
    }

    storageClient = new Storage({
      projectId: config.projectId,
      credentials,
    });
  }
  return storageClient;
}

/**
 * Upload a file to Cloud Storage
 */
export async function uploadDocument(
  investmentId: string,
  localFilePath: string,
  destinationFileName?: string
): Promise<string> {
  const client = getStorageClient();
  const config = getGCPConfig();
  const bucket = client.bucket(config.storageBucket);

  const fileName = destinationFileName || path.basename(localFilePath);
  const destination = `${getGCSFolderPath(investmentId)}${fileName}`;

  console.log(`Uploading ${localFilePath} to gs://${config.storageBucket}/${destination}`);

  await bucket.upload(localFilePath, {
    destination,
    metadata: {
      metadata: {
        investmentId,
        uploadedAt: new Date().toISOString(),
      },
    },
  });

  return `gs://${config.storageBucket}/${destination}`;
}

/**
 * Upload a file from a URL to Cloud Storage
 */
export async function uploadFromUrl(
  investmentId: string,
  fileUrl: string,
  destinationFileName: string
): Promise<string> {
  const client = getStorageClient();
  const config = getGCPConfig();
  const bucket = client.bucket(config.storageBucket);

  const destination = `${getGCSFolderPath(investmentId)}${destinationFileName}`;

  console.log(`Uploading from URL ${fileUrl} to gs://${config.storageBucket}/${destination}`);

  // Download the file first
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to download file from ${fileUrl}: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const file = bucket.file(destination);
  await file.save(buffer, {
    metadata: {
      metadata: {
        investmentId,
        uploadedAt: new Date().toISOString(),
        sourceUrl: fileUrl,
      },
    },
  });

  return `gs://${config.storageBucket}/${destination}`;
}

/**
 * Delete a file from Cloud Storage
 */
export async function deleteDocument(gcsUri: string): Promise<void> {
  const client = getStorageClient();

  // Parse GCS URI: gs://bucket-name/path/to/file
  const match = gcsUri.match(/^gs:\/\/([^\/]+)\/(.+)$/);
  if (!match) {
    throw new Error(`Invalid GCS URI: ${gcsUri}`);
  }

  const [, bucketName, filePath] = match;
  const bucket = client.bucket(bucketName);

  console.log(`Deleting ${gcsUri}`);
  await bucket.file(filePath).delete();
}

/**
 * List all documents for an investment
 */
export async function listDocuments(investmentId: string): Promise<string[]> {
  const client = getStorageClient();
  const config = getGCPConfig();
  const bucket = client.bucket(config.storageBucket);

  const prefix = getGCSFolderPath(investmentId);
  const [files] = await bucket.getFiles({ prefix });

  return files.map(file => `gs://${config.storageBucket}/${file.name}`);
}

/**
 * Delete all documents for an investment
 */
export async function deleteAllDocuments(investmentId: string): Promise<void> {
  const documents = await listDocuments(investmentId);

  console.log(`Deleting ${documents.length} documents for investment ${investmentId}`);

  await Promise.all(documents.map(uri => deleteDocument(uri)));
}

/**
 * Check if a file exists in Cloud Storage
 */
export async function fileExists(gcsUri: string): Promise<boolean> {
  const client = getStorageClient();

  const match = gcsUri.match(/^gs:\/\/([^\/]+)\/(.+)$/);
  if (!match) {
    throw new Error(`Invalid GCS URI: ${gcsUri}`);
  }

  const [, bucketName, filePath] = match;
  const bucket = client.bucket(bucketName);

  const [exists] = await bucket.file(filePath).exists();
  return exists;
}
