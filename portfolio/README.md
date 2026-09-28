# Portfolio (munkys.dev root)

A lightweight, no-build static site served at the root of `munkys.dev`. FYURI lives
under `munkys.dev/fyuri`. When this grows, it can be lifted into its own repo — it's
just static files, so it's a folder copy.

## Files
- `index.html` — the page (hero, about, projects, CV, contact)
- `styles.css` — design tokens + layout (light/dark theme via CSS variables)
- `main.js` — theme toggle, EN/Hebrew language toggle, footer year
- `favicon.svg` — placeholder favicon
- `assets/` — project screenshots (see assets/README.md)
- `cv.pdf` — **add your CV here** (referenced by the Download CV buttons)

## Things to fill in (marked PLACEHOLDER in the source)
1. `cv.pdf` — drop your real CV file in this folder (the Download CV buttons link to it).
2. Project screenshot — `assets/fyuri-cover.jpg` (optional; a gradient fallback shows otherwise).

Content already populated from your CV: About, Experience, Education, Skills, and
Contact details, in both English and Hebrew (toggle in the header).

## How it's served
The Caddy container mounts this folder and serves it at `/` with `file_server`,
while `/fyuri/*` is proxied to the FYURI frontend container. See the repo `Caddyfile`
and `docker-compose.yml`.

## Local preview
Any static server works, e.g.:

	npx serve portfolio

Then open the shown URL. (Note: the `/fyuri/` link only works in the full Docker
deployment, not this standalone preview.)
