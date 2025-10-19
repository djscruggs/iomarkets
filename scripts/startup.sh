#!/bin/sh

# Production startup script for Fly.io deployment

echo "🚀 Starting IOMarkets..."

# Decode Google Cloud credentials from base64 if provided
if [ -n "$GOOGLE_CREDENTIALS_BASE64" ]; then
  echo "📝 Decoding Google Cloud credentials..."
  mkdir -p /app/credentials
  echo "$GOOGLE_CREDENTIALS_BASE64" | base64 -d > /app/credentials/google-credentials.json
  echo "✅ Credentials decoded successfully"
else
  echo "⚠️  Warning: GOOGLE_CREDENTIALS_BASE64 not set. RAG features will not work."
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
