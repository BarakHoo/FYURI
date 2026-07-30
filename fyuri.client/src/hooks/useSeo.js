import { useEffect } from 'react';

const SITE_NAME = 'FYURI';
const DEFAULT_DESCRIPTION =
  'FYURI - צ\u05D9\u05D5\u05D3 \u05E8\u05D0\u05D9\u05D9\u05EA \u05DC\u05D9\u05DC\u05D4 \u05DE\u05E7\u05E6\u05D5\u05E2\u05D9. Professional night vision equipment, image intensifier tubes and lab services.';

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Lightweight per-route SEO. Sets document title, meta description, canonical
 * URL and Open Graph / Twitter tags. Intended for a client-rendered SPA where
 * a full SSR/prerender solution is not yet in place.
 */
export function useSeo({ title, description } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Night Vision Equipment`;
    const desc = description || DEFAULT_DESCRIPTION;
    const canonical = typeof window !== 'undefined' ? window.location.href.split('#')[0] : undefined;

    document.title = fullTitle;
    upsertMeta('name', 'description', desc);
    upsertLink('canonical', canonical);

    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', SITE_NAME);
    if (canonical) upsertMeta('property', 'og:url', canonical);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);
  }, [title, description]);
}

export default useSeo;
