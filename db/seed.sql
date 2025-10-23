-- Complete IOMarkets Database Seed File
-- Auto-generated from production database
-- Last generated: 2025-10-23T22:56:31.984Z
--
-- This file contains the complete schema and data.
-- To use: sqlite3 db/iomarkets.db < db/seed.sql
--

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
  type TEXT NOT NULL CHECK(type IN ('real-estate', 'private-equity', 'venture-capital')),
  location TEXT,
  min_investment INTEGER NOT NULL,
  projected_return REAL NOT NULL,
  term TEXT NOT NULL,
  featured INTEGER DEFAULT 0 CHECK(featured IN (0, 1)),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  description TEXT
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
  content TEXT,
  content_length INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES due_diligence_assets(id) ON DELETE CASCADE
);

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

-- Bookmarks table for user favorites
CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  investment_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE,
  UNIQUE(user_id, investment_id)
);

-- RAG Indexes
CREATE INDEX IF NOT EXISTS idx_investment_data_stores_status ON investment_data_stores(status);
CREATE INDEX IF NOT EXISTS idx_indexed_documents_investment_id ON indexed_documents(investment_id);
CREATE INDEX IF NOT EXISTS idx_indexed_documents_status ON indexed_documents(status);
CREATE INDEX IF NOT EXISTS idx_indexed_documents_content ON indexed_documents(content_length);
CREATE INDEX IF NOT EXISTS idx_rag_stores_status ON rag_stores(status);

-- Bookmark Indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_investment_id ON bookmarks(investment_id);


-- ============================================================================
-- DATA IMPORT
-- ============================================================================

