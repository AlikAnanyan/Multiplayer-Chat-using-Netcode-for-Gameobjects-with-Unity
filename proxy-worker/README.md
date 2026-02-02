Cloudflare Worker proxy for CoolterUB

This Cloudflare Worker fetches remote pages, removes scripts and restrictive meta tags, rewrites links to route back through the worker, and returns sanitized HTML that can be embedded in an iframe.

Why use Cloudflare Workers?
- Free tier available with generous limits for small projects
- Fast global edge performance
- No need to run or pay for a server

Quick deploy (manual)
1. Install Wrangler: `npm install -g wrangler` (or use `pnpm`/`yarn`).
2. Authenticate: `wrangler login` and follow prompts.
3. Edit `wrangler.toml` and set your `account_id`.
4. Optional: set a secret API key so the worker requires it:
   - `wrangler secret put WORKER_API_KEY` and enter a value.
5. Publish: `wrangler publish`.
6. After publishing you will have a URL like `https://<name>.<your-subdomain>.workers.dev/fetch?url=<encoded>`.

Using the worker with the site
- Set `window.COOLTERUB_PROXY_BASE` in your site to point to the worker's base URL, e.g.:

  window.COOLTERUB_PROXY_BASE = 'https://coolterub-proxy-worker.<your-subdomain>.workers.dev/fetch';

- You can also enable API key by sending `x-api-key` header or `api_key` query param.

Security & notes
- This worker removes scripts and some meta tags, but full sanitization hardening is your responsibility.
- Use Cloudflare firewall rules and Workers KV/Durable Objects for advanced rate-limiting if you expect heavy use.
- Do not use the proxy to evade monitoring, abuse, or violate target site terms of service.
