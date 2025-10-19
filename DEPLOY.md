# Fly.io Deployment Guide

## Prerequisites

- Fly.io CLI installed (`brew install flyctl`)
- Logged in (`fly auth login`)
- App already created (iomarkets)

## Step-by-Step Deployment

### 1. Create Persistent Volume

```bash
# Create 1GB volume in Dallas region (matches your primary_region)
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

Your config files are already set up:

**[fly.toml](fly.toml)** - Volume mount and environment:
```toml
[env]
  DATABASE_PATH = "/data/iomarkets.db"

[mounts]
  source = "iomarkets_data"
  destination = "/data"
```

**[Dockerfile](Dockerfile)** - SQLite3 installed:
- Build stage: SQLite3 + build tools for better-sqlite3
- Runtime stage: SQLite3 CLI for database operations

**[.dockerignore](.dockerignore)** - Local DB excluded:
- Prevents copying local `db/*.db` files to Docker image
- Database will be created fresh on the server

✓ All configuration done!

### 3. Deploy Application

```bash
fly deploy
```

This will:
- Build your Docker image
- Deploy to Fly.io
- Mount the volume to `/data`

### 4. Initialize Database (First Deploy Only)

After first deployment, SSH in and set up the database:

```bash
# SSH into the app
fly ssh console

# Navigate to app directory
cd /app

# Initialize database
npm run db:init

# Seed with data
npm run db:seed

# Verify
sqlite3 /data/iomarkets.db "SELECT COUNT(*) FROM investments;"
# Should show: 50

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

## Database Backup Strategy

### Manual Backup

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

### Out of Space

```bash
# Check volume size
fly volumes list

# Extend volume (can only increase, not decrease)
fly volumes extend vol_xxx --size 2
```

## Scaling Considerations

### Current Setup (MVP)
- 1 instance
- 1GB volume
- Auto-stop when idle (free tier friendly)
- Perfect for development and early users

### When to Scale

**Don't need to scale until:**
- 10k+ active users
- Database > 500MB
- Regular downtime issues

**Then consider:**
- LiteFS for replication
- Multiple read replicas
- Dedicated instance (no auto-stop)

## Cost Summary

**Current Setup:**
- Volume: FREE (1GB within 3GB free tier)
- Compute: FREE (256MB RAM within free tier)
- Bandwidth: FREE (within 100GB/mo)

**Total: $0/month** ✓

## Deployment Checklist

- [ ] Create volume: `fly volumes create iomarkets_data --region dfw --size 1`
- [ ] Verify fly.toml has [mounts] and [env] sections
- [ ] Deploy: `fly deploy`
- [ ] SSH and initialize DB: `npm run db:init && npm run db:seed`
- [ ] Test: `fly open`
- [ ] Set up backup script
- [ ] Schedule weekly backups

## Quick Commands Reference

```bash
# Deploy
fly deploy

# View logs
fly logs

# SSH into app
fly ssh console

# Restart app
fly apps restart iomarkets

# Scale memory (if needed)
fly scale memory 512

# Check status
fly status

# List volumes
fly volumes list

# Open app in browser
fly open
```

## Next Steps After Deployment

1. Test all features work with real database
2. Set up weekly backup cron job
3. Monitor logs for errors
4. Add health checks if needed
5. Consider adding staging environment

Your app is ready to deploy! 🚀
