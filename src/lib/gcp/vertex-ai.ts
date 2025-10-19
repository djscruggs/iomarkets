/**
 * Google Cloud Vertex AI Service
 *
 * Handles chat interactions with Gemini using grounded search
 */

import { VertexAI, HarmCategory, HarmBlockThreshold } from '@google-cloud/vertexai';
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

  // Configure the model with grounding
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
  });

  // Build conversation context
  const contents = conversationHistory.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  // Add current message
  contents.push({
    role: 'user',
    parts: [{ text: message }],
  });

  // Configure grounding with the Data Store
  const tools = [
    {
      googleSearchRetrieval: {
        dataStore: `projects/${config.projectId}/locations/global/collections/default_collection/dataStores/${dataStoreId}`,
      },
    },
  ];

  console.log(`Sending chat request to Gemini with grounding to Data Store: ${dataStoreId}`);

  try {
    const result = await generativeModel.generateContent({
      contents,
      tools,
    });

    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract citations from grounding metadata
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const citations: Citation[] = [];

    if (groundingMetadata?.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        citations.push({
          source: chunk.web?.title || chunk.retrievedContext?.title || 'Document',
          title: chunk.web?.title || chunk.retrievedContext?.title,
          uri: chunk.web?.uri || chunk.retrievedContext?.uri,
          snippet: chunk.retrievedContext?.text,
        });
      }
    }

    return {
      content: text,
      citations,
      groundingMetadata,
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
