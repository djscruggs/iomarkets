# RAG System Documentation

## Overview

The IOMarkets RAG (Retrieval-Augmented Generation) system enables AI-powered Q&A grounded in investment-specific due diligence documents using Google Cloud's Vertex AI Search and Gemini API.

## Architecture

```
User Question → React Frontend → API Route → Gemini API
                                              ↓ (grounded search)
                                         Vertex AI Search
                                              ↓ (retrieves chunks)
                                         Investment Documents (GCS)
```

### Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Document Storage | Google Cloud Storage | Stores uploaded PDF documents |
| Knowledge Base | Vertex AI Search (Discovery Engine) | Indexes documents, handles RAG retrieval |
| Chat & Reasoning | Gemini 2.0 Flash | Generates answers with source citations |
| Database | SQLite | Tracks indexing status and Data Store IDs |
| Frontend | React + React Router | Chat interface with citation display |

## Setup

### 1. Google Cloud Prerequisites

#### Enable APIs
```bash
gcloud services enable storage.googleapis.com
gcloud services enable discoveryengine.googleapis.com
gcloud services enable aiplatform.googleapis.com
```

#### Create Service Account
```bash
gcloud iam service-accounts create iomarkets \
  --display-name="IOMarkets RAG Service Account"

# Grant required roles
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:iomarkets@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:iomarkets@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/discoveryengine.admin"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:iomarkets@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Download credentials
gcloud iam service-accounts keys create google-credentials.json \
  --iam-account=iomarkets@PROJECT_ID.iam.gserviceaccount.com
```

#### Create Cloud Storage Bucket
```bash
gsutil mb -p PROJECT_ID -l us-central1 gs://iomarkets-dd
```

### 2. Environment Configuration

Update `.env.local`:

```bash
# Google Cloud Configuration
GOOGLE_APPLICATION_CREDENTIALS=google-credentials.json
GCP_PROJECT_ID=your-project-id
GCP_REGION=us-central1

# Cloud Storage
CLOUD_STORAGE_BUCKET=iomarkets-dd

# Vertex AI
DATA_STORE_ID_PREFIX=iomarkets-dd-
GEMINI_MODEL_NAME=gemini-2.0-flash-exp
```

### 3. Database Migration

The schema is already updated. If you need to recreate the database:

```bash
npm run db:reset
```

## Usage

### Indexing Documents

To enable AI chat for an investment, you must first index its documents:

```bash
# Index a specific investment
npm run rag:index 51

# Check indexing status
npm run rag:status

# Check status for specific investment
npm run rag:status 51
```

#### What Happens During Indexing

1. **Upload**: PDFs are uploaded to Google Cloud Storage
2. **Create Data Store**: A Discovery Engine Data Store is created for the investment
3. **Import**: Documents are imported and indexed (takes 5-30 minutes)
4. **Database Update**: Tracking tables are updated with status

### Using the Chat Interface

Once documents are indexed:

1. Navigate to an investment's due diligence page
2. The AI chat is automatically available
3. Ask questions about the investment
4. Responses include citations from source documents

#### Example Questions

- "What is the projected IRR for this deal?"
- "Who are the sponsors and what is their track record?"
- "What are the main risks mentioned in the offering memorandum?"
- "Summarize the key terms of the investment"
- "What is the hold period?"

## File Structure

```
src/
├── lib/
│   ├── gcp/
│   │   ├── config.ts           # GCP configuration and validation
│   │   ├── storage.ts          # Cloud Storage operations
│   │   ├── discovery-engine.ts # Data Store management
│   │   └── vertex-ai.ts        # Gemini chat with grounding
│   ├── queries-rag.ts          # RAG-specific database queries
│   └── queries.ts              # Standard database queries
├── routes/
│   ├── api.chat.ts             # Chat API endpoint
│   └── investment.$id.due-diligence.tsx
├── components/
│   └── AIChat.tsx              # Chat UI component
scripts/
├── index-investment-documents.ts  # Document indexing script
└── check-indexing-status.ts       # Status checking script
db/
└── schema.sql                  # Database schema with RAG tables
```

## Database Schema

### investment_data_stores

Tracks Data Store status per investment:

| Column | Type | Description |
|--------|------|-------------|
| investment_id | TEXT | Primary key, references investments |
| data_store_id | TEXT | Unique Discovery Engine Data Store ID |
| gcs_folder_path | TEXT | Cloud Storage folder path |
| status | TEXT | pending \| indexing \| ready \| error |
| document_count | INTEGER | Number of indexed documents |
| indexed_at | DATETIME | When indexing completed |
| error_message | TEXT | Error details if status is error |

### indexed_documents

Tracks individual document indexing:

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key |
| investment_id | TEXT | References investments |
| asset_id | TEXT | References due_diligence_assets |
| gcs_uri | TEXT | Full GCS URI |
| status | TEXT | pending \| indexed \| failed |
| indexed_at | DATETIME | When document was indexed |
| error_message | TEXT | Error details if failed |

## API Reference

### POST /api/chat

Send a chat message for an investment.

**Request Body:**
```json
{
  "investmentId": "51",
  "message": "What is the projected return?",
  "history": [
    {
      "role": "user",
      "content": "Who are the sponsors?"
    },
    {
      "role": "assistant",
      "content": "The sponsors are..."
    }
  ]
}
```

