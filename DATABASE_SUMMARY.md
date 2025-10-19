# SQLite Database Setup - Complete ✓

Your IOMarkets MVP is now using SQLite with all 50 investments imported!

## Quick Start

```bash
# Database is already initialized and seeded
npm run db:test    # Verify everything works
npm run dev        # Start your app
```

## What's Been Done

### 1. Database Created
- **Location**: [db/iomarkets.db](db/iomarkets.db) (gitignored)
- **Size**: ~500KB
- **Records**: 50 investments, 5 sponsors, 11 assets

### 2. Schema & Scripts
- [db/schema.sql](db/schema.sql) - Complete database schema
- [scripts/init-db.js](scripts/init-db.js) - Initialize database
- [scripts/import-mock-data.ts](scripts/import-mock-data.ts) - Import all mock data

### 3. Query Functions Ready
- [src/lib/db.ts](src/lib/db.ts) - Database connection
- [src/lib/queries.ts](src/lib/queries.ts) - Query functions for your app

## NPM Scripts

```bash
npm run db:init     # Create empty database
npm run db:seed     # Import all data
npm run db:reset    # Delete + recreate + seed
npm run db:test     # Test queries work
```

## Next: Update Your Routes

Replace mock data with database queries:

### Before (using mock data):
```typescript
import { mockInvestments } from './data/mockInvestments';

export async function loader() {
  return { investments: mockInvestments };
}
```

### After (using database):
```typescript
import { getAllInvestments } from './lib/queries';

export async function loader() {
  return { investments: getAllInvestments() };
}
```

## Available Functions

```typescript
// Investments
getAllInvestments()
getInvestmentById(id)
getInvestmentsByType('real-estate' | 'private-equity')
searchInvestments(term)
getTopPerformingInvestments(limit)

// Sponsors
getSponsorsForInvestment(investmentId)
getSponsorById(id)

// Assets
getAssetsForInvestment(investmentId)
getAssetById(id)
```

## Database Contents

```
investments              50 records
sponsors                  5 records
investment_sponsors       5 relationships
due_diligence_assets     11 records
```

## Fly.io Deployment

### Cost: FREE (3GB included)

```bash
# 1. Create volume
fly volumes create iomarkets_data --region sjc --size 1

# 2. Add to fly.toml
[mounts]
  source = "iomarkets_data"
  destination = "/data"

# 3. Set environment
fly secrets set DATABASE_PATH=/data/iomarkets.db

# 4. Initialize on first deploy
fly ssh console
export DATABASE_PATH=/data/iomarkets.db
npm run db:init && npm run db:seed
```

See [db/SETUP.md](db/SETUP.md) for detailed deployment instructions.

## Database Schema

```sql
investments              -- Investment opportunities
  ├── id (PK)
  ├── name
  ├── sponsor
  ├── target_raise
  ├── amount_raised
  ├── type (real-estate | private-equity)
  └── ... (12 columns total)

sponsors                 -- Sponsor/manager profiles
  ├── id (PK)
  ├── name
  ├── email (unique)
  └── ... (10 columns total)

investment_sponsors      -- Many-to-many junction
  ├── investment_id (FK)
  └── sponsor_id (FK)

due_diligence_assets    -- Documents/media
  ├── id (PK)
  ├── investment_id (FK)
  ├── type (pdf | image | video)
  └── ... (8 columns total)
```

## Performance Features

- ✓ WAL mode enabled (better concurrency)
- ✓ Foreign key constraints enforced
- ✓ Indexes on commonly queried columns
- ✓ Automatic timestamps with triggers
- ✓ Single connection reused

## Backup & Restore

```bash
# Create backup
sqlite3 db/iomarkets.db ".backup backup.db"

# Restore
cp backup.db db/iomarkets.db

# Production backup
fly ssh console -C "sqlite3 /data/iomarkets.db '.backup /data/backup.db'"
fly ssh sftp get /data/backup.db ./backup-$(date +%Y%m%d).db
```

## Testing

Run the test suite:

```bash
npm run db:test
```

Expected output:
```
✓ Found 50 investments
✓ Found: Downtown Austin Mixed-Use Development
✓ Found 4 sponsors for investment 1
✓ Found 8 assets for investment 1
✓ Search works
✓ Top performers sorted correctly
```

## Files Created

```
db/
  ├── schema.sql              - Database schema
  ├── seed.sql                - Sample seed data
  ├── iomarkets.db            - Live database (gitignored)
  ├── README.md               - Full documentation
  └── SETUP.md                - Setup guide

scripts/
  ├── init-db.js              - Initialize database
  ├── import-mock-data.ts     - Import all data
  └── test-db.ts              - Test queries

src/lib/
  ├── db.ts                   - Connection utility
  └── queries.ts              - Query functions
```

## Summary

✓ SQLite database setup complete
✓ All 50 investments imported
✓ Query functions ready to use
✓ FREE to host on Fly.io (3GB volume)
✓ Easy to backup and restore
✓ Perfect for MVP

Next step: Update your route loaders to use database queries instead of mock data!
