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

if (apiBaseUrl) {
  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init) => {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      // Cross-origin API calls must send the admin session cookie.
      return originalFetch(apiBaseUrl + input, { credentials: 'include', ...init });
    }
    if (input instanceof Request && new URL(input.url, window.location.origin).pathname.startsWith('/api/')) {
      const url = new URL(input.url, window.location.origin);
      return originalFetch(new Request(apiBaseUrl + url.pathname + url.search, input), init);
    }
    return originalFetch(input, init);
  };
}

/** Resolves a backend-served asset path (e.g. product images). */
export const resolveAssetUrl = (path) => {
  if (!path || /^https?:\/\//i.test(path)) return path;
  return apiBaseUrl && path.startsWith('/images/') ? apiBaseUrl + path : path;
};

export { apiBaseUrl };