**Success Response (200):**
```json
{
  "response": "The projected return is 15-18% IRR over a 5-year hold period.",
  "citations": [
    {
      "source": "Investment Memo",
      "title": "Investment Memo",
      "uri": "gs://iomarkets-dd/investments/51/memo.pdf",
      "snippet": "...15-18% IRR..."
    }
  ]
}
```

**Error Responses:**

| Status | Scenario |
|--------|----------|
| 400 | Missing or invalid parameters |
| 404 | Investment not found |
| 503 | Documents not indexed yet |
| 500 | Internal server error |

## Cost Optimization

### Free Tier Limits

| Resource | Free Tier | Notes |
|----------|-----------|-------|
| Search Queries | 10,000/month | More than enough for MVP |
| Indexed Data | 10 GiB/month | ~thousands of PDFs |
| Gemini Tokens | Generous daily limit | Using Flash model |

### Best Practices

1. **Use Flash Model**: `gemini-2.0-flash-exp` is fast and cost-effective
2. **Index Only PDFs**: Skip images/videos to save storage
3. **Monitor Usage**: Check GCP billing console regularly
4. **Set Alerts**: Configure billing alerts at $10, $50, $100

## Troubleshooting

### Documents Not Indexing

**Check:**
1. Service account has correct permissions
2. Cloud Storage bucket exists and is accessible
3. Document URLs are accessible
4. Run `npm run rag:status <investment-id>` to see errors

**Common Issues:**
- **Permission denied**: Check IAM roles on service account
- **Bucket not found**: Verify `CLOUD_STORAGE_BUCKET` in `.env.local`
- **Invalid credentials**: Check `GOOGLE_APPLICATION_CREDENTIALS` path

### Chat Not Working

**Check:**
1. Documents are indexed (`status: ready`)
2. Investment ID is being passed to AIChat component
3. Browser console for errors
4. Server logs for API errors

**Common Issues:**
- **"Documents are not indexed"**: Run indexing script first
- **"Investment not found"**: Verify investment ID is correct
- **403/401 errors**: Check service account permissions

### Slow Indexing

Indexing typically takes 5-30 minutes depending on:
- Number of documents
- Document size
- Google Cloud load

**Monitor Progress:**
```bash
npm run rag:status <investment-id>
```

## Development

### Testing Locally

1. **Index test investment**:
   ```bash
   npm run rag:index 51
   ```

2. **Start dev server**:
   ```bash
   npm run dev
   ```

3. **Navigate** to:
   ```
   http://localhost:5173/investment/51/due-diligence
   ```

4. **Test chat** with sample questions

### Adding New Features

#### Custom Prompts

Edit [src/lib/gcp/vertex-ai.ts](src/lib/gcp/vertex-ai.ts) to customize system prompts or generation config.

#### Citation Display

Modify [src/components/AIChat.tsx](src/components/AIChat.tsx) to enhance citation formatting.

#### Additional File Types

Update [scripts/index-investment-documents.ts](scripts/index-investment-documents.ts) to support DOCX, PPTX, XLSX.

## Production Deployment

### Fly.io Setup

1. **Set secrets**:
   ```bash
   # Base64 encode credentials
   cat google-credentials.json | base64 > credentials.b64

   # Set as secret
   fly secrets set GOOGLE_APPLICATION_CREDENTIALS="$(cat credentials.b64)"
   fly secrets set GCP_PROJECT_ID=your-project-id
   fly secrets set GCP_REGION=us-central1
   fly secrets set CLOUD_STORAGE_BUCKET=iomarkets-dd
   fly secrets set GEMINI_MODEL_NAME=gemini-2.0-flash-exp
   ```

2. **Deploy**:
   ```bash
   fly deploy
   ```

3. **Index documents** on production:
   ```bash
   fly ssh console
   cd /app
   npm run rag:index 51
   ```

### Monitoring

- **GCP Console**: Monitor API usage and costs
- **Application Logs**: Check for indexing/chat errors
- **Database**: Track indexing status via admin dashboard

## Security

### Best Practices

1. **Never commit credentials**: Ensure `google-credentials.json` is in `.gitignore`
2. **Use service accounts**: Never use user credentials
3. **Minimal permissions**: Only grant required IAM roles
4. **Rotate keys**: Periodically rotate service account keys
5. **Audit access**: Review Cloud Storage and API access logs

### Data Privacy

- Documents are stored in your private GCS bucket
- Data Stores are project-specific
- No data is shared with other Google Cloud projects
- Gemini API calls are not used for model training (by default)

## Support

For issues or questions:
1. Check this documentation
2. Review [GOOGLE_CLOUD.md](GOOGLE_CLOUD.md) for architecture details
3. Check Google Cloud documentation
4. File an issue in the repository

## Future Enhancements

Potential improvements:
- [ ] Bulk document upload UI
- [ ] Advanced citation visualization with page numbers
- [ ] Multi-turn conversation memory/summarization
- [ ] Excel deep analysis with formula support
- [ ] Document versioning
- [ ] Search across all investments
- [ ] Export conversation transcripts
- [ ] Admin dashboard for indexing management
