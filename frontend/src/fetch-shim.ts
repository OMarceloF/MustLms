// frontend/src/fetch-shim.ts
const originalFetch = window.fetch;

function isAbsolute(u: string) {
  return /^https?:\/\//i.test(u);
}

// Colapsa // sem bagunçar http://
function collapseSlashes(u: string) {
  if (isAbsolute(u)) {
    const m = u.match(/^(https?:\/\/)(.*)$/i);
    if (!m) return u;
    return m[1] + m[2].replace(/\/{2,}/g, '/');
  }
  return u.replace(/\/{2,}/g, '/');
}

// Normaliza caminhos problemáticos de API
function normalizeApi(u: string) {
  return collapseSlashes(
    u
      // casos antigos
      .replace(/^\/api\/undefined\/api\//, '/api/')
      // colapsa /api/api/... (uma ou mais vezes) -> /api/...
      .replace(/^\/api\/(?:api\/)+/, '/api/')
  );
}

window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
  let url = typeof input === 'string' ? input : (input as Request).url;

  // Só prefixa caminhos relativos
  if (!isAbsolute(url)) {
    if (!url.startsWith('/')) url = '/' + url;

    // não prefixa se já começar com /api ou /ext
    if (!url.startsWith('/api/') && !url.startsWith('/ext/')) {
      url = '/api' + url;
    }
  }

  url = normalizeApi(url);

  // Cookies só para mesma origem
  const sameOrigin = !isAbsolute(url) || url.startsWith(window.location.origin);
  const finalInit: RequestInit = {
    ...init,
    credentials: sameOrigin ? 'include' : 'omit',
  };

  // ANTES de chamar originalFetch
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[fetch:req] in =', typeof input === 'string' ? input : (input as Request).url, ' -> out =', url);
  }


  const res = await originalFetch(url, finalInit);

  // Debug esperto para respostas não-JSON
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json') && !ct.startsWith('text/event-stream')) {
    const body = await res.clone().text().catch(() => '');
    console.warn(`[fetch] NÃO-JSON em ${res.url} (${res.status}).`, body.slice(0, 120));
    return res;
  }

  // Espião no .json()
  const oldJson = res.json.bind(res);
  (res as any).json = async () => {
    const parsed = await oldJson();
    const kind = Array.isArray(parsed) ? 'array' : typeof parsed;
    const keys = parsed && typeof parsed === 'object' ? Object.keys(parsed).slice(0, 6) : [];
    console.debug(`[fetch] ${res.url} OK JSON → ${kind}${keys.length ? ` keys=${keys.join(',')}` : ''}`);
    return parsed;
  };

  return res;
};
