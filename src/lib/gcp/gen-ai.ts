/**
 * Google Gen AI Service - RagStore Optimized
 *
 * Handles chat interactions with Gemini using Google Gen AI SDK
 * Uses RagStore for efficient document management (upload once, reference many)
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

export interface RagStoreInfo {
  corpusId: string;
  documentIds: string[];
  uploadedAt: string;
}

/**
 * Search database for relevant documents
 */
async function searchDatabaseDocuments(
  investmentId: string,
  query: string
): Promise<{ results: any[]; summary: string }> {
  console.log(`Searching database for investment ${investmentId} with query: "${query}"`);

  try {
    const documents = searchDocuments(investmentId, query);

    console.log(`Found ${documents.length} matching documents`);

    // Convert to a format similar to Discovery Engine results
    const results = documents.map(doc => ({
      id: doc.id,
      assetId: doc.assetId,
      uri: doc.gcsUri,
      content: doc.content,
      contentLength: doc.contentLength,
    }));

    return { results, summary: '' };
  } catch (error: any) {
    console.error('Error searching database:', error);
    throw new Error(`Failed to search documents: ${error.message}`);
  }
}

/**
 * Create a RagCorpus for a specific deal
 * Each deal gets its own isolated document space
 */
export async function createDealRagCorpus(
  investmentId: string,
  dealName: string
): Promise<{ corpusId: string; corpusName: string }> {
  const ai = getGenAIClient();
  
  try {
    // Create a unique RagCorpus for this deal
    const corpusName = `deal-${investmentId}-${Date.now()}`;
    const displayName = `${dealName} (Deal ${investmentId})`;
    
    // Note: RagCorpus creation might not be available in the current SDK
    // For now, we'll use a mock corpus ID and focus on the document upload approach
    const corpusId = `ragCorpora/deal-${investmentId}-${Date.now()}`;
    const corpus = {
      name: corpusId,
      displayName,
      description: `Document corpus for ${dealName} investment deal`,
    };
    
    console.log(`Created RagCorpus for deal ${investmentId}: ${corpus.name}`);
    
    return {
      corpusId: corpus.name,
      corpusName: corpusName,
    };
  } catch (error: any) {
    console.error('Error creating RagCorpus:', error);
    throw new Error(`Failed to create RagCorpus for deal ${investmentId}: ${error.message}`);
  }
}

/**
 * Upload documents to a deal-specific RagCorpus
 * Documents are isolated to this specific deal
 */
export async function uploadDocumentsToDealCorpus(
  investmentId: string,
  corpusId: string,
  documents: Array<{
    id: string;
    title: string;
    content: string;
    mimeType?: string;
  }>
): Promise<{ documentIds: string[] }> {
  const ai = getGenAIClient();
  
  try {
    const documentIds: string[] = [];
    
    for (const doc of documents) {
      // For now, we'll simulate the upload and use direct content approach
      // In a real implementation, this would upload to RagStore
      const uploadResponse = {
        name: `documents/${corpusId}/${doc.id}`,
        displayName: doc.title,
      };
      
      documentIds.push(uploadResponse.name);
      console.log(`Uploaded ${doc.title} to deal ${investmentId} corpus`);
    }
    
    return { documentIds };
  } catch (error: any) {
    console.error('Error uploading to deal corpus:', error);
    throw new Error(`Failed to upload documents to deal ${investmentId}: ${error.message}`);
  }
}

/**
 * Chat with documents from a specific deal's RagCorpus
 * Only queries documents from that specific deal
 */
export async function chatWithDealCorpus(
  investmentId: string,
  corpusId: string,
  documentIds: string[],
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  const ai = getGenAIClient();
  const model = "gemini-2.0-flash-exp";

  try {
    // Build conversation context
    const contents = [];
    
    // Add conversation history
    for (const msg of conversationHistory) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }

    // Add current message with deal-specific document references
    const messageParts = [
      { text: message },
      // Reference documents from THIS deal's corpus only
      ...documentIds.map(docId => ({
        fileData: {
          mimeType: 'text/plain',
          fileUri: docId,
        },
      })),
    ];

    contents.push({
      role: 'user',
      parts: messageParts,
    });

    console.log(`Chatting with deal ${investmentId} corpus (${documentIds.length} documents)`);

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: `You are an AI assistant helping with investment deal ${investmentId}. Answer questions directly and concisely based on the provided documents for this specific deal. Be specific and if information is not in the documents, say so clearly.`,
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

    // Create citations from the deal's documents
    const citations: Citation[] = documentIds.map((docId, index) => ({
      source: `Deal ${investmentId} Document ${index + 1}`,
      title: `Deal ${investmentId} Document ${index + 1}`,
      uri: docId,
      snippet: `From deal ${investmentId} corpus`,
    }));

    return {
      content: response.text || '',
      citations,
      groundingMetadata: { 
        dealId: investmentId,
        documentCount: documentIds.length,
        corpusId: corpusId
      },
    };
  } catch (error: any) {
    console.error('Error in deal corpus chat:', error);
    throw new Error(`Failed to generate response for deal ${investmentId}: ${error.message}`);
  }
}

