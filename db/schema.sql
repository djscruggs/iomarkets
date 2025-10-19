-- SQLite Schema for IOMarkets MVP
-- Generated from TypeScript data models

-- Investments table
CREATE TABLE IF NOT EXISTS investments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sponsor TEXT NOT NULL,
  target_raise INTEGER NOT NULL,
  amount_raised INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('real-estate', 'private-equity')),
  location TEXT,
  min_investment INTEGER NOT NULL,
  projected_return REAL NOT NULL,
  term TEXT NOT NULL,
  featured INTEGER DEFAULT 0 CHECK(featured IN (0, 1)),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sponsors table
CREATE TABLE IF NOT EXISTS sponsors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  linkedin_url TEXT,
  photo_url TEXT,
  total_deals INTEGER DEFAULT 0,
  total_value INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Investment sponsors junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS investment_sponsors (
  investment_id TEXT NOT NULL,
  sponsor_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (investment_id, sponsor_id),
  FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE,
  FOREIGN KEY (sponsor_id) REFERENCES sponsors(id) ON DELETE CASCADE
);

-- Due diligence assets table
CREATE TABLE IF NOT EXISTS due_diligence_assets (
  id TEXT PRIMARY KEY,
  investment_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('pdf', 'image', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  uploaded_date DATE NOT NULL,
  size TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_investments_type ON investments(type);
CREATE INDEX IF NOT EXISTS idx_investments_location ON investments(location);
CREATE INDEX IF NOT EXISTS idx_investments_featured ON investments(featured);
CREATE INDEX IF NOT EXISTS idx_sponsors_email ON sponsors(email);
CREATE INDEX IF NOT EXISTS idx_due_diligence_investment_id ON due_diligence_assets(investment_id);
CREATE INDEX IF NOT EXISTS idx_investment_sponsors_investment_id ON investment_sponsors(investment_id);
CREATE INDEX IF NOT EXISTS idx_investment_sponsors_sponsor_id ON investment_sponsors(sponsor_id);

-- Triggers to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_investments_timestamp
AFTER UPDATE ON investments
BEGIN
  UPDATE investments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_sponsors_timestamp
AFTER UPDATE ON sponsors
BEGIN
  UPDATE sponsors SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_assets_timestamp
AFTER UPDATE ON due_diligence_assets
BEGIN
  UPDATE due_diligence_assets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- RAG: Track Data Store IDs per investment
CREATE TABLE IF NOT EXISTS investment_data_stores (
  investment_id TEXT PRIMARY KEY,
  data_store_id TEXT NOT NULL UNIQUE,
  gcs_folder_path TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  indexed_at DATETIME,
  document_count INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('pending', 'indexing', 'ready', 'error')) DEFAULT 'pending',
  error_message TEXT,
  FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE
);

-- RAG: Track indexing status of individual documents
CREATE TABLE IF NOT EXISTS indexed_documents (
  id TEXT PRIMARY KEY,
  investment_id TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  gcs_uri TEXT NOT NULL,
  indexed_at DATETIME,
  status TEXT CHECK(status IN ('pending', 'indexed', 'failed')) DEFAULT 'pending',
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES due_diligence_assets(id) ON DELETE CASCADE
);

-- RAG Indexes
CREATE INDEX IF NOT EXISTS idx_investment_data_stores_status ON investment_data_stores(status);
CREATE INDEX IF NOT EXISTS idx_indexed_documents_investment_id ON indexed_documents(investment_id);
CREATE INDEX IF NOT EXISTS idx_indexed_documents_status ON indexed_documents(status);
