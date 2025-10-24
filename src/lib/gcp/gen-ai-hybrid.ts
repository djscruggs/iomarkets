/**
 * Google Gen AI Service - Hybrid Approach
 *
 * Uses efficient document management with current Google Gen AI SDK
 * Optimizes for performance while working with available APIs
 */

import { GoogleGenAI } from "@google/genai";
import { searchDocuments } from '../queries-rag.js';
import { getDb } from '../db.js';

let genAI: GoogleGenAI | null = null;

/**
 * Get or create Google Gen AI client
 */
function getGenAIClient(): GoogleGenAI {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is required');
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  content: string;
  citations: Citation[];
  groundingMetadata?: any;
}

export interface Citation {
  source: string;
  title?: string;
  uri?: string;
  snippet?: string;
  assetId?: string;
}

/**
 * Store document cache info in database for efficient retrieval
 */
function storeDocumentCache(
  investmentId: string,
  documents: Array<{
    id: string;
    title: string;
    content: string;
    contentLength: number;
  }>
): void {
  const db = getDb();

  try {
    // Store in indexed_documents table for compatibility
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO indexed_documents
      (id, investment_id, asset_id, gcs_uri, content, content_length, status, indexed_at)
      VALUES (?, ?, ?, ?, ?, ?, 'indexed', datetime('now'))
    `);

    // Look up asset by URL to get the real asset_id
    const lookupAsset = db.prepare(`
      SELECT id FROM due_diligence_assets
      WHERE investment_id = ? AND name = ?
    `);

    for (const doc of documents) {
      // Remove .pdf extension from title to match asset name
      const assetName = doc.title.replace(/\.pdf$/i, '');
      const asset = lookupAsset.get(investmentId, assetName) as { id: string } | undefined;

      if (!asset) {
        console.warn(`⚠️  No asset found for "${assetName}", skipping indexed_documents insert`);
        continue;
      }

      insertStmt.run(
        `ht-${doc.id}`,
        investmentId,
        asset.id,  // Use the actual asset ID from the database
        `/duediligence/holidayterrace/${doc.title}`,
        doc.content,
        doc.contentLength
      );
    }
    
    // Mark as using hybrid approach
    const upsertStmt = db.prepare(`
      INSERT OR REPLACE INTO investment_data_stores 
      (investment_id, data_store_id, gcs_folder_path, status, document_count, indexed_at)
      VALUES (?, ?, ?, 'ready', ?, datetime('now'))
    `);
    
    upsertStmt.run(
      investmentId,
      `hybrid-deal-${investmentId}`,
      `/duediligence/holidayterrace/`,
      documents.length
    );
    
    console.log(`✓ Stored ${documents.length} documents in hybrid cache`);
  } catch (error: any) {
    console.error('Error storing document cache:', error);
    throw error;
  }
}

/**
 * Get cached documents for efficient retrieval
 */
function getCachedDocuments(investmentId: string): Array<{
  id: string;
  assetId: string;
  content: string;
  contentLength: number;
}> {
  const db = getDb();
  
  try {
    const stmt = db.prepare(`
      SELECT id, asset_id as assetId, content, content_length as contentLength
      FROM indexed_documents
      WHERE investment_id = ? AND status = 'indexed'
      ORDER BY content_length DESC
    `);
    
    return stmt.all(investmentId) as any[];
  } catch (error) {
    console.error('Error getting cached documents:', error);
    return [];
  }
}

/**
 * Smart document selection - only send relevant content
 */
function selectRelevantDocuments(
  documents: Array<{ id: string; assetId: string; content: string; contentLength: number }>,
  query: string,
  maxTokens: number = 8000
): Array<{ id: string; assetId: string; content: string; snippet: string }> {
  const queryLower = query.toLowerCase();
  const relevantDocs: Array<{ id: string; assetId: string; content: string; snippet: string }> = [];
  let totalTokens = 0;
  
  // First, try to find documents with exact keyword matches
  for (const doc of documents) {
    if (totalTokens >= maxTokens) break;
    
    const contentLower = doc.content.toLowerCase();
    const hasKeywordMatch = queryLower.split(' ').some(word => 
      word.length > 3 && contentLower.includes(word)
    );
    
    if (hasKeywordMatch) {
      // Extract relevant snippet around keywords
      let snippet = doc.content;
      if (doc.content.length > 2000) {
        // Find the best match and extract context around it
        const words = query.toLowerCase().split(' ').filter(w => w.length > 3);
        let bestMatch = -1;
        let bestScore = 0;
        
        for (const word of words) {
          const index = contentLower.indexOf(word);
          if (index !== -1) {
            const score = word.length * (1 / (index + 1)); // Prefer earlier matches
            if (score > bestScore) {
              bestScore = score;
              bestMatch = index;
            }
          }
        }
        
        if (bestMatch !== -1) {
          const start = Math.max(0, bestMatch - 500);
          const end = Math.min(doc.content.length, bestMatch + 1000);
          snippet = '...' + doc.content.slice(start, end) + '...';
        } else {
          snippet = doc.content.slice(0, 2000) + '...';
        }
      }
      
      relevantDocs.push({
        id: doc.id,
        assetId: doc.assetId,
        content: doc.content,
        snippet
      });
      
      totalTokens += snippet.length;
    }
  }
  
  // If no keyword matches, include the most important documents
  if (relevantDocs.length === 0) {
    for (const doc of documents.slice(0, 3)) { // Take top 3 most important docs
      if (totalTokens >= maxTokens) break;
      
      const snippet = doc.content.length > 2000 
        ? doc.content.slice(0, 2000) + '...'
        : doc.content;
        
      relevantDocs.push({
        id: doc.id,
        assetId: doc.assetId,
        content: doc.content,
        snippet
      });
      
      totalTokens += snippet.length;
    }
  }
  
  return relevantDocs;
}

/**
 * Chat with optimized document selection
 */
export async function chat(
  investmentId: string,
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  const ai = getGenAIClient();
  const model = "gemini-2.0-flash-exp";

  try {
    // Get cached documents
    const allDocuments = getCachedDocuments(investmentId);
    
    if (allDocuments.length === 0) {
      return {
        content: "No documents found for this investment. Please ensure documents are indexed.",
        citations: [],
      };
    }

    // Select only relevant documents (smart filtering)
    const relevantDocs = selectRelevantDocuments(allDocuments, message);
    
    console.log(`Using ${relevantDocs.length}/${allDocuments.length} documents for query`);

    // Build document context
    const documentContext = relevantDocs
      .map((doc, index) => {
        const title = `Document ${index + 1} (${doc.assetId})`;
        return `[${index + 1}] ${title}\n${doc.snippet}`;
      })
      .join('\n\n');

    // Create citations
    const citations: Citation[] = relevantDocs.map((doc, index) => ({
      source: `Document ${index + 1}`,
      title: doc.assetId,
      uri: `/duediligence/holidayterrace/${doc.assetId}`,
      snippet: doc.snippet.slice(0, 200),
      assetId: doc.assetId,
    }));

    // Build prompt with relevant context only
    const prompt = `Based on the following information from the investment documents, ${message}

Relevant Documents:
${documentContext}

Please provide a clear answer based on this information. At the end of your response, on a new line, add "SOURCES:" followed by the numbers of the documents you actually used (e.g., "SOURCES: 1, 3, 5"). If the documents don't contain enough information to answer, say so.`;

    // Build conversation context
    const contents = [];
    
    // Add conversation history
    for (const msg of conversationHistory) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }

    // Add current message with context
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    console.log(`Sending optimized chat request to Gemini (${prompt.length} chars)`);

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: `You are an AI assistant that helps investors understand investment opportunities. Answer questions directly and concisely based on the provided documents. Be specific and if information is not in the documents, say so clearly.`,
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.2,
          topP: 0.8,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      }
    });

    let text = response.text || '';

    // Parse out the SOURCES line if Gemini included it
    const sourcesMatch = text.match(/SOURCES:\s*([\d,\s]+)/i);
    let filteredCitations = citations;

    if (sourcesMatch) {
      // Extract document numbers that Gemini actually used
      const usedDocNumbers = sourcesMatch[1]
        .split(',')
        .map(n => parseInt(n.trim()))
        .filter(n => !isNaN(n));

      // Remove the SOURCES line from the response text
      text = text.replace(/\n*SOURCES:\s*[\d,\s]+\s*/i, '').trim();

      // Filter citations to only include documents Gemini used
      filteredCitations = citations.filter((_, index) =>
        usedDocNumbers.includes(index + 1)
      );

      console.log(`Filtered citations from ${citations.length} to ${filteredCitations.length} based on Gemini's sources`);
    }

    return {
      content: text,
      citations: filteredCitations,
      groundingMetadata: { 
        resultCount: relevantDocs.length,
        totalDocuments: allDocuments.length,
        approach: 'hybrid-optimized'
      },
    };
  } catch (error: any) {
    console.error('Error in hybrid chat:', error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}

/**
 * Simple chat without conversation history
 */
export async function simpleChat(
  investmentId: string,
  message: string
): Promise<ChatResponse> {
  return chat(investmentId, message, []);
}

/**
 * Index documents with hybrid approach
 */
export async function indexDocumentsHybrid(
  investmentId: string,
  documents: Array<{
    id: string;
    title: string;
    content: string;
    contentLength: number;
  }>
): Promise<void> {
  console.log(`Indexing ${documents.length} documents with hybrid approach...`);
  storeDocumentCache(investmentId, documents);
  console.log(`✓ Documents indexed and cached for efficient retrieval`);
}
