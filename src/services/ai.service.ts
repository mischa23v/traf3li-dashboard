/**
 * AI Service - Frontend client for Cloudflare Workers AI
 *
 * This service calls the Cloudflare Pages Functions endpoints
 * for AI capabilities powered by Workers AI
 */

import api from '@/lib/api';

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
  try {
    const response = await api.post(`${AI_BASE}/chat`, request);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send chat message');
  }
}

/**
 * Get CSRF token from cookies
 */
function getCsrfToken(): string {
  const cookies = document.cookie;
  const match = cookies.match(/csrf-token=([^;]+)/);
  if (match && match[1]) {
    return match[1];
  }
  const xsrfMatch = cookies.match(/XSRF-TOKEN=([^;]+)/);
  if (xsrfMatch && xsrfMatch[1]) {
    return xsrfMatch[1];
  }
  return '';
}

/**
 * Send a chat message with streaming response
 */
export async function* streamChatMessage(
  request: Omit<ChatRequest, 'stream'>
): AsyncGenerator<string, void, unknown> {
  const csrfToken = getCsrfToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add CSRF token for POST request (CSRF protection)
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const response = await fetch(`${AI_BASE}/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...request, stream: true }),
    credentials: 'include', // Include cookies for session/auth
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
  try {
    const response = await api.post(`${AI_BASE}/summarize`, request);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to summarize text');
  }
}

/**
 * Get available AI models
 */
export async function getAvailableModels(): Promise<ModelsResponse> {
  try {
    const response = await api.get(`${AI_BASE}/models`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch models');
  }
}

/**
 * React Query hooks helpers
 */
export const aiQueryKeys = {
  models: ['ai', 'models'] as const,
  chat: (conversationId: string) => ['ai', 'chat', conversationId] as const,
};
