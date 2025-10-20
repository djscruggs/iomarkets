# Quick Start Guide - RAG System

## ✅ What's Already Done

- ✅ Google Cloud APIs enabled
- ✅ Service account created with credentials
- ✅ Fly.io secrets configured
- ✅ Code deployed to production
- ✅ Database seeded

## 🚀 Next Steps to Get AI Chat Working

### 1. Index Documents for an Investment

Pick an investment that has PDF documents. Investment ID `51` (Holiday Terrace) has 6 PDFs.

```bash
# Run locally first to test
npm run rag:index 51
```

**What this does:**
1. Uploads PDFs to Google Cloud Storage
2. Creates a Discovery Engine Data Store
3. Imports documents (takes 5-30 minutes)
4. Updates database with status

**Expected output:**
```
========================================
Indexing documents for investment: 51
========================================

✓ Found investment: Holiday Terrace Apartments
✓ Found 6 PDF document(s) to index

📤 Uploading documents to Cloud Storage...
  Uploading: Ex 1 Cert of LP Holiday Terrace...
  ✓ Uploaded to gs://iomarkets-dd/investments/51/...
  [... more uploads ...]

✓ Uploaded 6 document(s) to Cloud Storage

🗄️  Creating Data Store in Discovery Engine...
✓ Data Store created: iomarkets-dd-51

📥 Importing documents into Data Store...
⏳ This may take several minutes...
✓ Documents successfully imported

========================================
✅ SUCCESS!
========================================
Investment: Holiday Terrace Apartments
Data Store ID: iomarkets-dd-51
Documents indexed: 6
Status: ready

You can now query this investment using the AI chat.
========================================
```

### 2. Check Indexing Status

```bash
# Check status of specific investment
npm run rag:status 51

# Or check all investments
npm run rag:status
```

**Example output:**
```
========================================
RAG Indexing Status
========================================

📊 Investment: Holiday Terrace Apartments
   ID: 51
   Status: ✅ READY
   Data Store ID: iomarkets-dd-51
   Documents: 6
   Indexed at: 10/19/2025, 5:30:00 PM
   Document Details:
     - Total: 6
     - Indexed: 6
     - Pending: 0
     - Failed: 0

========================================
```

### 3. Test the AI Chat

Once status shows `✅ READY`:

1. **Locally**:
   ```bash
   npm run dev
   ```
   Navigate to: `http://localhost:5173/investment/51/due-diligence`

2. **Production**:
   Navigate to: `https://iomarkets.fly.dev/investment/51/due-diligence`

3. **Ask questions like:**
   - "What is the projected IRR?"
   - "Who are the sponsors?"
   - "What are the main risks?"
   - "Summarize the investment terms"

4. **You should see:**
   - AI response grounded in documents
   - Source citations at the bottom
   - Example: `Sources: [1] Investment Memo [2] LPA Document`

### 4. Troubleshooting

#### Documents stuck in "indexing" status
```bash
npm run rag:status 51
```
- If status is `indexing` for >30 minutes, check GCP Console
- Go to: Discovery Engine > Data Stores > iomarkets-dd-51
- Check import operations

#### "Documents are not indexed" error in chat
- Run `npm run rag:status 51`
- Make sure status is `ready` not `pending` or `indexing`
- If `error`, check error message and re-run indexing

#### 401/403 errors during indexing
- Check `GOOGLE_CREDENTIALS_JSON` secret is set
- Verify service account has correct permissions in GCP Console
- Check `GCP_PROJECT_ID` matches your credentials file

#### No PDFs found for investment
```bash
# Check what assets exist
sqlite3 db/iomarkets.db "SELECT id, name, type FROM due_diligence_assets WHERE investment_id='51' LIMIT 5;"
```

## 📊 Monitor Costs

Check Google Cloud Console:
- Go to: Billing > Cost Table
- Filter by: Discovery Engine, Vertex AI
- **Should be $0** with free tier (10k queries/month, 10 GiB data)

## 🎯 Production Indexing

To index on production (Fly.io):

```bash
# SSH into production
fly ssh console

# Index documents
cd /app
npm run rag:index 51

# Check status
npm run rag:status

# Exit
exit
```

## 📝 Index More Investments

To enable AI chat for other investments:

```bash
# First, check which investments have PDFs
sqlite3 db/iomarkets.db "
  SELECT i.id, i.name, COUNT(d.id) as pdf_count
  FROM investments i
  LEFT JOIN due_diligence_assets d ON i.id = d.investment_id AND d.type = 'pdf'
  GROUP BY i.id
  HAVING pdf_count > 0;
"

# Then index any investment
npm run rag:index <investment-id>
```

## 🔄 Re-indexing

If you need to re-index (e.g., updated documents):

```bash
# The script will update existing Data Store
npm run rag:index 51
```

## 🆘 Need Help?

1. Check [RAG_README.md](RAG_README.md) - Complete documentation
2. Check [DEPLOYMENT.md](DEPLOYMENT.md) - Production setup guide
3. Check logs: `fly logs` (production) or console (local)
4. Check database: `npm run rag:status`

## ✨ What's Next?

After you have at least one investment indexed and working:
- Index more investments
- Customize AI prompts in `src/lib/gcp/vertex-ai.ts`
- Enhance citation display in `src/components/AIChat.tsx`
- Add indexing status indicators in the UI
- Create admin dashboard for managing indexed investments
