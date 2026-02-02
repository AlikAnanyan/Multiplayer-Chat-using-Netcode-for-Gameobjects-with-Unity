CoolterUB Proxy Server

This simple Node.js proxy fetches remote pages and sanitizes HTML to make it embeddable in an iframe for the CoolterUB viewer.

Security & usage notes
- This proxy rewrites links to route through `/fetch?url=` and removes scripts and inline JS. It does NOT guarantee perfect sanitization—review before public deployment.
- By default it accepts requests without an API key. To enable API key protection set `PROXY_API_KEY` in environment variables and require `x-api-key` header or `api_key` query param.
- Rate-limiting is enabled by default; adjust according to your needs.

Local testing
1. cd proxy-server
2. cp .env.example .env and edit PROXY_API_KEY or leave blank
3. npm install
4. npm start
5. Visit: http://localhost:3000/fetch?url=https%3A%2F%2Fexample.com

Deployment
- Render: create a new Web Service pointing to this folder, set Node env and `PORT` (Render sets automatically), and add `PROXY_API_KEY` as a secret.
- Vercel: you can convert `server.js` to a serverless handler or deploy using a compatible platform.

Responsibility
- You are responsible for hosting and operating this proxy, ensuring compliance with target site Terms of Service, and preventing abuse. Do not use it to evade monitoring or violate policies.
