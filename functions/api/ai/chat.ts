/**
 * Cloudflare Pages Function - AI Chat Endpoint
 * Uses Workers AI to provide AI chat capabilities
 *
 * Endpoint: POST /api/ai/chat
 */

interface Env {
  AI: Ai;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  stream?: boolean;
}

// Model configuration - using Llama 3.1 8B for all requests
const MODEL_ID = '@cf/meta/llama-3.1-8b-instruct';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = (await request.json()) as ChatRequest;
    const { messages, stream = false } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Messages array is required',
          error_ar: 'مصفوفة الرسائل مطلوبة',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Add system prompt for Arabic/English bilingual support
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are a helpful AI assistant for Traf3li, a legal and business management platform.
You can respond in both Arabic and English. If the user writes in Arabic, respond in Arabic.
If they write in English, respond in English.
Be concise, professional, and helpful.

أنت مساعد ذكاء اصطناعي مفيد لمنصة ترافيلي للإدارة القانونية والأعمال.
يمكنك الرد باللغتين العربية والإنجليزية. إذا كتب المستخدم بالعربية، أجب بالعربية.`,
    };

    // Prepend system message if not already present
    const fullMessages =
      messages[0]?.role === 'system' ? messages : [systemMessage, ...messages];

    if (stream) {
      // Streaming response
      const response = await env.AI.run(MODEL_ID, {
        messages: fullMessages,
        stream: true,
      });

      return new Response(response as ReadableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          ...corsHeaders,
        },
      });
    } else {
      // Non-streaming response
      const response = await env.AI.run(MODEL_ID, {
        messages: fullMessages,
      });

      return new Response(
        JSON.stringify({
          success: true,
          response: (response as { response: string }).response,
          model: 'llama-3.1-8b',
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }
  } catch (error) {
    console.error('AI Chat Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process AI request',
        error_ar: 'فشل في معالجة طلب الذكاء الاصطناعي',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

// Handle CORS preflight
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
