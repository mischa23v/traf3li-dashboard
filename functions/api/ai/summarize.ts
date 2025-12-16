/**
 * Cloudflare Pages Function - Document Summarization
 * Uses Workers AI to summarize text content
 *
 * Endpoint: POST /api/ai/summarize
 */

interface Env {
  AI: Ai;
}

interface SummarizeRequest {
  text: string;
  language?: 'ar' | 'en' | 'auto';
  maxLength?: number;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = (await request.json()) as SummarizeRequest;
    const { text, language = 'auto', maxLength = 200 } = body;

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({
          error: 'Text is required',
          error_ar: 'النص مطلوب',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Detect language or use provided
    const isArabic =
      language === 'ar' ||
      (language === 'auto' && /[\u0600-\u06FF]/.test(text));

    const systemPrompt = isArabic
      ? `أنت مساعد متخصص في تلخيص النصوص. قم بتلخيص النص التالي بشكل موجز ودقيق في ${maxLength} كلمة أو أقل. حافظ على المعلومات الأساسية.`
      : `You are a text summarization assistant. Summarize the following text concisely and accurately in ${maxLength} words or less. Preserve key information.`;

    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
    });

    return new Response(
      JSON.stringify({
        success: true,
        summary: (response as { response: string }).response,
        language: isArabic ? 'ar' : 'en',
        originalLength: text.length,
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Summarize Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to summarize text',
        error_ar: 'فشل في تلخيص النص',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
