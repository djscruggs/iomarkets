# Deployment Guide

Complete guide for deploying IOMarkets to Fly.io with database, authentication, and RAG system.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [First-Time Setup](#first-time-setup)
3. [Environment Variables](#environment-variables)
4. [Deployment Steps](#deployment-steps)
5. [Database Management](#database-management)
6. [RAG System Setup](#rag-system-setup)
7. [Troubleshooting](#troubleshooting)
8. [Backup & Recovery](#backup--recovery)
9. [Scaling Considerations](#scaling-considerations)

## Prerequisites

- Fly.io CLI installed: `brew install flyctl`
- Logged in: `fly auth login`
- App created: `iomarkets`
- Google Cloud service account credentials file: `google-credentials.json`
- Clerk account with publishable key

## First-Time Setup

### 1. Create Persistent Volume

```bash
# Create 1GB volume in Dallas region (matches your primary_region in fly.toml)
fly volumes create iomarkets_data --region dfw --size 1
```

Expected output:
```
        ID: vol_xxx
      Name: iomarkets_data
       App: iomarkets
    Region: dfw
      Zone: xxxx
   Size GB: 1
 Encrypted: true
Created at: ...
```

### 2. Verify Configuration Files

Your config files should already be set up:

**[fly.toml](fly.toml)** - Volume mount and environment:
```toml
[env]
  DATABASE_PATH = "/data/iomarkets.db"
  GOOGLE_APPLICATION_CREDENTIALS = "/app/credentials/google-credentials.json"
  GCP_REGION = "us-central1"

[mounts]
  source = "iomarkets_data"
  destination = "/data"
```

**[Dockerfile](Dockerfile)** - Runtime dependencies:
- SQLite3 CLI for database operations
- ca-certificates for GCP API calls
- Startup script for credentials handling

**[.dockerignore](.dockerignore)** - Local files excluded:
- Local `db/*.db` files
- `google-credentials.json` (security)
- `node_modules/`

## Environment Variables

### Variables Set in fly.toml

These are committed to git and set for all deployments:

```toml
[env]
  DATABASE_PATH = "/data/iomarkets.db"
  GOOGLE_APPLICATION_CREDENTIALS = "/app/credentials/google-credentials.json"
  GCP_REGION = "us-central1"
```

### Secrets (Set via Fly.io CLI)

These contain sensitive data and must be set via `fly secrets`:

#### 1. Clerk Authentication
```bash
fly secrets set VITE_CLERK_PUBLISHABLE_KEY="pk_test_your-clerk-key"
```

#### 2. Google Cloud Credentials
```bash
# Set the entire JSON file contents as a secret
fly secrets set GOOGLE_CREDENTIALS_JSON="$(cat google-credentials.json)"
```

**How this works:**
- **Local**: `GOOGLE_APPLICATION_CREDENTIALS` points to `google-credentials.json` file
- **Production**: Startup script reads `GOOGLE_CREDENTIALS_JSON` and writes to `/app/credentials/google-credentials.json`
- This keeps the file-based approach while securely injecting credentials at runtime

#### 3. Google Cloud Configuration
```bash
fly secrets set GCP_PROJECT_ID="iomarkets-475622"
fly secrets set CLOUD_STORAGE_BUCKET="iomarkets-duediligence"
fly secrets set DATA_STORE_ID_PREFIX="iomarkets-"
fly secrets set GEMINI_MODEL_NAME="gemini-2.0-flash-exp"
```

#### Verify Secrets
```bash
fly secrets list
```

Should show:
- VITE_CLERK_PUBLISHABLE_KEY
- GOOGLE_CREDENTIALS_JSON
- GCP_PROJECT_ID
- CLOUD_STORAGE_BUCKET
- DATA_STORE_ID_PREFIX
- GEMINI_MODEL_NAME

### Complete Environment Variable Reference

| Variable | Required | Set Via | Value |
|----------|----------|---------|-------|
| DATABASE_PATH | Yes | fly.toml | /data/iomarkets.db |
| GOOGLE_APPLICATION_CREDENTIALS | Yes | fly.toml | /app/credentials/google-credentials.json |
| GCP_REGION | Yes | fly.toml | us-central1 |
| VITE_CLERK_PUBLISHABLE_KEY | Yes | fly secrets | Your Clerk key |
| GOOGLE_CREDENTIALS_JSON | Yes | fly secrets | Raw JSON content |
| GCP_PROJECT_ID | Yes | fly secrets | iomarkets-475622 |
| CLOUD_STORAGE_BUCKET | Yes | fly secrets | iomarkets-duediligence |
| DATA_STORE_ID_PREFIX | Yes | fly secrets | iomarkets- |
| GEMINI_MODEL_NAME | Yes | fly secrets | gemini-2.0-flash-exp |

## Deployment Steps

### 1. Prepare Credentials

```bash
# Ensure you have google-credentials.json locally
ls google-credentials.json

# Verify it's NOT in git
git check-ignore google-credentials.json  # Should output: google-credentials.json
```

### 2. Set All Secrets (First Time Only)

```bash
# Clerk
fly secrets set VITE_CLERK_PUBLISHABLE_KEY="pk_test_your-key"

# Google Cloud credentials (JSON content)
fly secrets set GOOGLE_CREDENTIALS_JSON="$(cat google-credentials.json)"

# Google Cloud config
fly secrets set GCP_PROJECT_ID="iomarkets-475622"
fly secrets set CLOUD_STORAGE_BUCKET="iomarkets-duediligence"
fly secrets set DATA_STORE_ID_PREFIX="iomarkets-"
fly secrets set GEMINI_MODEL_NAME="gemini-2.0-flash-exp"
```

### 3. Deploy Application

```bash
# Deploy to production
fly deploy

# Check status
fly status

# View logs
fly logs
```

### 4. Initialize Database (First Deploy Only)

**Option A: Using the automated deployment script (Recommended)**

```bash
# SSH into the app
fly ssh console

# Run the deployment script
cd /app
./scripts/deploy-db.sh

# Exit
exit
```

The script will:
- Check if database already has data
- **Skip seeding if data exists** (safe to run multiple times)
- Initialize and seed only if database is empty
- Verify the data was imported correctly

**Important:** The script is **safe to run on every deploy** - it won't overwrite existing data unless you use the `--force` flag.

**Option B: Manual setup**

```bash
# SSH into the app
fly ssh console

# Navigate to app directory
cd /app

# Initialize database schema
npm run db:init

# Seed with SQL file (faster than TypeScript import)
npm run db:seed

# Verify
sqlite3 /data/iomarkets.db "SELECT COUNT(*) FROM investments;"
# Should show: 51 (50 mock + 1 real)

# Exit
exit
```

### 5. Verify Application

```bash
# Check if app is running
fly status

# View logs
fly logs

# Open in browser
fly open
```

## Database Management

### Fresh Database Setup (New Deployments)

The database seed file (`db/seed.sql`) contains the complete schema and all 101 investments with:
- All investment types including venture capital
- 17 sponsors
- Holiday Terrace (#51) with 16 due diligence assets (6 PDFs + 10 photos)

To initialize a fresh database:

```bash
fly ssh console
cd /app

# Single command to create and seed database
sqlite3 /data/iomarkets.db < db/seed.sql

# Verify
sqlite3 /data/iomarkets.db "SELECT COUNT(*) FROM investments;"
# Should show: 101

exit
```

**Note:** RAG tables (`investment_data_stores`, `indexed_documents`, `rag_stores`) are created empty. You need to index documents separately (see [RAG System Setup](#rag-system-setup)).

### Updating Seed Data

The seed file is now generated from production data:

```bash
# 1. Export from production database
fly ssh console -C "sqlite3 /data/iomarkets.db .dump" > production-backup.sql

# OR regenerate locally from your database
npm run db:export:full

# 2. Commit the updated seed.sql
git add db/seed.sql
git commit -m "Update seed data from production"

# 3. Deploy
fly deploy
```

**Important:** The seed file includes schema + data. No migrations needed for fresh deployments!

### Database Operations

```bash
# SSH into production
fly ssh console

# Access database
sqlite3 /data/iomarkets.db

# Common queries
sqlite3> SELECT COUNT(*) FROM investments;
sqlite3> SELECT * FROM investment_data_stores;
sqlite3> .schema investments
sqlite3> .exit

# Exit SSH
exit
```

## RAG System Setup

### Prerequisites

1. Enable required Google Cloud APIs:
   - Vertex AI API
   - Discovery Engine API (for RAG grounding)
   - Cloud Storage API
   - Document AI API (for PDF text extraction)

2. Grant service account permissions:
   - `storage.admin` - For Cloud Storage
   - `discoveryengine.admin` - For Discovery Engine
   - `aiplatform.user` - For Vertex AI
   - `documentai.admin` - For Document AI

### Index Documents for AI Chat

**Important:** The database seed includes the schema for RAG tables, but they are empty. You must index documents for each investment to enable AI chat.

For Holiday Terrace (Investment #51):

```bash
# SSH into production
fly ssh console
cd /app

# Index using the hybrid approach (recommended)
npm run genai:index-deal-51-hybrid

# OR use other indexing methods
npm run genai:index-deal-51-ragstore  # RagStore only
npm run genai:index-deal-51           # Discovery Engine only

# Check indexing status
sqlite3 /data/iomarkets.db "SELECT status FROM investment_data_stores WHERE investment_id='51';"
# Should show: ready

# Exit
exit
```

**Indexing takes 5-15 minutes** as the system:
1. Uploads PDFs to Google Cloud Storage
2. Extracts text using Document AI
3. Stores content in SQLite for fast retrieval
4. Creates grounding data for Gemini

### Verify RAG System

1. Navigate to: `https://iomarkets.fly.dev/investment/51/due-diligence`
2. Open AI Deal Assistant chat
3. Ask a question about the investment
4. Verify you get a grounded response with citations

Example questions:
- "What is the total investment amount?"
- "Who is the sponsor?"
- "What are the projected returns?"

### RAG System Architecture

The system uses:
- **Cloud Storage**: Stores PDF documents
- **Discovery Engine**: Indexes and retrieves relevant content
- **Vertex AI (Gemini)**: Generates responses grounded in retrieved documents

See [RAG_README.md](RAG_README.md) for detailed architecture and API documentation.

## Troubleshooting

### Volume Not Mounting

```bash
# List volumes
fly volumes list

# Check volume is in same region as app
fly status

# Destroy and recreate if needed
fly volumes destroy vol_xxx
fly volumes create iomarkets_data --region dfw --size 1
```

### Database Not Found

```bash
# SSH and check
fly ssh console
ls -la /data/
cd /app
npm run db:init
npm run db:seed
```

### App Won't Start

```bash
# Check logs
fly logs

# Common issues:
# - Volume not mounted: Check fly.toml [mounts] section
# - Database path wrong: Check DATABASE_PATH env var
# - Missing dependencies: Rebuild with fly deploy --no-cache
```

### Google Cloud API Errors

**Problem**: 401/403 errors when calling GCP APIs

**Solutions**:
1. Check credentials are properly written:
   ```bash
   fly ssh console
   cat /app/credentials/google-credentials.json
   ```

2. Verify service account has correct permissions in GCP Console

3. Ensure `GCP_PROJECT_ID` matches the project in credentials file:
   ```bash
   # Check project ID in credentials
   cat google-credentials.json | grep project_id

   # Should show: "project_id": "iomarkets-475622"
   ```

### Documents Not Indexing

**Problem**: Documents upload but don't index

**Solutions**:
1. Check Discovery Engine API is enabled in GCP Console
2. Verify service account has `discoveryengine.admin` role
3. Check logs: `fly logs --grep "import"`
4. Wait 5-30 minutes for indexing to complete

### Out of Memory

**Problem**: App crashes with OOM errors

**Solutions**:
1. Check current memory allocation:
   ```bash
   fly status
   ```

2. Increase VM memory in [fly.toml](fly.toml):
   ```toml
   [[vm]]
     memory = '2gb'  # Increase from 1gb
   ```

3. Redeploy: `fly deploy`

### Out of Disk Space

```bash
# Check volume size
fly volumes list

# Extend volume (can only increase, not decrease)
fly volumes extend vol_xxx --size 2
```

## Backup & Recovery

### Manual Database Backup

```bash
# Create backup on the server
fly ssh console -C "sqlite3 /data/iomarkets.db '.backup /data/backup.db'"

# Download backup to local machine
fly ssh sftp get /data/backup.db ./backups/backup-$(date +%Y%m%d).db
```

### Automated Backup Script

Create a local script `scripts/backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="./backups"

mkdir -p $BACKUP_DIR

echo "Creating backup..."
fly ssh console -C "sqlite3 /data/iomarkets.db '.backup /data/backup.db'"

echo "Downloading backup..."
fly ssh sftp get /data/backup.db "$BACKUP_DIR/iomarkets-$DATE.db"

echo "Backup saved to $BACKUP_DIR/iomarkets-$DATE.db"

# Keep only last 7 backups
ls -t $BACKUP_DIR/iomarkets-*.db | tail -n +8 | xargs rm -f
```

Run weekly:
```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

### Restore from Backup

```bash
# Upload backup file
fly ssh sftp shell
put local-backup.db /data/iomarkets.db
exit

# Restart app
fly apps restart iomarkets
```

### Automated Backups (GitHub Actions)

```yaml
# .github/workflows/backup.yml
name: Database Backup
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup database
        run: |
          flyctl ssh console -C "sqlite3 /data/iomarkets.db '.backup /data/backup.db'"
          flyctl ssh sftp get /data/backup.db ./backup.db
      - name: Upload to storage
        # Upload to S3, GCS, or other storage
```

## Scaling Considerations

### Current Setup (MVP)
- 1 VM instance
- 1GB volume
- Auto-stop when idle (free tier friendly)
- SQLite database
- Free tier GCP usage
- Perfect for development and early users

### When to Scale

**Database:**
- **Current**: SQLite, 1GB storage
- **Scale when**: >100k users or high write concurrency
- **Solution**: Migrate to PostgreSQL or use LiteFS replication

**Compute:**
- **Current**: 1 VM, 256MB RAM
- **Scale when**: Response times >2s consistently or >10k active users
- **Solution**: Scale to 2-4 VMs with `fly scale count 2`

**Storage:**
- **Current**: 1GB volume
- **Scale when**: Database >500MB or regular "out of space" errors
- **Solution**: Extend volume with `fly volumes extend vol_xxx --size 2`

**GCP Costs:**
- **Current**: Free tier (10k queries/month)
- **Scale when**: Exceeding free tier limits
- **Solution**: Monitor costs in GCP Console, optimize queries, or upgrade plan

### Scaling Commands

```bash
# Scale memory (if needed)
fly scale memory 512

# Scale to multiple instances
fly scale count 2

# Extend volume size
fly volumes extend vol_xxx --size 2
```

## Monitoring

### Application Logs

```bash
# Real-time logs
fly logs

# Filter by component
fly logs --grep "RAG"
fly logs --grep "chat"
fly logs --grep "error"

# Export logs
fly logs > app.log
```

### GCP Monitoring

Monitor in GCP Console:
- **Billing > Cost Table**: Track costs
- **Discovery Engine Console**: Query counts and indexed data
- Set up billing alerts

### Health Checks

```bash
# Check app status
fly status

# Check recent deployments
fly releases

# Check volume status
fly volumes list
```

## Rollback

If deployment fails:

```bash
# View deployment history
fly releases

# Rollback to previous version
fly releases rollback <version-number>
```

## Cost Summary

**Current Setup:**
- Fly.io Volume: FREE (1GB within 3GB free tier)
- Fly.io Compute: FREE (256MB RAM within free tier)
- Fly.io Bandwidth: FREE (within 100GB/mo)
- GCP APIs: FREE (within free tier limits)

**Total: $0/month**

## Deployment Checklist

### First-Time Setup
- [ ] Install Fly.io CLI: `brew install flyctl`
- [ ] Login: `fly auth login`
- [ ] Create volume: `fly volumes create iomarkets_data --region dfw --size 1`
- [ ] Verify [fly.toml](fly.toml) configuration
- [ ] Set all secrets via `fly secrets set`
- [ ] Verify secrets: `fly secrets list`

### Every Deployment
- [ ] Run tests locally: `npm test`
- [ ] Build locally: `npm run build`
- [ ] Deploy: `fly deploy`
- [ ] Check status: `fly status`
- [ ] View logs: `fly logs`
- [ ] Test in browser: `fly open`
- [ ] Verify RAG system works (if applicable)

### After Major Updates
- [ ] Create database backup
- [ ] Test rollback procedure
- [ ] Update documentation
- [ ] Monitor logs for errors

## Quick Commands Reference

```bash
# Deploy
fly deploy

# Deploy without cache (clean build)
fly deploy --no-cache

# View logs
fly logs

# SSH into app
fly ssh console

# Restart app
fly apps restart iomarkets

# Check status
fly status

# List volumes
fly volumes list

# List secrets
fly secrets list

# Open app in browser
fly open

# View deployment history
fly releases

# Scale resources
fly scale memory 512
fly scale count 2
```

## Security Checklist

- [ ] `google-credentials.json` is in .gitignore
- [ ] All secrets are set via `fly secrets` (not in code)
- [ ] Service account has minimal required permissions
- [ ] HTTPS is enforced (fly.toml)
- [ ] Database is on persistent volume (not in container)
- [ ] Regular backups are configured
- [ ] Billing alerts are set up in GCP
- [ ] `.env.local` is in .gitignore (never committed)

## Support & Documentation

- **Fly.io Docs**: https://fly.io/docs/
- **Google Cloud Docs**: https://cloud.google.com/docs
- **Project Docs**:
  - [RAG_README.md](RAG_README.md) - RAG system architecture and API
  - [QUICK_START.md](QUICK_START.md) - Quick start guide for RAG
  - [db/SETUP.md](db/SETUP.md) - Database schema and setup

If you encounter issues:
1. Check logs: `fly logs`
2. Review troubleshooting section above
3. Check GCP Console for API errors
4. File an issue with logs and error messages

---

Your app is ready to deploy! 🚀
