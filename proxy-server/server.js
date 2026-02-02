require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cheerio = require('cheerio');

const app = express();
app.use(helmet());

// Basic rate limiting
app.use(rateLimit({ windowMs: 60 * 1000, max: 60 }));

const API_KEY = process.env.PROXY_API_KEY || '';
const PORT = process.env.PORT || 3000;

function sanitizeHtml(html, baseUrl){
  const $ = cheerio.load(html);
  // Remove scripts and inline JS
  $('script').remove();
  $('[onload]').removeAttr('onload');
  $('[onclick]').removeAttr('onclick');
  // Rewrite relative links so they go through the proxy
  $('a[href]').each((i, el)=>{
    const href = $(el).attr('href');
    try{
      const absolute = new URL(href, baseUrl).toString();
      $(el).attr('href', '/fetch?url=' + encodeURIComponent(absolute));
      $(el).attr('target','_self');
    }catch(e){
      // ignore bad urls
    }
  });
  // Remove CSP/meta tags that could block embedding
  $('meta[http-equiv="Content-Security-Policy"]').remove();
  $('meta[http-equiv="X-Frame-Options"]').remove();
  // Basic style to keep things legible
  $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1">');
  return $.html();
}

function checkApiKey(req,res){
  if (!API_KEY) return true; // no key required
  const provided = req.get('x-api-key') || req.query.api_key || '';
  return provided === API_KEY;
}

app.get('/fetch', async (req, res) => {
  if (!checkApiKey(req,res)) return res.status(401).send('Missing or invalid API key');
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing url param');
  try{
    // Only allow http/https
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return res.status(400).send('Invalid protocol');
  }catch(e){
    return res.status(400).send('Invalid URL');
  }

  try{
    const r = await fetch(url, {redirect: 'follow', timeout: 10000, headers: {'User-Agent': 'CoolterUB-Proxy/1.0'}});
    let body = await r.text();
    // Remove dangerous headers when responding
    const sanitized = sanitizeHtml(body, url);
    res.set('Content-Security-Policy','');
    res.set('X-Frame-Options','');
    res.send(sanitized);
  }catch(err){
    res.status(502).send('Failed to fetch target: ' + String(err));
  }
});

app.get('/', (req,res)=>{
  res.send('CoolterUB proxy server. Use /fetch?url=...');
});

app.listen(PORT, ()=>console.log('Proxy listening on', PORT));