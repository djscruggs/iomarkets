# Production Deployment Guide

## Environment Variables Required in Production

You need to set these secrets in Fly.io:

### 1. Clerk Authentication
```bash
fly secrets set VITE_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
```

### 2. Google Cloud Credentials

The credentials JSON file needs to be stored as a secret:

```bash
# Set the JSON file contents as a secret
fly secrets set GOOGLE_CREDENTIALS_JSON="$(cat google-credentials.json)"
```

### 3. Google Cloud Configuration
```bash
fly secrets set GCP_PROJECT_ID="your-project-id"
fly secrets set CLOUD_STORAGE_BUCKET="iomarkets-dd"
fly secrets set DATA_STORE_ID_PREFIX="iomarkets-dd-"
fly secrets set GEMINI_MODEL_NAME="gemini-2.0-flash-exp"
```

## How Credentials Work in Production

**Local Development:**
- `GOOGLE_APPLICATION_CREDENTIALS=google-credentials.json` points to a file on your filesystem
- The file is read directly

**Production (Fly.io):**
- The file can't be committed (it's in .gitignore)
- We store the JSON content as a secret: `GOOGLE_CREDENTIALS_JSON`
- The startup script writes it to a file at `/app/credentials/google-credentials.json`
- The environment variable `GOOGLE_APPLICATION_CREDENTIALS` points to that path

This keeps the same file-based approach but securely injects the content at runtime.

## Complete Deployment Steps

### 1. Prepare Credentials

```bash
# Ensure you have google-credentials.json locally
ls google-credentials.json

# It should NOT be in git
git check-ignore google-credentials.json  # Should output: google-credentials.json
```

### 2. Set All Secrets

```bash
# Clerk
fly secrets set VITE_CLERK_PUBLISHABLE_KEY="pk_test_your-key"

# Google Cloud credentials (JSON content)
fly secrets set GOOGLE_CREDENTIALS_JSON="$(cat google-credentials.json)"

# Google Cloud config
fly secrets set GCP_PROJECT_ID="iomarkets-475622"
fly secrets set CLOUD_STORAGE_BUCKET="iomarkets-dd"
fly secrets set DATA_STORE_ID_PREFIX="iomarkets-dd-"
fly secrets set GEMINI_MODEL_NAME="gemini-2.0-flash-exp"
```

### 3. Verify Secrets

```bash
# List all secrets (values are hidden)
fly secrets list
```

You should see:
- VITE_CLERK_PUBLISHABLE_KEY
- GOOGLE_CREDENTIALS_JSON
- GCP_PROJECT_ID
- CLOUD_STORAGE_BUCKET
- DATA_STORE_ID_PREFIX
- GEMINI_MODEL_NAME

### 4. Deploy

```bash
# Deploy the application
fly deploy

# Check deployment status
fly status

# View logs
fly logs
```

### 5. Initialize Database (First Deploy Only)

```bash
# SSH into the app
fly ssh console

# Initialize database with schema
cd /app
npm run db:init
npm run db:seed

# Exit
exit
```

### 6. Index Documents

After deployment, index your documents:

```bash
# SSH into production
fly ssh console

# Index a specific investment
cd /app
npm run rag:index 51

# Check status
npm run rag:status

# Exit
exit
```

## Environment Variable Summary

| Variable | Required | Set Via | Value |
|----------|----------|---------|-------|
| DATABASE_PATH | Yes | fly.toml | /data/iomarkets.db |
| GOOGLE_APPLICATION_CREDENTIALS | Yes | fly.toml | /app/credentials/google-credentials.json |
| GCP_REGION | Yes | fly.toml | us-central1 |
| VITE_CLERK_PUBLISHABLE_KEY | Yes | fly secrets | Your Clerk key |
| GOOGLE_CREDENTIALS_JSON | Yes | fly secrets | Raw JSON content |
| GCP_PROJECT_ID | Yes | fly secrets | cardlessid |
| CLOUD_STORAGE_BUCKET | Yes | fly secrets | iomarkets-dd |
| DATA_STORE_ID_PREFIX | Yes | fly secrets | iomarkets-dd- |
| GEMINI_MODEL_NAME | Yes | fly secrets | gemini-2.0-flash-exp |

## Verifying Deployment

### 1. Check Application Health

```bash
# Check if app is running
fly status

# View recent logs
fly logs

# Check for errors
fly logs --grep "error"
```

### 2. Test RAG System

1. Navigate to: `https://iomarkets.fly.dev/investment/51/due-diligence`
2. Open AI chat
3. Ask a question
4. Verify you get a grounded response with citations

### 3. Check Database

```bash
fly ssh console
sqlite3 /data/iomarkets.db
sqlite3> SELECT * FROM investment_data_stores;
sqlite3> .exit
exit
```

## Troubleshooting

### Google Cloud API Errors

**Problem**: 401/403 errors when calling GCP APIs

**Solutions**:
1. Check credentials are properly decoded:
   ```bash
   fly ssh console
   cat /app/credentials/google-credentials.json
   ```

2. Verify service account has correct permissions in GCP Console

3. Ensure GCP_PROJECT_ID matches the project in credentials file

### Documents Not Indexing

**Problem**: Documents upload but don't index

**Solutions**:
1. Check Discovery Engine API is enabled
2. Verify service account has `discoveryengine.admin` role
3. Check logs: `fly logs --grep "import"`

### Out of Memory

**Problem**: App crashes with OOM errors

**Solutions**:
1. Increase VM memory in fly.toml:
   ```toml
   [[vm]]
     memory = '2gb'  # Increase from 1gb
   ```

2. Redeploy: `fly deploy`

### Slow Startup

**Problem**: App takes long to start

**Cause**: GCP SDK initialization

**Expected**: First request may be slow (5-10s), subsequent requests are fast

## Monitoring

### Costs

Monitor in GCP Console:
- Billing > Cost Table
- Set up billing alerts

### Usage

Check Discovery Engine usage:
- Discovery Engine Console
- View query counts and indexed data

### Application Logs

```bash
# Real-time logs
fly logs

# Filter by component
fly logs --grep "RAG"
fly logs --grep "chat"

# Export logs
fly logs > app.log
```

## Scaling Considerations

### Current Setup (MVP)
- Single VM (1GB RAM)
- SQLite database
- Free tier GCP usage

### When to Scale

#### Database
- **When**: >100k users or high write concurrency
- **Solution**: Migrate to PostgreSQL

#### Compute
- **When**: Response times >2s consistently
- **Solution**: Scale to 2-4 VMs

#### GCP
- **When**: Exceeding free tier (10k queries/month)
- **Solution**: Monitor costs, optimize queries

## Backup Strategy

### Database Backups

```bash
# Manual backup
fly ssh console
sqlite3 /data/iomarkets.db '.backup /data/backup.db'
exit

# Download backup
fly ssh sftp get /data/backup.db ./backup-$(date +%Y%m%d).db
```

### Automated Backups

Set up a cron job:

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

## Security Checklist

- [ ] google-credentials.json is in .gitignore
- [ ] All secrets are set via `fly secrets` (not in code)
- [ ] Service account has minimal required permissions
- [ ] HTTPS is enforced (fly.toml)
- [ ] Database is on persistent volume (not in container)
- [ ] Regular backups are configured
- [ ] Billing alerts are set up in GCP

## Rollback

If deployment fails:

```bash
# View deployment history
fly releases

# Rollback to previous version
fly releases rollback <version-number>
```

## Support

If you encounter issues:
1. Check logs: `fly logs`
2. Review [RAG_README.md](RAG_README.md)
3. Check GCP Console for API errors
4. File an issue with logs and error messages
