# Database Setup Complete!

## What's Been Set Up

### 1. Database Files

- **[schema.sql](schema.sql)** - SQLite schema with tables, indexes, and triggers
- **[seed.sql](seed.sql)** - Sample seed data (for reference)
- **iomarkets.db** - Live SQLite database (gitignored)

### 2. Scripts

- **[scripts/init-db.js](../scripts/init-db.js)** - Initialize database schema
- **[scripts/import-mock-data.ts](../scripts/import-mock-data.ts)** - Import all 51 investments + sponsors + assets
- **[scripts/add-holiday-terrace.ts](../scripts/add-holiday-terrace.ts)** - Add Holiday Terrace real investment with complete due diligence
- **[scripts/export-db-to-seed.ts](../scripts/export-db-to-seed.ts)** - Export current database to seed.sql
- **[scripts/generate-seed-sql.ts](../scripts/generate-seed-sql.ts)** - Generate SQL seed data from mock data
- **[scripts/test-db.ts](../scripts/test-db.ts)** - Test database connection and queries

### 3. Database Utilities

- **[src/lib/db.ts](../src/lib/db.ts)** - Database connection utility
- **[src/lib/queries.ts](../src/lib/queries.ts)** - Ready-to-use query functions

## NPM Scripts

```bash
# Initialize empty database with schema
npm run db:init

# Import all mock data (TypeScript version - recommended)
npm run db:seed

# Import data from seed.sql (SQL version)
npm run db:seed:sql

# Reset database (delete + init + seed)
npm run db:reset

# Test database connection and queries
npm run db:test

# Export current database to seed.sql
npm run db:export

# Generate seed.sql from mock data
npm run db:generate-seed

# Add Holiday Terrace investment (already included in seed data)
npm run db:add-holiday-terrace
```

## Current Database Contents

- ✓ 51 investments (real estate + private equity)
- ✓ 1 featured investment (Holiday Terrace)
- ✓ 7 sponsors with contact info
- ✓ 27 due diligence assets (PDFs, images, videos)
- ✓ Investment-sponsor relationships

## Using the Database in Your App

Replace mock data imports with database queries:

```typescript
// OLD: Import mock data
import { mockInvestments } from "./data/mockInvestments";

// NEW: Query from database
import { getAllInvestments, getInvestmentById } from "./lib/queries";

// In your React Router loaders:
export async function loader() {
  const investments = getAllInvestments();
  return { investments };
}

export async function investmentLoader({ params }) {
  const investment = getInvestmentById(params.id);
  const sponsors = getSponsorsForInvestment(params.id);
  const assets = getAssetsForInvestment(params.id);

  return { investment, sponsors, assets };
}
```

## Available Query Functions

### Investments

- `getAllInvestments()` - Get all investments
- `getInvestmentById(id)` - Get single investment
- `getInvestmentsByType(type)` - Filter by 'real-estate' or 'private-equity'
- `getFeaturedInvestments()` - Get investments marked as featured
- `searchInvestments(term)` - Search by name, sponsor, or location
- `getTopPerformingInvestments(limit)` - Sorted by projected return

### Sponsors

- `getSponsorsForInvestment(investmentId)` - Get sponsors for an investment
- `getSponsorById(id)` - Get single sponsor

### Assets

- `getAssetsForInvestment(investmentId)` - Get all assets for investment
- `getAssetById(id)` - Get single asset

## Fly.io Deployment

### 1. Create Persistent Volume

```bash
fly volumes create iomarkets_data --region sjc --size 1
```

### 2. Update fly.toml

Add volume mount:

```toml
[mounts]
  source = "iomarkets_data"
  destination = "/data"
```

### 3. Set Environment Variable

```bash
fly secrets set DATABASE_PATH=/data/iomarkets.db
```

### 4. Initialize on First Deploy

```bash
# SSH into the app
fly ssh console

# Initialize database
cd /app
export DATABASE_PATH=/data/iomarkets.db
npm run db:init
npm run db:seed
```

### 5. Backup Strategy

```bash
# Create backup
fly ssh console -C "sqlite3 /data/iomarkets.db '.backup /data/backup.db'"

# Download backup locally
fly ssh sftp get /data/backup.db ./backup-$(date +%Y%m%d).db

# Restore from backup
fly ssh sftp shell
put local-backup.db /data/iomarkets.db
```

## Database Schema Features

The database includes several advanced features:

- **Foreign keys with CASCADE** - Automatic cleanup of related data
- **Triggers** - Auto-update `updated_at` timestamps on all tables
- **Indexes** - Optimized queries for type, location, featured status, and relationships
- **Check constraints** - Data validation at database level (investment types, featured flag, asset types)
- **Many-to-many relationships** - Investments can have multiple sponsors via junction table

## Database Performance

Current settings in [src/lib/db.ts](../src/lib/db.ts):

- **WAL mode** - Better concurrency for reads/writes
- **Foreign keys enabled** - Data integrity enforced
- **Connection pooling** - Single connection reused
- **Prepared statements** - Better security and performance

For production with more traffic, consider:

- Read replicas via LiteFS
- Connection pooling library (e.g., better-sqlite3-pool)
- Query caching layer (e.g., Redis)
- Regular VACUUM operations for database optimization

## Testing Locally

```bash
# Query database directly
sqlite3 db/iomarkets.db

# Show all tables
.tables

# Sample query
SELECT name, type, projected_return
FROM investments
ORDER BY projected_return DESC
LIMIT 5;

# Exit
.exit
```

## Next Steps

1. **Update your routes** to use database queries instead of mock data
2. **Test locally** with `npm run dev`
3. **Deploy to Fly.io** with persistent volume
4. **Set up backups** (cron job or manual)

## Cost Summary

- **Database storage**: FREE (3GB included in Fly.io free tier)
- **Current DB size**: ~500KB (plenty of room to grow)
- **Estimated at 10k users**: ~50MB (still free)

You're all set! 🚀