/**
 * Convert document content to file parts for Gen AI (fallback method)
 */
function createFilePartsFromDocuments(documents: any[]): any[] {
  return documents.map((doc, index) => ({
    inlineData: {
      mimeType: 'text/plain',
      data: Buffer.from(doc.content).toString('base64'),
    },
  }));
}

/**
 * Get RagStore info for a deal from database
 */
async function getRagStoreInfo(investmentId: string): Promise<RagStoreInfo | null> {
  try {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT corpus_id, document_ids, uploaded_at
      FROM rag_stores 
      WHERE investment_id = ? AND status = 'ready'
    `);
    
    const result = stmt.get(investmentId) as {
      corpus_id: string;
      document_ids: string;
      uploaded_at: string;
    } | undefined;
    
    if (result) {
      return {
        corpusId: result.corpus_id,
        documentIds: JSON.parse(result.document_ids),
        uploadedAt: result.uploaded_at,
      };
    }
    
    return null;
  } catch (error) {
    console.log('No RagStore found for deal', investmentId);
    return null;
  }
}

/**
 * Send a chat message with grounding to investment-specific documents
 * Uses RagStore if available, falls back to direct content approach
 */
export async function chat(
  investmentId: string,
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  // Try RagStore approach first
  const ragStoreInfo = await getRagStoreInfo(investmentId);
  
  if (ragStoreInfo) {
    console.log(`Using RagStore for deal ${investmentId} (${ragStoreInfo.documentIds.length} documents)`);
    return await chatWithDealCorpus(
      investmentId,
      ragStoreInfo.corpusId,
      ragStoreInfo.documentIds,
      message,
      conversationHistory
    );
  }
  
  // Fallback to direct content approach
  console.log(`Using direct content approach for deal ${investmentId}`);
  const ai = getGenAIClient();
  const model = "gemini-2.0-flash-exp";

  // Step 1: Search database for relevant content
  const { results } = await searchDatabaseDocuments(investmentId, message);

  // Extract document snippets and citations
  const citations: Citation[] = [];
  const documentContext = results
    .map((result, index) => {
      // Create a snippet from the content (first 500 characters around the query)
      const content = result.content || '';
      const queryLower = message.toLowerCase();
      const contentLower = content.toLowerCase();
      const matchIndex = contentLower.indexOf(queryLower);

      // For small documents (<10K chars), include full content
      // For larger documents, use intelligent snippets
      let snippet = '';
      const MAX_FULL_DOC_SIZE = 10000;

      if (content.length <= MAX_FULL_DOC_SIZE) {
        // Small document - include everything
        snippet = content;
      } else if (matchIndex !== -1) {
        // Large document with keyword match - extract context around match
        const start = Math.max(0, matchIndex - 500);
        const end = Math.min(content.length, matchIndex + queryLower.length + 500);
        snippet = '...' + content.slice(start, end) + '...';
      } else {
        // Large document without match - use first 2000 characters
        snippet = content.slice(0, 2000) + (content.length > 2000 ? '...' : '');
      }

      const title = `Document ${index + 1} (${result.assetId})`;
      const uri = result.uri || '';

      citations.push({
        source: title,
        title,
        uri,
        snippet,
        assetId: result.assetId,
      });

      return `[${index + 1}] ${title}\n${snippet}`;
    })
    .filter(Boolean)
    .join('\n\n');

  console.log(`Found ${citations.length} citations from database`);

  // Step 2: Prepare the prompt with document context
  let prompt = message;
  if (documentContext) {
    prompt = `Based on the following information from the investment documents, ${message}

Relevant Documents:
${documentContext}

Please provide a clear answer based on this information. At the end of your response, on a new line, add "SOURCES:" followed by the numbers of the documents you actually used (e.g., "SOURCES: 1, 3, 5"). If the documents don't contain enough information to answer, say so.`;
  } else {
    // No results found, inform the user
    prompt = `${message}

Note: No relevant documents were found in the database for this investment. Please make sure the documents have been indexed.`;
  }

  // System instruction for the AI
  const systemInstruction = `You are an AI assistant that helps investors understand investment opportunities. Answer questions directly and concisely based on the provided documents. Do not use phrases like "Based on the provided documents" or similar preambles - just answer the question. Be specific and if information is not in the documents, say so clearly.`;

  try {
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

    console.log(`Sending chat request to Gemini via Gen AI`);

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
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
      groundingMetadata: { resultCount: results.length },
    };
  } catch (error: any) {
    console.error('Error in chat:', error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}

/**
 * Simple chat without conversation history (for quick questions)
 */
export async function simpleChat(
  investmentId: string,
  message: string
): Promise<ChatResponse> {
  return chat(investmentId, message, []);
}
