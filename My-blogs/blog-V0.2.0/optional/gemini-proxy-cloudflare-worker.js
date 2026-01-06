/** Cloudflare Worker: Gemini proxy (optional) */
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('POST only', { status: 405 });
    const url = new URL(request.url);
    const model = url.searchParams.get('model') || 'models/gemini-2.0-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
    const body = await request.text();
    const r = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body });
    return new Response(await r.text(), { status: r.status, headers: { 'Content-Type':'application/json; charset=utf-8', 'Access-Control-Allow-Origin':'*' } });
  }
}
