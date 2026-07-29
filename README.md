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
| Frontend | React 18 + Vite + Material UI (react-router, lazy-loaded routes) |
| Backend | ASP.NET Core (.NET 10) Web API, EF Core |
| Database | MySQL 8 |
| Auth | JWT (cookie) + TOTP 2FA |
| Deployment | Docker Compose (nginx frontend, .NET backend, MySQL) |

## Quick Start (Docker)

> **Not using Docker?** See **[DEPLOYMENT.md](DEPLOYMENT.md)** for deploying to cPanel/Plesk, IIS, or a plain VPS — including the SPA rewrite rules that keep links from breaking on refresh.

Prerequisites: [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
git clone https://github.com/BarakHoo/FYURI.git
cd FYURI

# 1. Create your environment file from the template
cp .env.example .env

# 2. Edit .env and fill in ALL values (see "Setting Up an Admin Account" below)

# 3. Build and run
docker compose up -d --build
```

- Storefront: http://localhost:3000
- API: http://localhost:5000
- MySQL: localhost:3307

The database schema is created automatically via EF Core migrations on first startup, and the catalog is seeded.

## Setting Up an Admin Account

The admin account is provisioned **automatically on first startup** from environment variables — no manual database work needed.

1. **Set credentials in `.env`** before the first `docker compose up`:

   ```env
   ADMIN_EMAIL=your-admin@example.com
   ADMIN_PASSWORD=choose-a-strong-password
   JWT_SECRET=  # 64+ random characters, e.g. from: openssl rand -base64 48
   ```

   > On Windows without openssl, generate a JWT secret in PowerShell:
   > ```powershell
   > -join ((48..57)+(65..90)+(97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
   > ```

2. **Start the stack** (`docker compose up -d --build`). On first run the backend hashes the password and creates the admin user. (If an admin already exists, the seeding step is skipped — see "Resetting the admin account" below.)

3. **Log in and enroll 2FA** — go to `http://localhost:3000/fyuri-admin/login`:
   - Enter your admin email and password
   - On first login a **QR code** is displayed — scan it with any authenticator app (Google Authenticator, Authy, Microsoft Authenticator…)
   - Enter the 6-digit code to complete enrollment
   - From then on, every login requires password + a fresh 6-digit code

### Resetting the admin account

The seeder only runs when **no** admin exists. To reset (e.g. lost password or lost authenticator):

```bash
# Delete the admin user, then restart the backend to re-seed from .env
docker exec -it fyuri_mysql mysql -u fyuri_user -p fyuri_db -e "DELETE FROM AdminUsers;"
docker restart fyuri_backend
```

Then log in again — you'll be prompted to enroll 2FA from scratch.

### Account protection

- 5 failed password attempts → 15-minute lockout
- Admin auth endpoints are rate-limited to 10 requests / 5 minutes per IP
- Sessions expire after 8 hours

## Environment Variables

All configured in `.env` (never committed — see `.env.example` for the full template):

| Variable | Purpose |
|---|---|
| `MYSQL_ROOT_PASSWORD`, `MYSQL_PASSWORD` | Database credentials |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Initial admin account (first startup only) |
| `JWT_SECRET` | Signing key for admin session tokens (64+ chars) |
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

## Project Structure

```
FYURI/
├── FYURI.Server/          # ASP.NET Core Web API
│   ├── Controllers/       # Public + admin API endpoints
│   ├── Data/              # DbContext, migrations, seed data, builder catalog
│   ├── Models/            # Entities
│   └── Services/          # Email, JWT, TOTP
├── fyuri.client/          # React + Vite frontend
│   ├── src/pages/         # Storefront pages
│   ├── src/pages/admin/   # Admin panel pages
│   └── nginx.conf         # Production reverse proxy config
├── docker-compose.yml     # Full stack orchestration
└── .env.example           # Environment template
```

## License

All rights reserved. This repository is for the FYURI project.
