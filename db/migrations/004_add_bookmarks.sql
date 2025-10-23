-- Migration: Add bookmarks table
-- Date: 2025-01-27
-- Description: Add user bookmark functionality for investments

-- Bookmarks table for user favorites
CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  investment_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE,
  UNIQUE(user_id, investment_id)
);

-- Bookmark Indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_investment_id ON bookmarks(investment_id);
