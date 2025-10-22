-- Migration: Add RagStore tracking table
-- Date: 2025-01-27
-- Description: Add table to track Google Gen AI RagStore corpus information

-- RAG: Track RagStore corpus information for deals
CREATE TABLE IF NOT EXISTS rag_stores (
  investment_id TEXT PRIMARY KEY,
  corpus_id TEXT NOT NULL,
  document_ids TEXT NOT NULL, -- JSON array of document IDs
  status TEXT CHECK(status IN ('pending', 'ready', 'error')) DEFAULT 'pending',
  uploaded_at DATETIME,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE
);

-- Add index for status queries
CREATE INDEX IF NOT EXISTS idx_rag_stores_status ON rag_stores(status);
