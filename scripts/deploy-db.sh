#!/bin/bash
# Database deployment script for Fly.io
# Usage: ./scripts/deploy-db.sh [--force]

set -e  # Exit on error

echo "🚀 IOMarkets Database Deployment Script"
echo "========================================"
echo ""

# Check if DATABASE_PATH is set, otherwise use default
DB_PATH="${DATABASE_PATH:-/data/iomarkets.db}"
echo "Database path: $DB_PATH"
echo ""

# Check if database already exists and has data
if [ -f "$DB_PATH" ]; then
    # Check if database has any investments
    INVESTMENT_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM investments;" 2>/dev/null || echo "0")

    if [ "$INVESTMENT_COUNT" != "0" ]; then
        echo "✅ Database already exists with $INVESTMENT_COUNT investments"
        echo ""

        # Only prompt if --force flag is used
        if [ "$1" == "--force" ]; then
            echo "⚠️  --force flag detected"
            read -p "Are you sure you want to reset and reseed? This will DELETE all data! (y/N): " -n 1 -r
            echo ""
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "❌ Deployment cancelled"
                exit 0
            fi
            echo "🗑️  Removing existing database..."
            rm -f "$DB_PATH"
        else
            echo "Database is already initialized and seeded."
            echo "If you need to reseed, use: ./scripts/deploy-db.sh --force"
            echo ""
            echo "Current database contents:"
            sqlite3 "$DB_PATH" "SELECT 'Investments: ' || COUNT(*) FROM investments; SELECT 'Sponsors: ' || COUNT(*) FROM sponsors; SELECT 'Assets: ' || COUNT(*) FROM due_diligence_assets;"
            exit 0
        fi
    else
        echo "⚠️  Database exists but is empty, reseeding..."
        rm -f "$DB_PATH"
    fi
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
