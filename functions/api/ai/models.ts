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
      description: 'Fast and capable model for all tasks',
      description_ar: 'نموذج سريع وقادر لجميع المهام',
      provider: 'Meta',
      pricing: { input: 0.152, output: 0.287 },
      active: true,
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
        'Cache-Control': 'public, max-age=3600',
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
