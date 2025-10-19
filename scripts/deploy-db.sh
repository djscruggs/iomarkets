#!/bin/bash
# Database deployment script for Fly.io
# Usage: ./scripts/deploy-db.sh

set -e  # Exit on error

echo "🚀 IOMarkets Database Deployment Script"
echo "========================================"
echo ""

# Check if DATABASE_PATH is set, otherwise use default
DB_PATH="${DATABASE_PATH:-/data/iomarkets.db}"
echo "Database path: $DB_PATH"
echo ""

# Check if database already exists
if [ -f "$DB_PATH" ]; then
    echo "⚠️  Database already exists at $DB_PATH"
    read -p "Do you want to reset and reseed? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 0
    fi
    echo "🗑️  Removing existing database..."
    rm -f "$DB_PATH"
fi

echo "📝 Initializing database schema..."
node scripts/init-db.js

if [ $? -ne 0 ]; then
    echo "❌ Failed to initialize database"
    exit 1
fi

echo "✅ Schema initialized"
echo ""

echo "📦 Seeding database with data..."
sqlite3 "$DB_PATH" < db/seed.sql

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi

echo "✅ Database seeded"
echo ""

echo "🔍 Verifying data..."
echo ""
echo "Investments:"
sqlite3 "$DB_PATH" "SELECT COUNT(*) || ' total' FROM investments;"
echo ""
echo "Sponsors:"
sqlite3 "$DB_PATH" "SELECT COUNT(*) || ' total' FROM sponsors;"
echo ""
echo "Assets:"
sqlite3 "$DB_PATH" "SELECT COUNT(*) || ' total' FROM due_diligence_assets;"
echo ""

echo "✅ Database deployment complete!"
echo ""
echo "Database is ready at: $DB_PATH"
