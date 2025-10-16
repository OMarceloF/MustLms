// frontend/src/axios-shim.ts
import axios, { AxiosHeaders, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

axios.defaults.withCredentials = true;

function isAbsolute(u: string) {
  return /^https?:\/\//i.test(u);
}

function collapseSlashes(u: string) {
  if (isAbsolute(u)) {
    const m = u.match(/^(https?:\/\/)(.*)$/i);
    if (!m) return u;
    return m[1] + m[2].replace(/\/{2,}/g, '/');
  }
  return u.replace(/\/{2,}/g, '/');
}

function normalizeApi(u: string) {
  // Suporta path pura e URL absoluta
  try {
    if (isAbsolute(u)) {
      const urlObj = new URL(u);
      urlObj.pathname = collapseSlashes(
        urlObj.pathname
          .replace(/^\/api\/undefined\/api\//, '/api/')
          .replace(/^\/api\/(?:api\/)+/, '/api/')
      );
      return urlObj.toString();
    } else {
      return collapseSlashes(
        u
          .replace(/^\/api\/undefined\/api\//, '/api/')
          .replace(/^\/api\/(?:api\/)+/, '/api/')
      );
    }
  } catch {
    // fallback conservador
    return collapseSlashes(
      u
        .replace(/^\/api\/undefined\/api\//, '/api/')
        .replace(/^\/api\/(?:api\/)+/, '/api/')
    );
  }
}

function attachInterceptors(instance: AxiosInstance) {
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    let url = config.url ?? '';

    // prefixa apenas relativos (e não /ext)
    if (!isAbsolute(url)) {
      if (!url.startsWith('/')) url = '/' + url;
      if (!url.startsWith('/api/') && !url.startsWith('/ext/')) {
        url = '/api' + url;
      }
    }

    url = normalizeApi(url);
    config.url = url;

    // withCredentials só se mesma origem
    const sameOrigin = !isAbsolute(url) || url.startsWith(window.location.origin);
    config.withCredentials = sameOrigin;

    // headers no formato AxiosHeaders
    const headers =
      config.headers instanceof AxiosHeaders
        ? config.headers
        : new AxiosHeaders(config.headers);
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    config.headers = headers;

    if (process.env.NODE_ENV !== 'production') {
      console.debug('[axios:req] in =', config.url, ' -> out =', url);
    }


    return config;
  });

  instance.interceptors.response.use(
    (res) => {
      const data = res.data;
      const kind = Array.isArray(data) ? 'array' : typeof data;
      const keys = data && typeof data === 'object' ? Object.keys(data).slice(0, 5) : [];
      console.debug(`[axios] ${res.config.url} → ${kind}${keys.length ? ` keys=${keys.join(',')}` : ''}`);
      return res;
    },
    (err) => {
      if (err?.response) {
        console.warn(`[axios ${err.response.status}] ${err.config?.url}`, err.response.data);
      } else {
        console.warn(`[axios] erro de rede`, err?.message);
      }
      return Promise.reject(err);
    }
  );
}

// 1) Intercepta o axios "padrão"
attachInterceptors(axios);

// 2) Garante que QUALQUER axios.create também receba os mesmos interceptores
const _create = axios.create.bind(axios);
axios.create = function (...args) {
  const inst = _create(...args);
  attachInterceptors(inst);
  return inst;
};
