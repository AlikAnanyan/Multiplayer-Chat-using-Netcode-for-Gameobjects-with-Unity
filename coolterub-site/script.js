// Handle opening results in a new tab when checkbox is checked
const form = document.getElementById('searchForm');
const openInNewTab = document.getElementById('openInNewTab');
const resultsEl = document.getElementById('results');
const engineSelect = document.getElementById('engineSelect');
const inlineResults = document.getElementById('inlineResults');

function clearResults(){
  resultsEl.innerHTML = '';
  resultsEl.classList.add('hidden');
}
function showLoading(){
  resultsEl.innerHTML = '<div class="result-heading">Searching…</div>';
  resultsEl.classList.remove('hidden');
}
function showError(err){
  resultsEl.innerHTML = '<div class="result-heading">Error</div><div class="result-snippet">'+String(err)+'</div>';
  resultsEl.classList.remove('hidden');
}
function showResults(data, query){
  const parts = [];
  if (data.AbstractText){
    parts.push('<div class="result-heading">'+escapeHtml(data.Heading || 'Summary')+'</div>');
    parts.push('<div class="result-snippet">'+escapeHtml(data.AbstractText)+'</div>');
  }
  const pushResult = (title, text, href) => {
    parts.push('<div class="result-item">');
    parts.push('<div class="result-title"><a target="_blank" rel="noopener noreferrer" href="'+escapeAttr(href)+'">'+escapeHtml(title)+'</a></div>');
    if (text) parts.push('<div class="result-snippet">'+escapeHtml(text)+'</div>');
    parts.push('</div>');
  };
  if (Array.isArray(data.Results) && data.Results.length){
    data.Results.forEach(r => pushResult(r.Text||r.FirstURL, r.Icon ? r.Icon.URL : '', r.FirstURL));
  }
  if (Array.isArray(data.RelatedTopics) && data.RelatedTopics.length){
    data.RelatedTopics.forEach(rt => {
      if (rt.Topics && rt.Topics.length){
        rt.Topics.forEach(t=> pushResult(t.Text, '', t.FirstURL));
      } else {
        if (rt.FirstURL) pushResult(rt.Text, '', rt.FirstURL);
      }
    });
  }
  if (!parts.length){
    parts.push('<div class="result-heading">No instant answers</div>');
    parts.push('<div class="result-snippet">We didn\'t find instant answers. You can view full results below.</div>');
  }
  parts.push('<a class="view-full" target="_blank" rel="noopener noreferrer" href="https://duckduckgo.com/?q='+encodeURIComponent(query)+'">View full DuckDuckGo results</a>');
  resultsEl.innerHTML = parts.join('\n');
  resultsEl.classList.remove('hidden');
}

function escapeHtml(s){
  return String(s).replace(/[&<>\"]/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]});
}
function escapeAttr(s){
  return String(s).replace(/"/g,'&quot;');
}

const contentFrame = document.getElementById('content-frame');
const loadingOverlay = document.getElementById('loading-overlay');
const useProxyCheckbox = document.getElementById('useProxy');

form.addEventListener('submit', function(e){
  const data = new FormData(form);
  const qs = new URLSearchParams(data).toString();
  const query = data.get('q') || '';
  const engine = engineSelect ? engineSelect.value : 'ddg';
  const engineUrls = {
    ddg: 'https://duckduckgo.com/?q=',
    google: 'https://www.google.com/search?q=',
    bing: 'https://www.bing.com/search?q='
  };
  const targetUrl = (engineUrls[engine] || engineUrls.ddg) + encodeURIComponent(query);

  e.preventDefault();
  if (!query.trim()){ clearResults(); return; }

  // Inline DuckDuckGo instant answers
  if (inlineResults && inlineResults.checked && engine === 'ddg'){
    showLoading();
    const apiUrl = 'https://api.duckduckgo.com/?' + new URLSearchParams({q: query, format: 'json', no_html: '1', skip_disambig: '1'});
    fetch(apiUrl, {referrer: 'no-referrer'})
      .then(r => r.json())
      .then(data => showResults(data, query))
      .catch(err => showError(err));
    return;
  }

  // If useProxy is checked, attempt to load via the configured proxy endpoint
  if (useProxyCheckbox && useProxyCheckbox.checked) {
    const proxyBase = window.COOLTERUB_PROXY_BASE || '/proxy/fetch'; // default path for local dev or self-host
    const proxyUrl = proxyBase + '?url=' + encodeURIComponent(targetUrl);
    loadingOverlay.classList.remove('hidden');
    contentFrame.src = proxyUrl;
    // Remove loading after load event
    contentFrame.onload = () => loadingOverlay.classList.add('hidden');
    return;
  }

  // Otherwise, attempt to load directly into iframe. If framing is blocked by target site,
  // it will likely redirect or show an error; advise users to use proxy or open in new tab.
  loadingOverlay.classList.remove('hidden');
  contentFrame.src = targetUrl;
  // Hide loader when frame finishes loading
  contentFrame.onload = () => loadingOverlay.classList.add('hidden');

  // If user prefers, also open in new tab
  if (openInNewTab.checked) {
    const a = document.createElement('a');
    a.href = targetUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
});

// Blank-screen toggle (simple overlay, not intended for hiding remote monitoring)
const blankToggle = document.getElementById('blankToggle');
const overlay = document.getElementById('blankOverlay');
const returnBtn = document.getElementById('returnBtn');
blankToggle.addEventListener('click', () => overlay.classList.remove('hidden'));
returnBtn.addEventListener('click', () => overlay.classList.add('hidden'));

// Confirm before closing the tab/window
window.addEventListener('beforeunload', function (e) {
  // Most browsers ignore the custom message and show a generic confirmation dialog.
  e.preventDefault();
  e.returnValue = '';
});