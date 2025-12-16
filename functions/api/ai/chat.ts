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

// Available models on Workers AI
const MODELS = {
  // Meta Llama models (recommended)
  'llama-3.1-8b': '@cf/meta/llama-3.1-8b-instruct',
  'llama-3.2-3b': '@cf/meta/llama-3.2-3b-instruct',
  'llama-3.3-70b': '@cf/meta/llama-3.3-70b-instruct-fp8-fast',

  // Mistral models
  'mistral-7b': '@cf/mistral/mistral-7b-instruct-v0.1',

  // Qwen models
  'qwen-1.5-7b': '@cf/qwen/qwen1.5-7b-chat-awq',

  // Default
  default: '@cf/meta/llama-3.1-8b-instruct',
} as const;

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
    const { messages, model = 'default', stream = false } = body;

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

    // Get the model ID
    const modelId = MODELS[model as keyof typeof MODELS] || MODELS.default;

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
      const response = await env.AI.run(modelId, {
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
      const response = await env.AI.run(modelId, {
        messages: fullMessages,
      });

      return new Response(
        JSON.stringify({
          success: true,
          response: (response as { response: string }).response,
          model: modelId,
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
