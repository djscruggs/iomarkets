#!/bin/bash
# Fix production bookmarks table
# This script connects to the production Fly.io app and runs the migration

echo "🔧 Fixing production bookmarks table..."
echo "========================================"
echo ""

# Connect to the production app and run the migration
echo "📡 Connecting to production app..."
fly ssh console -a iomarkets -c "node /app/scripts/migrate-production.js"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Production bookmarks table fixed!"
    echo "The bookmark functionality should now work on https://iomarkets.fly.dev/"
else
    echo ""
    echo "❌ Failed to fix production bookmarks table"
    echo "You may need to redeploy the app with the latest schema"
fi
