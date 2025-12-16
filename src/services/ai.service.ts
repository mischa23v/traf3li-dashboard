/**
 * AI Service - Frontend client for Cloudflare Workers AI
 *
 * This service calls the Cloudflare Pages Functions endpoints
 * for AI capabilities powered by Workers AI
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  stream?: boolean;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  model: string;
}

export interface SummarizeRequest {
  text: string;
  language?: 'ar' | 'en' | 'auto';
  maxLength?: number;
}

export interface SummarizeResponse {
  success: boolean;
  summary: string;
  language: 'ar' | 'en';
  originalLength: number;
}

export interface AIModel {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  provider: string;
  recommended: boolean;
}

export interface ModelsResponse {
  success: boolean;
  models: AIModel[];
  default: string;
}

// Base URL for AI endpoints (relative, uses same origin)
const AI_BASE = '/api/ai';

/**
 * Send a chat message to the AI
 */
export async function sendChatMessage(
  request: ChatRequest
): Promise<ChatResponse> {
  const response = await fetch(`${AI_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send chat message');
  }

  return response.json();
}

/**
 * Send a chat message with streaming response
 */
export async function* streamChatMessage(
  request: Omit<ChatRequest, 'stream'>
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(`${AI_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, stream: true }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send chat message');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Parse SSE events
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          if (parsed.response) {
            yield parsed.response;
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}

/**
 * Summarize text using AI
 */
export async function summarizeText(
  request: SummarizeRequest
): Promise<SummarizeResponse> {
  const response = await fetch(`${AI_BASE}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to summarize text');
  }

  return response.json();
}

/**
 * Get available AI models
 */
export async function getAvailableModels(): Promise<ModelsResponse> {
  const response = await fetch(`${AI_BASE}/models`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch models');
  }

  return response.json();
}

/**
 * React Query hooks helpers
 */
export const aiQueryKeys = {
  models: ['ai', 'models'] as const,
  chat: (conversationId: string) => ['ai', 'chat', conversationId] as const,
};
