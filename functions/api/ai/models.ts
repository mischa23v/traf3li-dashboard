/**
 * Cloudflare Pages Function - List Available AI Models
 * Returns the list of available Workers AI models
 *
 * Endpoint: GET /api/ai/models
 */

export const onRequestGet: PagesFunction = async () => {
  const models = [
    {
      id: 'llama-3.1-8b',
      name: 'Llama 3.1 8B',
      name_ar: 'لاما 3.1 8B',
      description: 'Fast, balanced model for general tasks',
      description_ar: 'نموذج سريع ومتوازن للمهام العامة',
      provider: 'Meta',
      recommended: true,
    },
    {
      id: 'llama-3.2-3b',
      name: 'Llama 3.2 3B',
      name_ar: 'لاما 3.2 3B',
      description: 'Lightweight model, fastest responses',
      description_ar: 'نموذج خفيف، أسرع الاستجابات',
      provider: 'Meta',
      recommended: false,
    },
    {
      id: 'llama-3.3-70b',
      name: 'Llama 3.3 70B',
      name_ar: 'لاما 3.3 70B',
      description: 'Most capable model for complex tasks',
      description_ar: 'النموذج الأكثر قدرة للمهام المعقدة',
      provider: 'Meta',
      recommended: false,
    },
    {
      id: 'mistral-7b',
      name: 'Mistral 7B',
      name_ar: 'ميسترال 7B',
      description: 'European model with strong reasoning',
      description_ar: 'نموذج أوروبي مع استدلال قوي',
      provider: 'Mistral AI',
      recommended: false,
    },
    {
      id: 'qwen-1.5-7b',
      name: 'Qwen 1.5 7B',
      name_ar: 'كوين 1.5 7B',
      description: 'Multilingual model with good Arabic support',
      description_ar: 'نموذج متعدد اللغات مع دعم جيد للعربية',
      provider: 'Alibaba',
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
