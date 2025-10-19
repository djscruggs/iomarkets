#!/bin/sh

# Production startup script for Fly.io deployment

echo "🚀 Starting IOMarkets..."

# Write Google Cloud credentials from secret if provided
if [ -n "$GOOGLE_CREDENTIALS_JSON" ]; then
  echo "📝 Writing Google Cloud credentials..."
  mkdir -p /app/credentials
  echo "$GOOGLE_CREDENTIALS_JSON" > /app/credentials/google-credentials.json
  echo "✅ Credentials file created successfully"
else
  echo "⚠️  Warning: GOOGLE_CREDENTIALS_JSON not set. RAG features will not work."
fi

# Verify credentials file exists
if [ -f "/app/credentials/google-credentials.json" ]; then
  echo "✅ Google Cloud credentials file found"
else
  echo "❌ Error: Google Cloud credentials file not found at /app/credentials/google-credentials.json"
fi

# Start the application
echo "🎯 Starting application server..."
exec npm run start
