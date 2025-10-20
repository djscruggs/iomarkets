# 🛠️ AI Due Diligence MVP: RAG Architecture & Configuration Blueprint

This document specifies the complete architecture, cost model, and environment configuration for a single-user, low-cost RAG MVP, leveraging **Vertex AI Search** and the **Gemini API** as a scalable replacement for NotebookLM Enterprise.

## 🎯 Project Goal

To create an API-driven AI platform that provides project-specific Q&A grounded only in uploaded due diligence documents, using a pay-as-you-go cost model.

---

## 🏛️ Architecture & Services

| Component            | Google Cloud Service                    | Role in MVP                                                                                  |
| :------------------- | :-------------------------------------- | :------------------------------------------------------------------------------------------- |
| **Document Storage** | **Cloud Storage**                       | Securely stages all documents before indexing.                                               |
| **Knowledge Base**   | **Vertex AI Search (Discovery Engine)** | The "Notebook" replacement. Indexes files, handles chunking, embedding, and retrieval (RAG). |
| **Chat & Reasoning** | **Gemini API (on Vertex AI)**           | Accepts queries, uses the Data Store for grounding, and generates the final, cited answer.   |

---

## 🔐 Environment Variables & Authentication

Your application must authenticate securely using a **Google Cloud Service Account**.

### Credentials & Access

| Variable Name                    | Value Type        | Purpose                                                                                  |
| :------------------------------- | :---------------- | :--------------------------------------------------------------------------------------- |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to JSON file | **Primary Authentication.** Points the SDK to your Service Account key file.             |
| `GCP_PROJECT_ID`                 | String            | Your Google Cloud project ID (e.g., `dd-platform-prod`).                                 |
| `GCP_REGION`                     | String            | The region of your deployment (e.g., `us-central1`). All resources should be co-located. |

### Resource Variables

| Variable Name          | Value Type | Purpose                                                                                                                             |
| :--------------------- | :--------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| `CLOUD_STORAGE_BUCKET` | String     | The name of the GCS bucket used for staging documents (e.g., `dd-project-uploads-bucket`).                                          |
| `DATA_STORE_ID_PREFIX` | String     | A prefix your app uses to name new Data Stores (e.g., `dd-client-`). The final ID is dynamically generated (`dd-client-project-X`). |
| `GEMINI_MODEL_NAME`    | String     | The cost-efficient model to use for chat (e.g., `gemini-2.5-flash`).                                                                |

### Required IAM Roles for Service Account

1.  **Vertex AI User** (`roles/aiplatform.user`)
2.  **Discovery Engine Admin** (`roles/discoveryengine.admin`)
3.  **Storage Object Admin** (`roles/storage.objectAdmin`)

---

## 📄 Phase 1: File Ingestion & Indexing (The "Notebook" Creation)

The ingestion engine in Vertex AI Search can handle Microsoft Office formats directly, simplifying your pre-processing steps.

### 1. Document Handling Strategy

| Document Type       | Ingestion Strategy           | Rationale                                                                                                                                                      |
| :------------------ | :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PDF, DOCX, PPTX** | **Direct Upload & Indexing** | Natively supported. Provides accurate text extraction and preserves document structure better than converting to image-based PDFs.                             |
| **Excel (`.xlsx`)** | **Direct Upload & Indexing** | Used for general Q&A about table contents. For deep, formula-based analysis, manual conversion to a **Google Sheet** (via the Drive API) is a separate option. |

### 2. API Interaction Flow

| Step               | API Method (Conceptual)                          | Notes                                                                                                                             |
| :----------------- | :----------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| **1. Staging**     | `storage_client.upload_from_filename`            | Your app uploads all project documents to the bucket defined by `CLOUD_STORAGE_BUCKET`.                                           |
| **2. Create KB**   | `DiscoveryEngineServiceClient.create_data_store` | Create an **Unstructured Data Store** using the `GCP_PROJECT_ID` and a unique `Data_Store_ID`.                                    |
| **3. Ingest Docs** | `DiscoveryEngineServiceClient.import_documents`  | Point this method to the GCS files. This single call triggers Google's managed RAG pipeline (OCR, chunking, embedding, indexing). |

---

## 💬 Phase 2: Chat Interaction (The "RAG Query")

All user questions are routed to the Gemini API, forcing grounding on the project-specific Data Store.

### API Interaction

The chat query is sent to the Gemini API on Vertex AI.

| Parameter             | Value                                                                                                          | Purpose                                                                                                           |
| :-------------------- | :------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| **Model**             | `GEMINI_MODEL_NAME` (e.g., `gemini-2.5-flash`)                                                                 | Ensures low inference costs.                                                                                      |
| **Tools (Grounding)** | `[DiscoveryEngineDataStore(id=PROJECT_DATA_STORE_ID)]`                                                         | **CRITICAL:** This dynamically generated ID restricts the model to the document set for the current project only. |
| **Output**            | The model returns a verified answer, automatically including **source citations** from the retrieved snippets. |

---

## 💰 Cost Structure Summary (Pay-As-You-Go)

This model offers excellent cost control suitable for an MVP compared to the fixed licensing of NotebookLM Enterprise.

| Cost Component        | Pricing Unit         | Free Tier Allowance             | Notes                                                                                |
| :-------------------- | :------------------- | :------------------------------ | :----------------------------------------------------------------------------------- |
| **Indexing/Querying** | Search Query Count   | **10,000 queries per month**    | You will likely not pay query costs for a single-user MVP.                           |
| **Data Storage**      | GiB of Indexed Data  | **10 GiB per month**            | Excellent for keeping initial due diligence documents indexed cost-free.             |
| **LLM Token Usage**   | Per 1 Million Tokens | Generous daily free-tier limits | `gemini-2.5-flash` ensures token costs are minimal when you exceed free-tier limits. |
