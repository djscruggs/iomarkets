/**
 * Google Cloud Vertex AI Service
 *
 * Handles chat interactions with Gemini using grounded search via Discovery Engine
 */

import { VertexAI, HarmCategory, HarmBlockThreshold } from '@google-cloud/vertexai';
import { getGCPConfig } from './config.js';
import { searchDocuments } from '../queries-rag.js';

let vertexAI: VertexAI | null = null;

/**
 * Get or create Vertex AI client
 */
function getVertexAIClient(): VertexAI {
  if (!vertexAI) {
    const config = getGCPConfig();
    vertexAI = new VertexAI({
      project: config.projectId,
      location: config.region,
    });
  }
  return vertexAI;
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
 * Send a chat message with grounding to investment-specific Data Store
 */
export async function chat(
  investmentId: string,
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  const client = getVertexAIClient();
  const config = getGCPConfig();

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
      });

      return `[${index + 1}] ${title}\n${snippet}`;
    })
    .filter(Boolean)
    .join('\n\n');

  console.log(`Found ${citations.length} citations from database`);

  // Step 2: If we have search results, use them as context for Gemini
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

  // Configure the model
  const generativeModel = client.preview.getGenerativeModel({
    model: config.geminiModelName,
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.2,
      topP: 0.8,
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
    systemInstruction: {
      parts: [
        {
          text: 'You are an AI assistant that helps investors understand investment opportunities. Answer questions directly and concisely based on the provided documents. Do not use phrases like "Based on the provided documents" or similar preambles - just answer the question. Be specific and if information is not in the documents, say so clearly.',
        },
      ],
    },
  });

  // Build conversation context
  const contents = conversationHistory.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  // Add current message with context
  contents.push({
    role: 'user',
    parts: [{ text: prompt }],
  });

  console.log(`Sending chat request to Gemini`);

  try {
    const result = await generativeModel.generateContent({
      contents,
    });

    const response = result.response;
    let text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

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
