# FYURI — Night Vision Equipment Store

A full-stack e-commerce platform for professional night vision equipment: monoculars, binoculars, quad-tube systems, image intensifier tubes, housings, optics and accessories. Includes a bilingual (Hebrew/English) storefront, an interactive custom device builder, and a full admin panel.

## Features

**Storefront**
- Bilingual UI (Hebrew RTL / English) with product catalog, category filtering and variant grouping
- Interactive custom night-vision device builder (housing, tubes, optics — with per-channel logic)
- Housing product pages with intensifier tube add-ons and bundle offers
- Shopping cart, checkout with server-side price authority, order confirmation emails
- Contact form with persisted messages

**Admin panel** (`/fyuri-admin`)
- Login with password + mandatory TOTP two-factor authentication (Google Authenticator, etc.)
- Product management (create/edit, image upload with content validation)
- Order management with status workflow and admin notes
- Customer messages inbox (read/unread, delete)

**Security**
- JWT auth in httpOnly/Secure/SameSite=Strict cookies, `AdminOnly` policy on all admin APIs
- Server-side pricing — client payloads never trusted for prices/names/SKUs
- Per-IP rate limiting (orders, cart, contact, builder, admin login), account lockout, forwarded-headers aware behind nginx
- All secrets injected via environment variables; nothing sensitive in the repo

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Material UI (react-router, lazy-loaded routes) |
| Backend | ASP.NET Core (.NET 10) Web API, EF Core |
| Database | MySQL 8 |
| Auth | JWT (cookie) + TOTP 2FA |
| Deployment | Docker Compose, **or** any host running .NET 10 + MySQL (see [DEPLOYMENT.md](DEPLOYMENT.md)) |

## ⚠️ Before You Deploy — Read This

**FYURI is not a static website.** It has two parts that must both run:

| Part | What it is | Requirement |
|---|---|---|
| Frontend (`fyuri.client`) | React SPA compiled to static files | Any web server **with URL rewriting** |
| Backend (`FYURI.Server`) | ASP.NET Core API + MySQL | Must run a **.NET 10 process** |

Uploading only the built HTML/JS will render pages that stay **empty** — products, cart, orders, contact form and the admin panel all come from the API.

Two things commonly go wrong on first deploy:

1. **All links 404 on refresh.** There is no `products.html` on disk — only `index.html`. The server must serve `index.html` for any path that isn't a real file. Ready-made configs ship in [`deploy/`](deploy/) and are copied into every build automatically.
2. **HTTPS is mandatory.** Admin cookies use `Secure` + `SameSite=Strict`, so admin login silently fails over plain HTTP.

**Minimum hosting:** URL rewriting · a way to run .NET 10 · MySQL 8 · SSL.
Static-only hosting (GitHub Pages, basic shared HTML plans) **cannot run this project** — there is nowhere for the API to live.

## Deployment Options

