# Homepage hero media

The homepage uses a short, silent night-vision loop with a static poster fallback.

## Production assets

- `tactical-nvg.webm` — preferred VP9 source for supported browsers
- `tactical-nvg.mp4` — H.264 fallback with fast-start metadata
- `../images/banners/tactical-nvg-poster.webp` — fallback for reduced motion, data-saving mode, slow connections, autoplay failure, or media errors

Both videos are 1280×720 at 24 fps with no audio. The loop is cut from the strongest section of the original footage and crossfades back into its opening.

## Budgets

- WebM: at most 900 KB
- MP4: at most 1.2 MB
- Poster: at most 100 KB
- Complete package: at most 2 MB

The Playwright homepage suite enforces these limits. Do not store an uncompressed source master under `public/`; Vite copies every file in that directory into the production build even when the application does not reference it.

The footage source and commercial-use rights should be confirmed by the site owner before production publication.
