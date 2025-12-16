/**
 * Cloudflare Pages Function - List Available AI Models
 * Returns the list of available Workers AI models
 *
 * Endpoint: GET /api/ai/models
 */

export const onRequestGet: PagesFunction = async () => {
  const models = [
    // Budget tier
    {
      id: 'llama-3.2-1b',
      name: 'Llama 3.2 1B',
      name_ar: 'لاما 3.2 1B',
      description: 'Cheapest option, simple tasks only',
      description_ar: 'الخيار الأرخص، للمهام البسيطة فقط',
      provider: 'Meta',
      tier: 'budget',
      pricing: { input: 0.027, output: 0.201 },
      recommended: false,
    },
    {
      id: 'llama-3.2-3b',
      name: 'Llama 3.2 3B',
      name_ar: 'لاما 3.2 3B',
      description: 'Budget-friendly for light tasks',
      description_ar: 'اقتصادي للمهام الخفيفة',
      provider: 'Meta',
      tier: 'budget',
      pricing: { input: 0.051, output: 0.335 },
      recommended: false,
    },
    // Best value tier
    {
      id: 'llama-3.1-8b',
      name: 'Llama 3.1 8B',
      name_ar: 'لاما 3.1 8B',
      description: 'Best value - fast and capable',
      description_ar: 'أفضل قيمة - سريع وقادر',
      provider: 'Meta',
      tier: 'value',
      pricing: { input: 0.152, output: 0.287 },
      recommended: true,
    },
    {
      id: 'mistral-7b',
      name: 'Mistral 7B',
      name_ar: 'ميسترال 7B',
      description: 'Great balance of cost and quality',
      description_ar: 'توازن ممتاز بين التكلفة والجودة',
      provider: 'Mistral AI',
      tier: 'value',
      pricing: { input: 0.11, output: 0.19 },
      recommended: false,
    },
    // Premium tier
    {
      id: 'deepseek-r1-32b',
      name: 'DeepSeek R1 32B',
      name_ar: 'ديب سيك R1 32B',
      description: 'Best for reasoning, math, and code',
      description_ar: 'الأفضل للاستدلال والرياضيات والبرمجة',
      provider: 'DeepSeek',
      tier: 'premium',
      pricing: { input: 0.497, output: 4.881 },
      recommended: false,
    },
    {
      id: 'deepseek-coder',
      name: 'DeepSeek Coder 6.7B',
      name_ar: 'ديب سيك كودر 6.7B',
      description: 'Specialized for code generation',
      description_ar: 'متخصص في توليد الكود',
      provider: 'DeepSeek',
      tier: 'value',
      pricing: { input: 0.1, output: 0.2 },
      recommended: false,
    },
    {
      id: 'llama-3.3-70b',
      name: 'Llama 3.3 70B',
      name_ar: 'لاما 3.3 70B',
      description: 'Highest quality responses',
      description_ar: 'أعلى جودة للاستجابات',
      provider: 'Meta',
      tier: 'premium',
      pricing: { input: 0.293, output: 2.253 },
      recommended: false,
    },
    // Multilingual
    {
      id: 'qwen-1.5-7b',
      name: 'Qwen 1.5 7B',
      name_ar: 'كوين 1.5 7B',
      description: 'Best Arabic language support',
      description_ar: 'أفضل دعم للغة العربية',
      provider: 'Alibaba',
      tier: 'value',
      pricing: { input: 0.1, output: 0.2 },
      recommended: false,
    },
  ];

  return new Response(
    JSON.stringify({
      success: true,
      models,
      default: 'llama-3.1-8b',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    }
  );
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
