# Deploying FYURI Without Docker

Docker is optional. This guide covers deploying to standard hosting (cPanel/Plesk, IIS/Windows, or a plain Linux VPS).

---

## Understanding the architecture (read this first)

FYURI is **not a static HTML website**. It has two parts:

| Part | What it is | Hosting requirement |
|---|---|---|
| **Frontend** (`fyuri.client`) | React SPA — compiles to static files (`index.html`, JS, CSS, images) | Any web server |
| **Backend** (`FYURI.Server`) | ASP.NET Core (.NET 10) Web API + MySQL | Must run a .NET process |

The site **cannot work with the frontend alone.** Products, cart, orders, contact form and admin panel all come from the API. If you upload only the built HTML/JS, the pages render but stay empty and nothing saves.

### Why the links appear "broken"

React Router handles navigation **in the browser**. There is no `products.html` or `contact.html` on disk — only `index.html`. When a visitor opens `https://yoursite.com/products` directly (or refreshes), the web server looks for a file at `/products`, doesn't find one, and returns **404**.

**The fix:** configure the server to serve `index.html` for any path that isn't a real file. Ready-made configs are included:

- **Apache / cPanel / Plesk** → `deploy/apache/.htaccess`
- **IIS / Windows hosting** → `deploy/iis/web.config`
- **nginx** → `fyuri.client/nginx.conf`

> Both files are also copied automatically into `fyuri.client/public/`, so **`npm run build` already places them in `dist/`**. Just upload the whole `dist/` folder contents, including the hidden `.htaccess`.

---

## Step 1 — Build the frontend

```bash
cd fyuri.client
npm install
npm run build
```

This produces `fyuri.client/dist/`. Upload **the contents** of `dist/` (not the folder itself) to your web root — `public_html/`, `wwwroot/`, etc.

⚠️ **Make sure hidden files are uploaded.** FileZilla: *Server → Force showing hidden files*. cPanel File Manager: *Settings → Show Hidden Files*. If `.htaccess` is missing, every link breaks on refresh.

### If the API is on a different domain

By default the frontend calls `/api/...` on its own domain (requires a proxy — see Step 3). If the backend lives elsewhere, build with:

```bash
# Linux/macOS
VITE_API_BASE_URL=https://api.yoursite.com npm run build

# Windows PowerShell
$env:VITE_API_BASE_URL='https://api.yoursite.com'; npm run build
```

Then add that frontend origin to the backend's allowed origins (Step 2).

---

## Step 2 — Deploy the backend

The backend needs a host that can run .NET 10 and reach MySQL. Options: a VPS, Windows hosting with IIS, or a managed service (Azure App Service, Railway, Render…).

### Publish

```bash
cd FYURI.Server
dotnet publish -c Release -o ./publish
```

Upload `publish/` to the server.

### Required configuration

Set these as environment variables (or in `appsettings.Production.json`). **Never commit real values.**

```bash
ConnectionStrings__DefaultConnection="Server=localhost;Port=3306;Database=fyuri_db;User=fyuri_user;Password=YOUR_DB_PASSWORD;CharSet=utf8mb4;"
Jwt__Secret="64+ random characters"
AdminAccount__Email="your-admin@example.com"
AdminAccount__Password="a-strong-password"
Cors__AllowedOrigins__0="https://yoursite.com"
EmailSettings__SmtpServer="smtp.yourprovider.com"
EmailSettings__SmtpUsername="..."
EmailSettings__SmtpPassword="..."
EmailSettings__AdminEmail="your-admin@example.com"
```

`Cors__AllowedOrigins__0` **must** be your real site URL, otherwise the browser blocks all API calls.

Create the MySQL database and user first; the schema and catalog are created automatically on first startup.

### Running it

**Linux (systemd)** — create `/etc/systemd/system/fyuri.service`:

```ini
[Unit]
Description=FYURI API
After=network.target mysql.service

[Service]
WorkingDirectory=/var/www/fyuri-api
ExecStart=/usr/bin/dotnet /var/www/fyuri-api/FYURI.Server.dll
Restart=always
RestartSec=10
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://127.0.0.1:5000
EnvironmentFile=/var/www/fyuri-api/.env

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now fyuri
```

**Windows/IIS** — install the [.NET Hosting Bundle](https://dotnet.microsoft.com/download/dotnet/10.0), create an application pool with *No Managed Code*, and point a site at the `publish` folder.

---

## Step 3 — Connect frontend to backend

Best practice: serve both from **one domain** so cookies and CORS just work.

**Apache** — uncomment the proxy block in `.htaccess` (needs `mod_proxy`, `mod_proxy_http`):

```apache
ProxyPass        /api/ http://127.0.0.1:5000/api/
ProxyPassReverse /api/ http://127.0.0.1:5000/api/
ProxyPass        /images/ http://127.0.0.1:5000/images/
ProxyPassReverse /images/ http://127.0.0.1:5000/images/
```

**nginx** — already configured in `fyuri.client/nginx.conf`; adjust `proxy_pass` to `http://127.0.0.1:5000`.

**IIS** — install [ARR](https://www.iis.net/downloads/microsoft/application-request-routing) and uncomment the "Proxy API" rule in `web.config`.

If a proxy isn't possible, use a separate API subdomain (`api.yoursite.com`) with `VITE_API_BASE_URL` + CORS as described above.

---

## Step 4 — HTTPS is mandatory

Admin session cookies are issued with `Secure` + `SameSite=Strict`. **Over plain HTTP the admin panel cannot log in.** Use a valid certificate (Let's Encrypt / your host's AutoSSL).

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Links 404 on refresh / direct visit | SPA rewrite missing | Upload `.htaccess` / `web.config` to the web root; confirm `mod_rewrite` or URL Rewrite is enabled |
| Site loads but no products, empty pages | API unreachable | Check backend is running; open `https://yoursite.com/api/products` directly |
| Console: "blocked by CORS policy" | Origin not allowed | Add your domain to `Cors__AllowedOrigins__0` and restart the backend |
| Admin login does nothing / loops | Not on HTTPS | Enable SSL — Secure cookies require it |
| Product images 404 | `/images/` not proxied | Add the `/images/` proxy rule, or set `VITE_API_BASE_URL` |
| Blank white page, console 404s on `.js` | Site is in a subfolder | Set `base: '/subfolder/'` in `vite.config.js`, rebuild, and update `RewriteBase` |

### Minimum hosting requirements

- ✅ Web server with rewrite support (Apache + `mod_rewrite`, nginx, or IIS + URL Rewrite)
- ✅ Ability to run a .NET 10 process (VPS, Windows hosting, or cloud app service)
- ✅ MySQL 8 database
- ✅ HTTPS certificate
- ❌ Static-only hosting (GitHub Pages, plain shared HTML hosting) **will not work** — there's nowhere to run the API
