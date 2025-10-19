# Database Schema Documentation

This directory contains the SQLite database schema and seed data for the IOMarkets MVP.

## Files

- `schema.sql` - Database schema definition with tables, indexes, and triggers
- `seed.sql` - Sample seed data (subset of mock data for testing)
- `README.md` - This file

## Database Structure

### Tables

#### investments
Stores investment opportunities with all their details.

**Columns:**
- `id` (TEXT, PRIMARY KEY) - Unique investment identifier
- `name` (TEXT) - Investment name
- `sponsor` (TEXT) - Sponsor company name
- `target_raise` (INTEGER) - Target fundraising amount in dollars
- `amount_raised` (INTEGER) - Current amount raised in dollars
- `image_url` (TEXT) - Main image URL
- `type` (TEXT) - Investment type: 'real-estate' or 'private-equity'
- `location` (TEXT, nullable) - Geographic location (primarily for real estate)
- `min_investment` (INTEGER) - Minimum investment amount in dollars
- `projected_return` (REAL) - Projected return as percentage
- `term` (TEXT) - Investment term duration
- `created_at`, `updated_at` (DATETIME) - Timestamps

**Indexes:**
- `idx_investments_type` - On type field for filtering
- `idx_investments_location` - On location field for geographic queries

#### sponsors
Stores sponsor/manager information.

**Columns:**
- `id` (TEXT, PRIMARY KEY) - Unique sponsor identifier
- `name` (TEXT) - Sponsor full name
- `email` (TEXT, UNIQUE) - Email address
- `phone` (TEXT) - Phone number
- `linkedin_url` (TEXT) - LinkedIn profile URL
- `photo_url` (TEXT) - Profile photo URL
- `total_deals` (INTEGER) - Total number of deals completed
- `total_value` (INTEGER) - Total value of all deals
- `created_at`, `updated_at` (DATETIME) - Timestamps

**Indexes:**
- `idx_sponsors_email` - On email field for lookups

#### investment_sponsors
Junction table for many-to-many relationship between investments and sponsors.

**Columns:**
- `investment_id` (TEXT, FK) - References investments.id
- `sponsor_id` (TEXT, FK) - References sponsors.id
- `created_at` (DATETIME) - Timestamp

**Primary Key:** Composite (investment_id, sponsor_id)

**Indexes:**
- `idx_investment_sponsors_investment_id` - For investment lookups
- `idx_investment_sponsors_sponsor_id` - For sponsor lookups

#### due_diligence_assets
Stores documents, images, and videos related to investments.

**Columns:**
- `id` (TEXT, PRIMARY KEY) - Unique asset identifier
- `investment_id` (TEXT, FK) - References investments.id
- `name` (TEXT) - Asset display name
- `type` (TEXT) - Asset type: 'pdf', 'image', or 'video'
- `url` (TEXT) - Asset URL
- `thumbnail_url` (TEXT, nullable) - Thumbnail URL (for images/videos)
- `uploaded_date` (DATE) - Upload date
- `size` (TEXT) - File size (human-readable)
- `created_at`, `updated_at` (DATETIME) - Timestamps

**Indexes:**
- `idx_due_diligence_investment_id` - For investment lookups

## Setup Instructions

### 1. Create Database

```bash
# Create the database file
sqlite3 iomarkets.db < schema.sql
```

### 2. Seed Sample Data

```bash
# Load seed data
sqlite3 iomarkets.db < seed.sql
```

### 3. Full Data Import

To import all 50 investments and associated data from the TypeScript mock files, you'll need to create a migration script. Example using Node.js:

```javascript
// scripts/import-mock-data.js
import Database from 'better-sqlite3';
import { mockInvestments } from '../src/data/mockInvestments.js';
import { mockSponsors, mockDueDiligenceAssets } from '../src/data/mockDueDiligence.js';

const db = new Database('db/iomarkets.db');

// Insert all investments
const insertInvestment = db.prepare(`
  INSERT INTO investments (id, name, sponsor, target_raise, amount_raised, image_url, type, location, min_investment, projected_return, term)
  VALUES (@id, @name, @sponsor, @targetRaise, @amountRaised, @imageUrl, @type, @location, @minInvestment, @projectedReturn, @term)
`);

mockInvestments.forEach(inv => {
  insertInvestment.run({
    id: inv.id,
    name: inv.name,
    sponsor: inv.sponsor,
    targetRaise: inv.targetRaise,
    amountRaised: inv.amountRaised,
    imageUrl: inv.imageUrl,
    type: inv.type,
    location: inv.location || null,
    minInvestment: inv.minInvestment,
    projectedReturn: inv.projectedReturn,
    term: inv.term
  });
});

// Insert sponsors and relationships...
```

## Common Queries

### Get all real estate investments
```sql
SELECT * FROM investments WHERE type = 'real-estate';
```

### Get investment with sponsors
```sql
SELECT
  i.*,
  s.name as sponsor_name,
  s.email as sponsor_email
FROM investments i
JOIN investment_sponsors isp ON i.id = isp.investment_id
JOIN sponsors s ON isp.sponsor_id = s.id
WHERE i.id = '1';
```

### Get all assets for an investment
```sql
SELECT * FROM due_diligence_assets
WHERE investment_id = '1'
ORDER BY uploaded_date DESC;
```

### Search investments by location
```sql
SELECT * FROM investments
WHERE location LIKE '%Austin%';
```

### Get top performing investments by projected return
```sql
SELECT * FROM investments
ORDER BY projected_return DESC
LIMIT 10;
```

## Fly.io Deployment

### Using Persistent Volumes

1. Create a volume:
```bash
fly volumes create iomarkets_data --region sjc --size 1
```

2. Update `fly.toml`:
```toml
[mounts]
  source = "iomarkets_data"
  destination = "/data"
```

3. Initialize database on first deploy:
```bash
fly ssh console
cd /data
sqlite3 iomarkets.db < /app/db/schema.sql
sqlite3 iomarkets.db < /app/db/seed.sql
```

### Backup Strategy

```bash
# Create backup
fly ssh console -C "sqlite3 /data/iomarkets.db '.backup /data/backup.db'"

# Download backup
fly ssh sftp get /data/backup.db ./local-backup.db
```

## Development vs Production

- **Development**: Use `db/iomarkets.db` (gitignored)
- **Production**: Use `/data/iomarkets.db` on Fly.io volume

## Notes

- SQLite is suitable for this MVP with single-instance deployment
- For horizontal scaling, consider migrating to PostgreSQL
- All foreign keys have CASCADE delete to maintain referential integrity
- Timestamps are automatically managed via triggers
