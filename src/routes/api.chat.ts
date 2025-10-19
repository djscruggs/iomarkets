/**
 * Chat API Route
 *
 * POST /api/chat
 * Body: { investmentId: string, message: string, history?: Message[] }
 * Returns: { response: string, citations: Citation[] }
 */

import type { Route } from "./+types/api.chat";
import { chat, type ChatMessage, type ChatResponse } from '../lib/gcp/vertex-ai.js';
import { getDataStoreInfo } from '../lib/queries-rag.js';
import { getInvestmentById } from '../lib/queries.js';

export async function action({ request }: Route.ActionArgs) {
  try {
    const body = await request.json();
    const { investmentId, message, history = [] } = body;

    // Validate inputs
    if (!investmentId) {
      return Response.json(
        { error: 'Investment ID is required' },
        { status: 400 }
      );
    }

    if (!message || message.trim() === '') {
      return Response.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check investment exists
    const investment = getInvestmentById(investmentId);
    if (!investment) {
      return Response.json(
        { error: 'Investment not found' },
        { status: 404 }
      );
    }

    // Check if documents are indexed
    const dataStore = getDataStoreInfo(investmentId);
    if (!dataStore || dataStore.status !== 'ready') {
      return Response.json(
        {
          error: 'Documents are not indexed yet',
          status: dataStore?.status || 'not_indexed',
          message: dataStore?.status === 'indexing'
            ? 'Documents are currently being indexed. Please try again in a few minutes.'
            : dataStore?.status === 'error'
            ? `Indexing failed: ${dataStore.errorMessage}`
            : 'Please index the documents first using the indexing script.'
        },
        { status: 503 } // Service Unavailable
      );
    }

    // Convert history to the format expected by chat function
    const chatHistory: ChatMessage[] = history.map((msg: any) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Call Gemini with grounding
    const response: ChatResponse = await chat(investmentId, message, chatHistory);

    return Response.json({
      response: response.content,
      citations: response.citations,
      groundingMetadata: response.groundingMetadata,
    });

  } catch (error: any) {
    console.error('Chat API error:', error);

    return Response.json(
      {
        error: 'Failed to process chat request',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS preflight
export async function loader() {
  return Response.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