-- Insert all 101 investments
INSERT OR REPLACE INTO investments (id, name, sponsor, target_raise, amount_raised, image_url, type, location, min_investment, projected_return, term, featured, description) VALUES
('10029719656', 'Baraka Lend', 'Foundation Capital', 2000000, 150000, 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A leading Shariah Compliant Digital Lending Fintech in Pakistan raising USD 2M for Seed round on SAFE to further scale their services and expand across other segments'),
('10423127946', 'SiamGreen Farms', 'First Round Capital', 1000000, 650000, 'https://images.unsplash.com/photo-1536964310528-e47dd655ecf3?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Cannabis Farm project in Thailand raising USD 1M'),
('10423128146', 'Enclave', 'Accel Partners', 12500000, 10400000, 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A Facebook killer private social network raising USD 12.5M Series B'),
('10423168778', 'Prism Capital', 'Lightspeed Venture Partners', 1250000, 900000, 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'UK BaaS for for Families & Children Expansion in Vietnam raising seeking a GBP 1.25M'),
('10423186034', 'Vibe3', 'Silver Lake Partners', 2000000, 250000, 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Web3 based TikTok and Discord killer raising USD 2M'),
('10839351315', 'Enterprise Performance', '500 Global', 3000000, 300000, 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'All-in-One Enterprise Performance & Learning Experience Platform raising USD 3M Seed Round'),
('10839377298', 'Korona Bridge Capital', 'Kleiner Perkins', 55000000, 4850000, 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A Very Profitable Polish Provider of Short-term Asset Backed Bridge Loans for SMEs is looking for raise EUR 55M'),
('10963331673', 'CredenceChain', 'Gobi Partners', 1000000, 50000, 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Open Permissioned B2B SaaS DLT Solution Automating SSIs in the Financial Services Industry'),
('10993441873', 'Beaut� Bridge', 'Creandum', 5000000, 1250000, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Unique Asian Marketplace for European Cosmetic & Personal Care Products seeking up to GBP 5M in debt and equity'),
('11083743119', 'Mineral Deposits Resources', 'East Ventures', 1000000, 900000, 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A Mineral Deposits Mining Compnay in Germany is looking for EUR 100-150M debt/equity or an outright sale for EUR 1B'),
('11764377724', 'Atlas Capital', 'Andreessen Horowitz', 200000000, 63100000, 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop', 'venture-capital', NULL, 50000, 15, '5 years', 0, 'A hedge fund with 40 different strategies raising up to USD 200M for each of them'),
('11764378192', 'Pangea Graphite Holdings', 'Foundation Capital', 20000000, 11200000, 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A company with producing graphite assets in Africa and Latin America looking to raise circa USD 20M'),
('12316292637', 'Citadel Bank', 'Coatue Management', 1000000, 600000, 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'GBP 25M Tier 1/2 Capital is required for a UK Bank'),
('12316292917', 'AnatoliaTherm Energy', 'Northzone', 15000000, 11200000, 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&auto=format&fit=crop', 'real-estate', NULL, 50000, 15, '5 years', 0, 'The Turkish Geothermal company is raising EUR 15M for 51% equity stake'),
('13408806965', 'PropelHQ', 'Canaan Partners', 1000000, 200000, 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A Revenue Generating Learning & Development SaaS for Scale-ups has raised GBP 440K and is looking for the remaining GBP 500K'),
('13969523300', 'TerraNova Hospitality', 'OrbiMed', 300000000, 258850000, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop', 'real-estate', NULL, 50000, 15, '5 years', 0, 'Green Hotels Development Platform looking to raise GBP 300M equity'),
('14062510371', 'Aerofarm', 'Canaan Partners', 6500000, 4800000, 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Future of Sustainable Urban Farming Co raising EUR 6.5M'),
('14062510978', 'Ascendant Capital Partners', 'Kleiner Perkins', 1000000, 600000, 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop', 'venture-capital', NULL, 50000, 15, '5 years', 0, '~30% Annual Returns Award-Winning Hedge Fund'),
('14062511246', 'MirageAI', 'General Catalyst', 5000000, 4350000, 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'AI VR Console for 6-7 Billion Smartphone Users Without Additional Hardware raising USD 5M'),
('14519190297', 'GlucoScan', 'SoftBank Vision Fund', 1000000, 150000, 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A Co developing Non-invasive Glucose Monitoring device for the Pre-Diabetics and Type II Diabetics is raising USD 1M'),
('14796001590', 'Nano Paste Holdings', 'IVP (Institutional Venture Partners)', 230000000, 149850000, 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A Nano Paste Solar Manufacturing Plant in Germany raising EUR 230M in equity and debt'),
('14796012117', 'Maghreb Ventures', 'Ribbit Capital', 20000000, 2550000, 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&auto=format&fit=crop', 'venture-capital', NULL, 50000, 15, '5 years', 0, 'North Africa focused Early Stage VC Fund raising up to USD 20M'),
('15103192137', 'Decentra', 'Greylock Partners', 1000000, 550000, 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Pioneering Web3, Blockchain, and AI Enterprise Software with GBP 9M Contracted Revenues raising Series A Round of GBP 15M in equity and convertible debt'),
('15484050227', 'Apex Play', 'EQT Ventures', 50000000, 16100000, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'The Largest iGaming Platform in the USA raising up to USD 50M of Senior Debt, USD 10M already taken'),
('15951611223', 'Collateral Capital', 'Bessemer Venture Partners', 1000000, 800000, 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop', 'real-estate', NULL, 50000, 15, '5 years', 0, 'AUD 5B Industrial Development Opportunity adjacent to the new Western Sydney Airport, Australia'),
('16436801707', 'GreenPod Data', 'Accel Partners', 3000000, 150000, 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A Sustainably Powered Modular Data Centres Company with GBP 47M pipeline is looking for an initial GBP 3M funding'),
('16619313737', 'Community Estates', 'Congruent Ventures', 500000000, 131300000, 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop', 'real-estate', NULL, 50000, 15, '5 years', 0, 'Freehold Social Housing Investment Opportunity in England raising up to GBP 500M equity & debt'),
('17897232404', 'SolidCore Energy', 'QED Investors', 500000, 0, 'https://images.unsplash.com/photo-1624996752380-8ec242e0f85d?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Revolutionary Solid-State Battery Technology Co raising GBP 500K'),
('18647947031', 'EthicalPalm Africa', 'Francisco Partners', 10000000, 8200000, 'https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A Sustainable Organic Oil Palm business in Africa looking for USD 10M growth/expansion'),
('19398820450', 'SlotSync', 'Scale Venture Partners', 1000000, 300000, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A Fast Growing B2B SaaS scheduling solution with GBP 20K MRR is for sale for GBP 2M'),
('19696043904', 'Bastion Security', 'SV Angel', 50000000, 25650000, 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Military Grade Cybersecurity Company looking for USD 50M Growth Capital'),
('19981888067', 'RecoMind', 'Vertex Ventures', 1000000, 700000, 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Equities Backed Lending - lending against listed equities and crypto currencies upwards of USD 500K'),
('21256210717', 'SkillForge AI', 'Tiger Global Management', 1000000, 700000, 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'AI-Driven E-Learning Platform - Revolutionizing B2B SaaS Corporate Training is looking for strategic/financial investors'),
('21256265876', 'LumiCore Technologies', 'Scale Venture Partners', 1000000, 500000, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Patented DeepTech Lightfield Platform with Disruptive Technology and use cases in Healthcare, Automotive, Consumer Electronics, Aerospace, Defense, Digital Marketing, Sports etc., looking to raise USD 5-50M'),
('29236478765', 'Verdant Lithium', 'East Ventures', 10000000, 5950000, 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A zero-carbon high quality lithium exploration and development company is looking to raise up to GBP 10M'),
('29236479110', 'Jamhub', 'Seedcamp', 500000, 400000, 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'An African Peer-2-Peer Marketplace for gear, studio, courses and gigs is looking for USD 500K'),
('29468147298', 'Constellation Digital Capital', 'Northzone', 25000000, 2450000, 'https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop', 'venture-capital', NULL, 50000, 15, '5 years', 0, 'The World''s first Digital Assets Fund of Funds with 2023 Returns of +85.42% & 2024 Returns to Oct +7.25%, is raising USD 25M to USD 75M'),
('3033401657', 'DirectStay', 'Vertex Ventures', 1000000, 100000, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A direct hotel booking platform disrupting the OTA market, raising GBP 1-3M'),
('3033418201', 'BuildFund', 'Versant Ventures', 1000000, 650000, 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Real Estate Lending Platform for SME House Builders raising GBP 1M in equity (EIS eligible)'),
('3033418204', 'Liquid Spaces', 'Tiger Global Management', 10000000, 7800000, 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A market maker disrupting the USD 33T CRE market, raising USD 10M, and subsequently USD 25M/month for CRE'),
('3033418206', 'GlideFleet', 'Commerce Ventures', 500000, 400000, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd86?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A micromobility e-bike and e-scooter fleet rental startup, raising GBP 500K'),
('3033418208', 'H2', 'Monk''s Hill Ventures', 5000000, 3439864, 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A seed stage company retrofitting hydrogen fuel cell technology kit for internal combustion engines, raising up to EUR 5M'),
('3033421628', 'Decentra', 'Foundation Capital', 1000000, 250000, 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A B2B SaaS blockchain trust network, facilitating ownership protection, collaboration and the exchange of data. Raising EUR 1M'),
('3033424554', 'Luna Fertility', 'Lakestar', 2000000, 550000, 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A MedTech company with a device for predicting ovulation 24 hours in advance, doubling the chance of pregnancy for each cycle, raising GBP 2M'),
('3033451278', 'ArenaX', 'Creandum', 25000000, 2200000, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'An automated esports company focused on P2P single games and tournaments, with USD 47M revenue. Raising a USD 25M pre-IPO round'),
('3033451281', '�toile Collection', 'Emergence Capital', 8000000, 3650000, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop', 'real-estate', NULL, 50000, 15, '5 years', 0, 'A borrower seeking EUR 8M acquisition financing for a 4* hotel and Michelin star restaurant in France'),
('3033464798', 'AlloyStream Mining', 'NEA (New Enterprise Associates)', 25000000, 11900000, 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A US polymetallic placer mine with estimated reserves of ~USD 32B, looking to raise USD 25M'),
('3033464799', 'ThinkSync', 'First Round Capital', 2000000, 1800000, 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Remote Collaboration B2B SaaS Medium for Knowledge Workers raising GBP 2M'),
('3033478346', 'Experienced European Holdings', 'QED Investors', 1000000, 800000, 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Experienced UK lender looking for 2 x EUR 100M UK/European short term property backed lending strategies'),
('3033506216', 'NovaMed Devices', 'NEA (New Enterprise Associates)', 1500000, 400000, 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A pre-revenue medical device company raising GBP 1.5M'),
('3033506226', 'SequenceGuard', 'Lightspeed Venture Partners', 500000, 0, 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A B2B SaaS Platform/WealthTech for Pension Providers and their clients, mitigating sequence risk, raising GBP 500K'),
('3033506230', 'FluidAsset', 'Ribbit Capital', 1000000, 300000, 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A revenue generating B2B SaaS liquidity provider for illiquid assets, raising a GBP 1M seed round'),
('3033506232', 'WindLift', 'Sofinnova Partners', 500000, 150000, 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Patented CleanTech increasing Wind Turbine Revenues by 10% raising GBP 500K equity'),
('3033509193', 'GuardianGate', 'Tiger Global Management', 1000000, 800000, 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A UK based B2B SaaS startup performing secure authentication and authorisation of under-16s, raising GBP 1M'),
('3033509201', 'AeroLean', 'Sofinnova Partners', 1000000, 750000, 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'B2B SaaS airline fuel optimisation and CO2 reduction tool, raising up to USD 1M'),
('3033536994', 'TouchReal Technologies', 'Accel Partners', 3000000, 1000000, 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A B2B VR and AR Haptic Technology company for the adult industry, raising a USD 3M series A'),
('3033537001', 'Sterling Ventures EIS', 'Foundation Capital', 1000000, 300000, 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&auto=format&fit=crop', 'venture-capital', NULL, 50000, 15, '5 years', 0, 'A UK based EIS fund'),
('3033540160', 'Axiom AI', 'Northzone', 2000000, 1450000, 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A proprietary AI driven enterprise software platform, raising GBP 2M'),
('3033540168', 'Capital Axis', 'QED Investors', 2000000, 1500000, 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Innovative Fin/PropTech Platform for Debt/Equity Investments, Exchange & Asset Manager raising GBP 2M'),
('30657742418', 'StreamForge', 'Balderton Capital', 10000000, 1450000, 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Disruptive B2B SaaS Cloud-Based Media Tech Platform raising USD 10M debt/equity'),
('3169725713', 'Juvena', 'Lightspeed Venture Partners', 500000, 300000, 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A Facial Rejuvenation Technology proven to make patients look 5-20 years younger, raising GBP 500K'),
('3294037634', 'AlpenTherm', 'Y Combinator', 913000000, 268200000, 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&auto=format&fit=crop', 'real-estate', NULL, 50000, 15, '5 years', 0, 'A Geothermal Energy project in Bavaria, raising EUR 913M in debt and equity, with the further pipeline of circa EUR 3B'),
('34457702550', 'TitanLayer', 'Y Combinator', 5000000, 1400000, 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A Leading Global Titanium 3D Printing Precision Manufacturing Platform focused on Medical & Aerospace industries is looking circa USD 5M equity investment'),
('3993548586', 'European High Holdings', 'DCM Ventures', 400000000, 58700000, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop', 'real-estate', NULL, 50000, 15, '5 years', 0, 'A European High-Performance Computing and District Heating Infrastructure developer with ~EUR 2B pipeline, currently raising EUR 400M'),
('4048722974', 'BioForge', 'NEA (New Enterprise Associates)', 135000000, 38800000, 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'An Australian Biogenic Carbon Substitution Co for Industry, Manufacturers & Agriculture is raising initial USD 135M with a pipeline of up to USD 2B'),
('4429276014', 'Consumer Litigation Holdings', 'Francisco Partners', 200000000, 167550000, 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A UK Consumer Litigation platform, raising circa GBP 200M'),
('4430563235', 'FleetVolt', 'Vertex Ventures', 500000, 100000, 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A B2B rapid charging network for electric vehicles, raising GBP 500K'),
('4431954244', 'Crestline Capital', 'QED Investors', 500000000, 426700000, 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&auto=format&fit=crop', 'venture-capital', NULL, 50000, 15, '5 years', 0, 'An established international VC fund, raising USD 500M fund VI with 200M already committed'),
('44738946913', 'ConvertPlay', 'Anthemis Group', 1000000, 250000, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'B2B SaaS AI-Driven Gamified Advertising Platform Driving 30% Higher Conversions'),
('44738946915', 'VoyaBot', 'Battery Ventures', 1000000, 250000, 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Conversational Agentic AI Travel B2B SaaS Driving Ancillary Revenues at Scale'),
('44740149355', 'FurnishIQ', 'Techstars Ventures', 1000000, 600000, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A Highly Disruptive AI-Driven B2B E-Commerce Platform for Home Furnishings with USD 9M projected revenues for 2025'),
('44740149357', 'ReHabitat', 'Creandum', 1000000, 500000, 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Integrated Waste-to-Value & Sustainable Housing Solution'),
('45197647128', 'ConceiveIQ', 'Redpoint Ventures', 1000000, 250000, 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'AI-Based B2B SaaS Platform Redefining Access to Personalised Fertility Care'),
('45331643051', 'AgriGenome', 'Accel Partners', 1000000, 800000, 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Genetics Based Vegetable Seed Company Increasing Global Food Sources & Farmer Profitability'),
('51', 'Holiday Terrace Apartments', 'DJ Scruggs & Manuel Perez', 1100000, 900000, '/duediligence/holidayterrace/photos/Exterior_On_Schaefer.jpg', 'real-estate', 'Branson, MO', 50000, 13.8, '5 years', 1, NULL),
('5218831622', 'Halo Solar', 'Khosla Ventures', 300000000, 203800000, 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format&fit=crop', 'real-estate', NULL, 50000, 15, '5 years', 0, 'A UK Rooftop Solar Project for Social Housing raising circa GBP 300M'),
('5218840179', 'Disruptive Holistic', 'Northzone', 1000000, 350000, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A Disruptive Holistic German Hospitality Sector Technology Co looking for capital to accelerate growth'),
('5595119750', 'IonForge', 'Menlo Ventures', 1000000, 150000, 'https://images.unsplash.com/photo-1624996752380-8ec242e0f85d?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A disruptive battery technology company on target for USD 17M revenue in 2021'),
('5725751297', 'AltaFin', 'Atlas Venture', 26000000, 3950000, 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'FinTech SaaS platform with a focus on Spanish-speaking markets, raising up to GBP 26M series A'),
('6257632625', 'LegacyPlan', 'Greylock Partners', 800000, 250000, 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A funeral planning company, paid from a clients pension pot, raising GBP 800K under EIS'),
('6552021596', 'Deepwater Seaport Holdings', 'Greylock Partners', 1000000, 500000, 'https://images.unsplash.com/photo-1591768793355-74d04bb6608f?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Deepwater Seaport for Sale in Sweden for EUR 20M'),
('6586481253', 'Foundry Capital', 'Lightspeed Venture Partners', 10000000, 8550000, 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&auto=format&fit=crop', 'venture-capital', NULL, 50000, 15, '5 years', 0, 'VC Fund II - UK early-stage Fin/Prop/ConsumerTech with impressive track record raising GBP 10M+'),
('6927849729', 'JusticePay', 'Kleiner Perkins', 250000, 100000, 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'UK''s First Buy Now Pay Later for Legal Fees (Fin-Legaltech/Impact) raising GBP 250K'),
('7016119617', 'Bloom Sweets', 'QED Investors', 1000000, 850000, 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A Plant-Based Confectionery with a Healthy Twist raising Seed round'),
('7016135307', 'NordicH2', 'Bessemer Venture Partners', 2500000000, 306800000, 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop', 'real-estate', NULL, 50000, 15, '5 years', 0, 'A Green Hydrogen and SMR project in Sweden raising EUR 2.5B'),
('7277316790', 'TargetCell Therapeutics', 'First Round Capital', 10000000, 4150000, 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Precision Medicine Smart Drugs Development Against Cancer & COVID-19 raising circa GBP 10M'),
('7584774280', 'Digital Bank Holdings', 'Foundation Capital', 4200000, 2500000, 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Digital Bank SPAC raising USD 4.2M for 5% equity stake'),
('7805091179', 'Growwell', 'Scale Venture Partners', 1000000, 550000, 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Cambridge Energy/AgriTech Co to Increase Crop Yield by 20% raising up to GBP 1M'),
('8177374608', 'EcoServe', 'Prime Impact Fund', 500000, 50000, 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Single-use Plastics Alternative Eco Tableware in USD 34B+ Industry raising GBP 500K'),
('8177377321', 'Boreal BioFuels', 'Atomico', 110000000, 73850000, 'https://images.unsplash.com/photo-1545259742-24f2d6e0f593?w=800&auto=format&fit=crop', 'real-estate', NULL, 50000, 15, '5 years', 0, 'Development of substantial "Green Biofuel plant" in Alberta, Canada raising USD 110M to pay for total EPC contract including all equipment and construction'),
('8584936715', 'TrackRenew', 'East Ventures', 750000, 250000, 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A sustainable rail track cleaning/maintenance technology company is looking for GBP 750K EIS qualifying equity investment'),
('8584955921', 'Summit Heating Group', 'Techstars Ventures', 5500000, 2600000, 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'A growing UK plumbing & heating co is looking for GBP 5.5M equity to acquire 3 smaller players from the same sector'),
('8584995136', 'RecoMind', 'Foundation Capital', 2000000, 300000, 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'AI & Psychology-Powered B2B SaaS Recommendation for Retail raising USD 2M Seed Round'),
('9066524200', 'Baltic BioAlgae', 'Creandum', 15000000, 3300000, 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'EUR 15M bridge loan required for a 2/3 complete Algae Biomass plant in Poland'),
('9066524681', 'CareLoop', 'Atlas Venture', 750000, 350000, 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'AI Powered digital platform for healthcare professionals, carers & patients to share best practice ideas/innovations on the ground to bridge the gap between frontline & management is raising GBP 750K Seed Round'),
('9362706536', 'DerivEdge', 'Khosla Ventures', 3500000, 2450000, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'IP Protected Derivative Purchasing & Payment Technology is looking to raise GBP 3.5M Series A in exchange for 40% of the equity'),
('9362715715', 'CarbonVault', 'Techstars Ventures', 300000, 100000, 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'UK Carbon Capture Technology Co raising GBP 300K - 700K Seed capital for a pilot project'),
('9362715964', 'Flex Talent', 'Balderton Capital', 1000000, 100000, 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Rapidly Growing Tech-Enabled Freelance Recruiter Platform raising up to GBP 1M round Seed Round'),
('9697420646', 'HealPath', 'Seedcamp', 2000000, 100000, 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Patent Pending Personalised, Innovative Medtech Solutions for Chronic Wounds raising up to GBP 2M'),
('9697420928', 'Cloudchefs', 'Bessemer Venture Partners', 1000000, 350000, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Tech-Enabled Cloud Kitchen & Healthy Indian Ready Meal Brand with GBP 965K AR raising GBP 1M'),
('9753736788', 'SimplexH2', 'Prime Impact Fund', 1200000, 1000000, 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 15, '5 years', 0, 'Simplified Electronics for Cheaper, Local Production of Green Hydrogen raising GBP 1.2M for 23% stake, to supplement UK government grants');

-- Insert all 17 sponsors
INSERT OR REPLACE INTO sponsors (id, name, email, phone, linkedin_url, photo_url, total_deals, total_value) VALUES
('s1', 'Michael Rodriguez', 'mrodriguez@ventures.com', '+1 (512) 555-0123', 'https://linkedin.com/in/michael-rodriguez', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop', 25, 212424477),
('s10', 'William Foster', 'wfoster@ventures.com', '+1 (404) 555-0131', 'https://linkedin.com/in/william-foster', 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop', 22, 363626898),
('s11', 'Lisa Patel', 'lpatel@capital.com', '+1 (512) 555-0132', 'https://linkedin.com/in/lisa-patel', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop', 29, 608520130),
('s12', 'Christopher Lee', 'clee@partners.com', '+1 (206) 555-0133', 'https://linkedin.com/in/christopher-lee', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop', 29, 246254946),
('s13', 'Amanda Wright', 'awright@ventures.com', '+1 (303) 555-0134', 'https://linkedin.com/in/amanda-wright', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop', 13, 317960752),
('s14', 'Daniel Brown', 'dbrown@capital.com', '+1 (512) 555-0135', 'https://linkedin.com/in/daniel-brown', 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&auto=format&fit=crop', 27, 369193429),
('s15', 'Rachel Cohen', 'rcohen@partners.com', '+1 (617) 555-0136', 'https://linkedin.com/in/rachel-cohen', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop', 10, 600805032),
('s2', 'Sarah Chen', 'schen@capital.com', '+1 (650) 555-0124', 'https://linkedin.com/in/sarah-chen', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop', 14, 382358347),
('s3', 'David Park', 'dpark@partners.com', '+1 (415) 555-0200', 'https://linkedin.com/in/david-park', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop', 11, 645990900),
('s4', 'James Thompson', 'jthompson@ventures.com', '+1 (512) 555-0125', 'https://linkedin.com/in/james-thompson', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop', 10, 360619598),
('s5', 'Emily Martinez', 'emartinez@capital.com', '+1 (305) 555-0126', 'https://linkedin.com/in/emily-martinez', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop', 1, 1100000),
('s51', 'DJ Scruggs', 'dj@djscruggs.com', '303-808-6614', 'https://www.linkedin.com/in/djscruggs/', 'https://media.licdn.com/dms/image/v2/D4E03AQGs3VKL9Tw6ig/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1723215901933?e=1762387200&v=beta&t=2KjajlPp9d2Rte_il5IOnk_zX1f8XDQT4zK2U5kPy3M', 1, 1100000),
('s52', 'Manuel Perez', 'dj+manuel@djscruggs.com', '303-808-6614', 'https://www.linkedin.com/in/manny-perez-369b1541/', 'https://media.licdn.com/dms/image/v2/C4E03AQGmajoAoV1OgQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1522183510537?e=1762387200&v=beta&t=LBPuvUpsPei2SkAadppuW1xrvRCx1VsaQoEy8vyRmA8', 1, 1100000),
('s6', 'Robert Kim', 'rkim@partners.com', '+1 (212) 555-0127', 'https://linkedin.com/in/robert-kim', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop', 13, 319751885),
('s7', 'Jennifer Liu', 'jliu@ventures.com', '+1 (415) 555-0128', 'https://linkedin.com/in/jennifer-liu', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop', 16, 659801525),
('s8', 'Thomas Anderson', 'tanderson@capital.com', '+1 (617) 555-0129', 'https://linkedin.com/in/thomas-anderson', 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&auto=format&fit=crop', 11, 597032035),
('s9', 'Maria Garcia', 'mgarcia@partners.com', '+1 (310) 555-0130', 'https://linkedin.com/in/maria-garcia', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&auto=format&fit=crop', 22, 275274723);

-- Investment-sponsor relationships for Holiday Terrace
INSERT OR REPLACE INTO investment_sponsors (investment_id, sponsor_id) VALUES
('51', 's51'),
('51', 's52');

-- Holiday Terrace Due Diligence Assets (PDF Documents & Photos)
INSERT OR REPLACE INTO due_diligence_assets (id, investment_id, name, type, url, thumbnail_url, uploaded_date, size) VALUES
('ht-ex-1-cert-of-lp-holiday-terrace-pdf', '51', 'Ex 1 Cert of LP Holiday Terrace', 'pdf', '/duediligence/holidayterrace/Ex 1 Cert of LP Holiday Terrace.pdf', NULL, '2022-02-22', '242 KB'),
('ht-ex-2-lpa-holiday-terrace-04182018-pdf', '51', 'Ex 2 LPA Holiday Terrace 04182018', 'pdf', '/duediligence/holidayterrace/Ex 2 LPA Holiday Terrace 04182018.pdf', NULL, '2022-02-22', '780 KB'),
('ht-ex-3-sa-holiday-terrace-pdf', '51', 'Ex 3 SA Holiday Terrace', 'pdf', '/duediligence/holidayterrace/Ex 3 SA Holiday Terrace.pdf', NULL, '2022-02-22', '299 KB'),
('ht-ex-3-sa-receipt-pdf', '51', 'Ex 3 SA receipt', 'pdf', '/duediligence/holidayterrace/Ex 3 SA receipt.pdf', NULL, '2022-02-22', '89 KB'),
('ht-ppm-holiday-terrace-04182018-pdf', '51', 'PPM Holiday Terrace 04182018', 'pdf', '/duediligence/holidayterrace/PPM Holiday Terrace 04182018.pdf', NULL, '2022-02-22', '712 KB'),
('ht-supp-sa-holiday-terrace-pdf', '51', 'Supp SA Holiday Terrace', 'pdf', '/duediligence/holidayterrace/Supp SA Holiday Terrace.pdf', NULL, '2022-02-22', '205 KB'),
('ht-photo-1b-bedrm-jpg', '51', '1B Bedrm', 'image', '/duediligence/holidayterrace/photos/1B_Bedrm.jpg', '/duediligence/holidayterrace/photos/1B_Bedrm.jpg', '2022-02-22', '157 KB'),
('ht-photo-1b-kitchen-jpg', '51', '1B Kitchen', 'image', '/duediligence/holidayterrace/photos/1B_Kitchen.jpg', '/duediligence/holidayterrace/photos/1B_Kitchen.jpg', '2022-02-22', '177 KB'),
('ht-photo-1b-liv-rm-jpg', '51', '1B Liv Rm', 'image', '/duediligence/holidayterrace/photos/1B_Liv_Rm.jpg', '/duediligence/holidayterrace/photos/1B_Liv_Rm.jpg', '2022-02-22', '194 KB'),
('ht-photo-bath-vanity-jpg', '51', 'Bath Vanity', 'image', '/duediligence/holidayterrace/photos/Bath_Vanity.jpg', '/duediligence/holidayterrace/photos/Bath_Vanity.jpg', '2022-02-22', '200 KB'),
('ht-photo-clubhouse-jpg', '51', 'Clubhouse', 'image', '/duediligence/holidayterrace/photos/Clubhouse.JPG', '/duediligence/holidayterrace/photos/Clubhouse.JPG', '2022-02-22', '2.0 MB'),
('ht-photo-exercise-rm-jpg', '51', 'Exercise Rm', 'image', '/duediligence/holidayterrace/photos/Exercise_Rm.jpg', '/duediligence/holidayterrace/photos/Exercise_Rm.jpg', '2022-02-22', '150 KB'),
('ht-photo-exterior-on-schaefer-jpg', '51', 'Exterior On Schaefer', 'image', '/duediligence/holidayterrace/photos/Exterior_On_Schaefer.jpg', '/duediligence/holidayterrace/photos/Exterior_On_Schaefer.jpg', '2022-02-22', '253 KB'),
('ht-photo-indoor-pool-jpg', '51', 'Indoor Pool', 'image', '/duediligence/holidayterrace/photos/Indoor_Pool.jpg', '/duediligence/holidayterrace/photos/Indoor_Pool.jpg', '2022-02-22', '192 KB'),
('ht-photo-laundry-jpg', '51', 'Laundry', 'image', '/duediligence/holidayterrace/photos/Laundry.jpg', '/duediligence/holidayterrace/photos/Laundry.jpg', '2022-02-22', '141 KB'),
('ht-photo-map-1-png', '51', 'Map 1', 'image', '/duediligence/holidayterrace/photos/Map_1.png', '/duediligence/holidayterrace/photos/Map_1.png', '2022-02-22', '115 KB');

-- Database Summary:
-- Total investments: 101
--   private-equity: 83
--   real-estate: 11
--   venture-capital: 7
-- Total sponsors: 17
-- Total sponsor relationships: 0
-- Total due diligence assets: 0
