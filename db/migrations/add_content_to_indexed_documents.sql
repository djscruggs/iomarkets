-- Add content column to indexed_documents table to store extracted PDF text
-- This enables database-based RAG without needing Discovery Engine search

ALTER TABLE indexed_documents ADD COLUMN content TEXT;
ALTER TABLE indexed_documents ADD COLUMN content_length INTEGER;

-- Create index for text search (SQLite FTS5 can be added later for better search)
CREATE INDEX idx_indexed_documents_content ON indexed_documents(content_length);
