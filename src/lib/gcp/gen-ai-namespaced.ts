/**
 * Google Gen AI Service - Namespaced for Multiple Deals
 *
 * Each deal gets its own RagCorpus for document isolation
 * Supports multiple deals without document mixing
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
    
    const corpus = await ai.ragCorpora.create({
      displayName,
      description: `Document corpus for ${dealName} investment deal`,
    });
    
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
      // Upload to the specific deal's corpus
      const uploadResponse = await ai.media.upload({
        ragCorpusName: corpusId, // Deal-specific corpus
        file: {
          inlineData: {
            mimeType: doc.mimeType || 'text/plain',
            data: Buffer.from(doc.content).toString('base64'),
          },
        },
        displayName: doc.title,
      });
      
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
 * List all RagCorpora for a project
 * Useful for management and debugging
 */
export async function listDealCorpora(): Promise<Array<{
  name: string;
  displayName: string;
  description: string;
  documentCount: number;
}>> {
  const ai = getGenAIClient();
  
  try {
    const corpora = await ai.ragCorpora.list();
    
    return corpora.map(corpus => ({
      name: corpus.name,
      displayName: corpus.displayName,
      description: corpus.description,
      documentCount: corpus.documentCount || 0,
    }));
  } catch (error: any) {
    console.error('Error listing corpora:', error);
    throw new Error(`Failed to list deal corpora: ${error.message}`);
  }
}

/**
 * Delete a deal's RagCorpus (cleanup)
 * Use when a deal is closed or no longer needed
 */
export async function deleteDealCorpus(corpusId: string): Promise<void> {
  const ai = getGenAIClient();
  
  try {
    await ai.ragCorpora.delete({ name: corpusId });
    console.log(`Deleted RagCorpus: ${corpusId}`);
  } catch (error: any) {
    console.error('Error deleting corpus:', error);
    throw new Error(`Failed to delete corpus ${corpusId}: ${error.message}`);
  }
}

/**
 * Fallback: Chat with direct content (current approach)
 * Use this if RagCorpus is not available
 */
export async function chatWithDirectContent(
  investmentId: string,
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  const ai = getGenAIClient();
  const model = "gemini-2.0-flash-exp";

  // Search database for documents from THIS specific deal only
  const { results } = await searchDatabaseDocuments(investmentId, message);

  // Build document context
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

      return `[${index + 1}] ${result.assetId}\n${snippet}`;
    })
    .filter(Boolean)
    .join('\n\n');

  const prompt = documentContext 
    ? `Based on the following documents for deal ${investmentId}, ${message}\n\nDocuments:\n${documentContext}`
    : `${message}\n\nNote: No documents found for deal ${investmentId}.`;

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
        systemInstruction: `You are an AI assistant helping with investment deal ${investmentId}. Answer questions based on the provided documents for this specific deal only.`,
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.2,
          topP: 0.8,
        },
      }
    });

    const citations: Citation[] = results.map((result, index) => ({
      source: `Deal ${investmentId} Document ${index + 1}`,
      title: result.assetId,
      uri: result.uri,
      snippet: result.content.slice(0, 200),
    }));

    return {
      content: response.text || '',
      citations,
      groundingMetadata: { 
        dealId: investmentId,
        resultCount: results.length 
      },
    };
  } catch (error: any) {
    console.error('Error in chat:', error);
    throw new Error(`Failed to generate response for deal ${investmentId}: ${error.message}`);
  }
}

/**
 * Search database for documents from a specific deal
 */
async function searchDatabaseDocuments(
  investmentId: string,
  query: string
): Promise<{ results: any[]; summary: string }> {
  console.log(`Searching database for deal ${investmentId} with query: "${query}"`);

  try {
    const documents = searchDocuments(investmentId, query);
    console.log(`Found ${documents.length} documents for deal ${investmentId}`);

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
    throw new Error(`Failed to search documents for deal ${investmentId}: ${error.message}`);
  }
}
