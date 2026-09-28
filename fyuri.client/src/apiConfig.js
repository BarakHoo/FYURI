/**
 * Routes relative "/api/..." calls to a configurable backend origin.
 *
 * By default the app assumes the API is reachable on the same origin (behind a
 * reverse proxy). When the backend is hosted separately — common on shared
 * hosting where you cannot proxy — set VITE_API_BASE_URL at build time:
 *
 *   VITE_API_BASE_URL=https://api.example.com npm run build
 *
 * Leaving it empty keeps the existing same-origin behaviour.
 */
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

// The path the SPA is served from, e.g. "/fyuri". Empty when hosted at the root.
const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

// Where same-origin "/api" and "/images" calls should actually go. When the API
// is a separate origin, VITE_API_BASE_URL wins; otherwise they are served under
// the app's base path by the reverse proxy (e.g. /fyuri/api, /fyuri/images).
const sameOriginPrefix = apiBaseUrl || basePath;

const rewritePath = (path) => {
  if (apiBaseUrl) return apiBaseUrl + path;            // separate API origin
  if (basePath && !path.startsWith(basePath + '/')) {  // same origin, under base
    return basePath + path;
  }
  return path;
};

if (sameOriginPrefix) {
  const originalFetch = window.fetch.bind(window);

  const shouldRewrite = (pathname) =>
    (pathname.startsWith('/api/') || pathname.startsWith('/images/'));

  window.fetch = (input, init) => {
    if (typeof input === 'string' && shouldRewrite(input)) {
      // Cross-origin API calls must send the admin session cookie.
      const opts = apiBaseUrl ? { credentials: 'include', ...init } : init;
      return originalFetch(rewritePath(input), opts);
    }
    if (input instanceof Request) {
      const url = new URL(input.url, window.location.origin);
      if (shouldRewrite(url.pathname)) {
        return originalFetch(new Request(rewritePath(url.pathname) + url.search, input), init);
      }
    }
    return originalFetch(input, init);
  };
}

/** Resolves a backend-served asset path (e.g. product images). */
export const resolveAssetUrl = (path) => {
  if (!path || /^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/images/')) return rewritePath(path);
  return path;
};

export { apiBaseUrl, basePath };
