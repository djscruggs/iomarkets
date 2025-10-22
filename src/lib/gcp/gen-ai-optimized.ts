/**
 * Google Gen AI Service - Optimized with RagStore
 *
 * Uploads documents once to RagStore and references them by ID
 * Much more efficient than uploading content with every query
 */

import { GoogleGenAI } from "@google/genai";
import { searchDocuments } from '../queries-rag.js';

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
 * Upload documents to RagStore (one-time operation)
 * This should be called when indexing documents for an investment
 */
export async function uploadDocumentsToRagStore(
  investmentId: string,
  documents: Array<{
    id: string;
    title: string;
    content: string;
    mimeType?: string;
  }>
): Promise<{ ragStoreId: string; documentIds: string[] }> {
  const ai = getGenAIClient();
  
  try {
    // Create a RagStore for this investment
    const ragStoreName = `ragStores/investment-${investmentId}`;
    
    // Upload each document to the RagStore
    const documentIds: string[] = [];
    
    for (const doc of documents) {
      const uploadResponse = await ai.media.upload({
        ragStoreName,
        file: {
          inlineData: {
            mimeType: doc.mimeType || 'text/plain',
            data: Buffer.from(doc.content).toString('base64'),
          },
        },
        displayName: doc.title,
      });
      
      documentIds.push(uploadResponse.name);
      console.log(`Uploaded document ${doc.title} to RagStore`);
    }
    
    return {
      ragStoreId: ragStoreName,
      documentIds,
    };
  } catch (error: any) {
    console.error('Error uploading to RagStore:', error);
    throw new Error(`Failed to upload documents: ${error.message}`);
  }
}

/**
 * Chat with documents using RagStore references
 * Much more efficient than uploading content each time
 */
export async function chatWithRagStore(
  investmentId: string,
  message: string,
  ragStoreId: string,
  documentIds: string[],
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

    // Add current message with RagStore document references
    const messageParts = [
      { text: message },
      // Reference documents by their RagStore IDs
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

    console.log(`Sending chat request with ${documentIds.length} RagStore documents`);

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

    // Create citations from the referenced documents
    const citations: Citation[] = documentIds.map((docId, index) => ({
      source: `Document ${index + 1}`,
      title: `Document ${index + 1}`,
      uri: docId,
      snippet: `Referenced from RagStore`,
    }));

    return {
      content: response.text || '',
      citations,
      groundingMetadata: { documentCount: documentIds.length },
    };
  } catch (error: any) {
    console.error('Error in chat with RagStore:', error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}

/**
 * Fallback method: Chat with direct document content (current approach)
 * Use this if RagStore is not available or for testing
 */
export async function chatWithDirectContent(
  investmentId: string,
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  const ai = getGenAIClient();
  const model = "gemini-2.0-flash-exp";

  // Step 1: Search database for relevant content
  const { results } = await searchDatabaseDocuments(investmentId, message);

  // Extract document snippets and citations
  const citations: Citation[] = [];
  const documentContext = results
    .map((result, index) => {
      const content = result.content || '';
      const queryLower = message.toLowerCase();
      const contentLower = content.toLowerCase();
      const matchIndex = contentLower.indexOf(queryLower);

      let snippet = '';
      const MAX_FULL_DOC_SIZE = 10000;

      if (content.length <= MAX_FULL_DOC_SIZE) {
        snippet = content;
      } else if (matchIndex !== -1) {
        const start = Math.max(0, matchIndex - 500);
        const end = Math.min(content.length, matchIndex + queryLower.length + 500);
        snippet = '...' + content.slice(start, end) + '...';
      } else {
        snippet = content.slice(0, 2000) + (content.length > 2000 ? '...' : '');
      }

      const title = `Document ${index + 1} (${result.assetId})`;

      citations.push({
        source: title,
        title,
        uri: result.uri,
        snippet,
        assetId: result.assetId,
      });

      return `[${index + 1}] ${title}\n${snippet}`;
    })
    .filter(Boolean)
    .join('\n\n');

  // Step 2: Prepare the prompt with document context
  let prompt = message;
  if (documentContext) {
    prompt = `Based on the following information from the investment documents, ${message}

Relevant Documents:
${documentContext}

Please provide a clear answer based on this information.`;
  } else {
    prompt = `${message}

Note: No relevant documents were found in the database for this investment. Please make sure the documents have been indexed.`;
  }

  try {
    const contents = [];
    
    for (const msg of conversationHistory) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

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

    return {
      content: response.text || '',
      citations,
      groundingMetadata: { resultCount: results.length },
    };
  } catch (error: any) {
    console.error('Error in chat:', error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}

/**
 * Search database for relevant documents (helper function)
 */
async function searchDatabaseDocuments(
  investmentId: string,
  query: string
): Promise<{ results: any[]; summary: string }> {
  console.log(`Searching database for investment ${investmentId} with query: "${query}"`);

  try {
    const documents = searchDocuments(investmentId, query);
    console.log(`Found ${documents.length} matching documents`);

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
