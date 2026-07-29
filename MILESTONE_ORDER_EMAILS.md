# FYURI — Milestone: Order Emails & Pre-Launch Checkpoint

Date: this checkpoint marks the current stable state of the FYURI storefront/admin system before moving to a live server.

## What's included in this milestone

- Full storefront with category browsing, product filtering by `ProductType`, and cart/checkout flow.
- Admin panel with live image uploads (Docker shared volume + static file serving).
- Homepage hero video (full-bleed, looping) with sticky top info strip (rotating contact/social slides) and a sticky navbar that starts transparent and switches to its themed background around the midpoint of the hero video, staying transparent for the first several scrolls. Logo is suppressed in the navbar on the homepage only (still shown site-wide elsewhere) since the hero already displays it.
- Hebrew/English bilingual UI via `LanguageContext`, with corrected terminology (`מגברי אור` instead of `צינורות מגבר תמונה`).
- Order pipeline: `OrdersController` creates an `OrderRequest` with items, persists it, and now sends real emails via SMTP (MailKit):
  - **Customer confirmation email** — HTML email mirroring the on-site `OrderConfirmationPage` (order number, business hours, itemized summary, "what's next" steps, contact info).
  - **Admin notification email** — HTML email with full customer + order details, sent to `EmailSettings:AdminEmail`.
  - If no SMTP server is configured, the service falls back to logging the email content (safe for local/dev use), so nothing breaks when secrets aren't set yet.

## Configuration required before going live

Set these either in `FYURI.Server/appsettings.json` (not recommended for secrets) or as environment variables / Docker Compose `.env` values:

| Setting | Env var (docker-compose) | Purpose |
|---|---|---|
| `EmailSettings:AdminEmail` | `EMAIL_ADMIN` | Where new-order notifications are sent |
| `EmailSettings:SenderEmail` | `EMAIL_SENDER` | "From" address used for outgoing mail |
| `EmailSettings:SenderName` | `EMAIL_SENDER_NAME` | "From" display name (defaults to `FYURI`) |
| `EmailSettings:SmtpServer` | `EMAIL_SMTP_SERVER` | SMTP host (e.g. `smtp.sendgrid.net`, `smtp.office365.com`) |
| `EmailSettings:SmtpPort` | `EMAIL_SMTP_PORT` | SMTP port (defaults to `587`, StartTLS) |
| `EmailSettings:SmtpUsername` | `EMAIL_SMTP_USERNAME` | SMTP auth username |
| `EmailSettings:SmtpPassword` | `EMAIL_SMTP_PASSWORD` | SMTP auth password / app password |

`docker-compose.yml` already wires these through as environment variables with safe defaults, so a `.env` file (not committed) can supply real credentials on the live server.

## Next steps toward launch

1. **Move to a live server** — provision hosting (VM/App Service/etc.), point DNS, configure HTTPS, and deploy via Docker Compose or CI/CD.
2. **SMTP provider setup** — choose a transactional email provider (e.g. SendGrid, Mailgun, Office 365, or Gmail with an app password) and populate the settings above with real credentials on the live server only.
3. **Validate email deliverability** — test a real order end-to-end in the live environment to confirm both the customer confirmation and admin notification emails arrive (check spam folder, SPF/DKIM setup for the sending domain).
4. **Review other pre-launch items** — backups for MySQL volume, log retention, and admin account password rotation.
