/**
 * Google Cloud Vertex AI Service
 *
 * Handles chat interactions with Gemini using grounded search via Discovery Engine
 */

import { VertexAI, HarmCategory, HarmBlockThreshold } from '@google-cloud/vertexai';
import { SearchServiceClient } from '@google-cloud/discoveryengine';
import { getGCPConfig, getDataStoreId } from './config.js';

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
 * Search Discovery Engine Data Store for relevant documents
 */
async function searchDataStore(
  dataStoreId: string,
  query: string
): Promise<{ results: any[]; summary: string }> {
  const config = getGCPConfig();
  const searchClient = new SearchServiceClient({
    keyFilename: config.credentials,
  });

  const servingConfig = `projects/${config.projectId}/locations/global/collections/default_collection/dataStores/${dataStoreId}/servingConfigs/default_config`;

  console.log(`Searching Data Store: ${dataStoreId} for query: "${query}"`);

  try {
    const [response] = await searchClient.search({
      servingConfig,
      query,
      pageSize: 5,
      contentSearchSpec: {
        snippetSpec: {
          returnSnippet: true,
        },
      },
    });

    const results = response.results || [];
    const summary = response.summary?.summaryText || '';

    console.log(`Found ${results.length} results`);

    return { results, summary };
  } catch (error: any) {
    console.error('Error searching Data Store:', error);
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
  const dataStoreId = getDataStoreId(investmentId);

  // Step 1: Search Discovery Engine for relevant content
  const { results, summary } = await searchDataStore(dataStoreId, message);

  // Extract document snippets and citations
  const citations: Citation[] = [];
  const documentContext = results
    .map((result, index) => {
      const doc = result.document;
      const snippet = doc?.derivedStructData?.snippets?.[0]?.snippet || '';
      const title = doc?.derivedStructData?.title || `Document ${index + 1}`;
      const uri = doc?.derivedStructData?.link || '';

      if (snippet) {
        citations.push({
          source: title,
          title,
          uri,
          snippet,
        });
        return `[${index + 1}] ${title}\n${snippet}`;
      }
      return '';
    })
    .filter(Boolean)
    .join('\n\n');

  console.log(`Found ${citations.length} citations`);

  // Step 2: If we have search results, use them as context for Gemini
  let prompt = message;
  if (documentContext) {
    prompt = `Based on the following information from the investment documents, ${message}

Relevant Documents:
${documentContext}

${summary ? `Summary: ${summary}\n\n` : ''}Please provide a clear answer based on this information. If the documents don't contain enough information to answer, say so.`;
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
          text: 'You are an AI assistant that helps investors understand investment opportunities. Answer questions based on the provided documents. Be specific and cite information from the documents. If information is not in the documents, say so clearly.',
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
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      content: text,
      citations,
      groundingMetadata: { summary, resultCount: results.length },
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
