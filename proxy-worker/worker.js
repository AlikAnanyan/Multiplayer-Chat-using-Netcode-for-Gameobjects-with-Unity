export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const target = url.searchParams.get('url');
      if (!target) return new Response('Missing url parameter', { status: 400 });

      // Optional API key protection via Wrangler secret binding: WORKER_API_KEY
      const provided = request.headers.get('x-api-key') || url.searchParams.get('api_key') || '';
      const required = env.WORKER_API_KEY || '';
      if (required && provided !== required) {
        return new Response('Missing or invalid API key', { status: 401 });
      }

      // Validate protocol
      let parsed;
      try { parsed = new URL(target); }
      catch (e) { return new Response('Invalid target URL', { status: 400 }); }
      if (!['http:', 'https:'].includes(parsed.protocol)) return new Response('Unsupported protocol', { status: 400 });

      // Fetch target
      const resp = await fetch(target, { redirect: 'follow', headers: { 'User-Agent': 'CoolterUB-Worker/1.0' } });

      // If not HTML, simply passthrough
      const contentType = resp.headers.get('content-type') || '';
      const headers = new Headers(resp.headers);
      headers.delete('content-security-policy');
      headers.delete('x-frame-options');
      headers.set('x-embedded-by', 'CoolterUB-Worker');
      headers.set('access-control-allow-origin', '*');

      if (!contentType.includes('text/html')) {
        // return as-is for images/js/css etc (CORS header set above)
        return new Response(resp.body, { status: resp.status, headers });
      }

      // HTML: rewrite and sanitize via HTMLRewriter
      class RemoveScripts {
        element(el) { el.remove(); }
      }
      class RemoveMeta {
        element(el) { el.remove(); }
      }
      class RewriteAnchors {
        constructor(base) { this.base = base; }
        element(el) {
          const href = el.getAttribute('href');
          if (!href) return;
          try {
            const abs = new URL(href, this.base).toString();
            el.setAttribute('href', '/fetch?url=' + encodeURIComponent(abs));
            el.setAttribute('target', '_self');
          } catch (e) {}
        }
      }

      const transformed = new HTMLRewriter()
        .on('script', new RemoveScripts())
        .on('meta[http-equiv="Content-Security-Policy"]', new RemoveMeta())
        .on('meta[http-equiv="X-Frame-Options"]', new RemoveMeta())
        .on('a[href]', new RewriteAnchors(target))
        .transform(resp);

      // Return transformed response and ensure frame-allowing headers are absent
      const outHeaders = new Headers(headers);
      outHeaders.delete('content-security-policy');
      outHeaders.delete('x-frame-options');
      outHeaders.set('content-type', 'text/html; charset=utf-8');
      return new Response(transformed.body, { status: resp.status, headers: outHeaders });

    } catch (err) {
      return new Response('Proxy error: ' + String(err), { status: 502 });
    }
  }
};