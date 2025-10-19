/**
 * Database queries for RAG system
 */

import { getDb } from './db.js';
import { getDataStoreId, getGCSFolderPath } from './gcp/config.js';

export interface DataStoreInfo {
  investmentId: string;
  dataStoreId: string;
  gcsFolderPath: string;
  createdAt: string;
  indexedAt: string | null;
  documentCount: number;
  status: 'pending' | 'indexing' | 'ready' | 'error';
  errorMessage: string | null;
}

export interface IndexedDocument {
  id: string;
  investmentId: string;
  assetId: string;
  gcsUri: string;
  indexedAt: string | null;
  status: 'pending' | 'indexed' | 'failed';
  errorMessage: string | null;
  createdAt: string;
}

/**
 * Get data store info for an investment
 */
export function getDataStoreInfo(investmentId: string): DataStoreInfo | null {
  const db = getDb();

  const row = db
    .prepare(
      `SELECT * FROM investment_data_stores WHERE investment_id = ?`
    )
    .get(investmentId) as DataStoreInfo | undefined;

  return row || null;
}

/**
 * Create or update data store record
 */
export function upsertDataStore(
  investmentId: string,
  status: 'pending' | 'indexing' | 'ready' | 'error' = 'pending',
  errorMessage: string | null = null
): DataStoreInfo {
  const db = getDb();
  const dataStoreId = getDataStoreId(investmentId);
  const gcsFolderPath = getGCSFolderPath(investmentId);

  const existing = getDataStoreInfo(investmentId);

  if (existing) {
    db.prepare(
      `UPDATE investment_data_stores
       SET status = ?, error_message = ?, indexed_at = CASE WHEN ? = 'ready' THEN CURRENT_TIMESTAMP ELSE indexed_at END
       WHERE investment_id = ?`
    ).run(status, errorMessage, status, investmentId);
  } else {
    db.prepare(
      `INSERT INTO investment_data_stores (investment_id, data_store_id, gcs_folder_path, status, error_message)
       VALUES (?, ?, ?, ?, ?)`
    ).run(investmentId, dataStoreId, gcsFolderPath, status, errorMessage);
  }

  return getDataStoreInfo(investmentId)!;
}

/**
 * Update document count for a data store
 */
export function updateDocumentCount(investmentId: string, count: number): void {
  const db = getDb();

  db.prepare(
    `UPDATE investment_data_stores SET document_count = ? WHERE investment_id = ?`
  ).run(count, investmentId);
}

/**
 * Track a document for indexing
 */
export function trackDocumentIndexing(
  investmentId: string,
  assetId: string,
  gcsUri: string,
  status: 'pending' | 'indexed' | 'failed' = 'pending',
  errorMessage: string | null = null
): void {
  const db = getDb();
  const id = `${investmentId}-${assetId}`;

  const existing = db
    .prepare(`SELECT id FROM indexed_documents WHERE id = ?`)
    .get(id);

  if (existing) {
    db.prepare(
      `UPDATE indexed_documents
       SET gcs_uri = ?, status = ?, error_message = ?, indexed_at = CASE WHEN ? = 'indexed' THEN CURRENT_TIMESTAMP ELSE indexed_at END
       WHERE id = ?`
    ).run(gcsUri, status, errorMessage, status, id);
  } else {
    db.prepare(
      `INSERT INTO indexed_documents (id, investment_id, asset_id, gcs_uri, status, error_message)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, investmentId, assetId, gcsUri, status, errorMessage);
  }
}

/**
 * Get all indexed documents for an investment
 */
export function getIndexedDocuments(investmentId: string): IndexedDocument[] {
  const db = getDb();

  return db
    .prepare(
      `SELECT * FROM indexed_documents WHERE investment_id = ? ORDER BY created_at DESC`
    )
    .all(investmentId) as IndexedDocument[];
}

/**
 * Get indexing status summary for an investment
 */
export function getIndexingStatus(investmentId: string): {
  total: number;
  pending: number;
  indexed: number;
  failed: number;
} {
  const db = getDb();

  const result = db
    .prepare(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'indexed' THEN 1 ELSE 0 END) as indexed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
       FROM indexed_documents
       WHERE investment_id = ?`
    )
    .get(investmentId) as any;

  return {
    total: result.total || 0,
    pending: result.pending || 0,
    indexed: result.indexed || 0,
    failed: result.failed || 0,
  };
}

/**
 * Get all data stores with their status
 */
export function getAllDataStores(): DataStoreInfo[] {
  const db = getDb();

  return db
    .prepare(`SELECT * FROM investment_data_stores ORDER BY created_at DESC`)
    .all() as DataStoreInfo[];
}

/**
 * Check if investment has indexed documents ready
 */
export function hasIndexedDocuments(investmentId: string): boolean {
  const info = getDataStoreInfo(investmentId);
  return info?.status === 'ready' && (info.documentCount || 0) > 0;
}

/**
 * Delete data store record
 */
export function deleteDataStoreRecord(investmentId: string): void {
  const db = getDb();

  db.prepare(`DELETE FROM investment_data_stores WHERE investment_id = ?`).run(
    investmentId
  );

  db.prepare(`DELETE FROM indexed_documents WHERE investment_id = ?`).run(
    investmentId
  );
}