| Your hosting | Guide |
|---|---|
| Local machine without router port forwarding | [Cloudflare Tunnel](CLOUDFLARE_TUNNEL.md) |
| VPS / local machine with Docker | [Quick Start (Docker)](#quick-start-docker) below — easiest |
| cPanel / Plesk (Apache) | [DEPLOYMENT.md](DEPLOYMENT.md) |
| Windows hosting / IIS | [DEPLOYMENT.md](DEPLOYMENT.md) |
| Plain Linux VPS (nginx + systemd) | [DEPLOYMENT.md](DEPLOYMENT.md) |

> **Note on XAMPP:** XAMPP bundles Apache + MySQL + **PHP**. It's designed for PHP apps and **cannot run the .NET backend**. Its MySQL and Apache can be reused (Apache for the frontend with the supplied `.htaccess`, MySQL for the database), but the API still has to be started separately with `dotnet`. See [DEPLOYMENT.md](DEPLOYMENT.md#using-xampp).

## Quick Start (Docker)

Prerequisites: [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
git clone https://github.com/BarakHoo/FYURI.git
cd FYURI

# 1. Create your environment file from the template
cp .env.example .env

# 2. Set database, initial-admin, and JWT values.
#    SMTP values are optional (see "Setting Up an Admin Account" below).

# 3. Build and run
docker compose up -d --build
```

- Storefront: http://localhost:3000
- API: http://localhost:5000
- MySQL: localhost:3307

The database schema is created automatically via EF Core migrations on first startup, and the catalog is seeded.

## Setting Up an Admin Account

The admin account is provisioned **once**, when the admin table is empty. Ordinary
startup never changes an existing administrator's email, password, two-factor
enrollment, or lockout state.

1. **Set credentials in `.env`** before the first `docker compose up`:

   ```env
   ADMIN_EMAIL=  # set the real administrator email
   ADMIN_PASSWORD=  # set a unique password of at least 12 characters; 16+ recommended
   JWT_SECRET=  # 64+ random characters, e.g. from: openssl rand -base64 48
   ```

   > On Windows without openssl, generate a JWT secret in PowerShell:
   > ```powershell
   > $bytes = New-Object byte[] 48
   > $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
   > $rng.GetBytes($bytes)
   > [Convert]::ToBase64String($bytes)
   > $rng.Dispose()
   > ```

2. **Start the stack** (`docker compose up -d --build`). On first run the backend validates and hashes the password before creating the administrator. Missing, placeholder, or too-short bootstrap credentials stop the backend instead of creating an unsafe account.

3. **Log in and enroll 2FA** — go to `http://localhost:3000/fyuri-admin/login`:
   - Enter your admin email and password
   - On first login a **QR code** is displayed — scan it with any authenticator app (Google Authenticator, Authy, Microsoft Authenticator…)
   - Enter the 6-digit code to complete enrollment
   - From then on, every login requires password + a fresh 6-digit code

4. **Clear `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`**, then remove the bootstrap values from the long-running container:

   ```bash
   docker compose up -d --force-recreate backend
   ```

Changing bootstrap values and restarting is intentionally ignored after an
administrator exists. Use the explicit reset command below when credentials
must change.

### Resetting the admin account

The one-shot reset command changes the existing administrator without deleting
orders or other application data. It replaces the email/password, clears
lockout state, disables the existing TOTP enrollment, and exits without starting
the HTTP server.

```bash
# Temporarily set new ADMIN_EMAIL and ADMIN_PASSWORD values in .env
docker compose stop backend
docker compose run --rm backend reset-admin

# Clear those two bootstrap values again, then recreate the running backend
docker compose up -d --force-recreate backend
```

Then log in again — you'll be prompted to enroll 2FA from scratch.

An account reset does not revoke JWT cookies already issued; they remain valid
for up to eight hours. If compromise is suspected, keep the backend stopped and
also rotate `JWT_SECRET` before recreating it. Rotating that secret signs out
every active administrator session.

### Account protection

- 5 failed password attempts → 15-minute lockout
- Admin auth endpoints are rate-limited to 10 requests / 5 minutes per IP
- Sessions expire after 8 hours

## Environment Variables

All configured in `.env` (never committed — see `.env.example` for the full template):

| Variable | Purpose |
|---|---|
| `MYSQL_ROOT_PASSWORD`, `MYSQL_PASSWORD` | Database credentials |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Bootstrap/reset input; required only when no admin exists or while running `reset-admin`; ignored on ordinary restarts and safe to clear after use |
| `JWT_SECRET` | Required signing key for admin sessions (64+ random characters); keep stable unless deliberately revoking all sessions |
| `EMAIL_ADMIN` | Where order/contact notifications are sent |
| `EMAIL_SENDER`, `EMAIL_SENDER_NAME` | From-address for outgoing mail |
| `EMAIL_SMTP_SERVER`, `EMAIL_SMTP_PORT`, `EMAIL_SMTP_USERNAME`, `EMAIL_SMTP_PASSWORD` | SMTP delivery (optional — orders/messages are persisted even if email fails) |

## Local Development (without Docker)
Prerequisites: .NET 10 SDK, Node.js 20+, MySQL 8 running locally.

```bash
# Backend (uses appsettings.Development.json — dev-only placeholder values)
cd FYURI.Server
dotnet run

# Frontend
cd fyuri.client
npm install
npm run dev
```

Update `FYURI.Server/appsettings.Development.json` with your local MySQL connection and desired dev admin credentials.

### Automated backend tests

```bash
dotnet test FYURI.Server.Tests/FYURI.Server.Tests.csproj -c Release
```

## Project Structure

```
FYURI/
├── FYURI.Server/          # ASP.NET Core Web API
│   ├── Controllers/       # Public + admin API endpoints
│   ├── Data/              # DbContext, migrations, seed data, builder catalog
│   ├── Models/            # Entities
│   └── Services/          # Email, JWT, TOTP
├── FYURI.Server.Tests/    # Focused backend regression tests
├── fyuri.client/          # React + Vite frontend
│   ├── src/pages/         # Storefront pages
│   ├── src/pages/admin/   # Admin panel pages
│   └── nginx.conf         # Production reverse proxy config
├── docker-compose.yml     # Full stack orchestration
└── .env.example           # Environment template
```

## License

All rights reserved. This repository is for the FYURI project.
