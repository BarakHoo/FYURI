# FYURI – Email Setup Guide

The site sends these emails automatically:

| Trigger | To the customer | To you (owner) |
|---|---|---|
| Customer submits an order | Order confirmation with item summary | New-order alert (Reply goes straight to the customer) |
| You change an order's status in the admin panel | "Contacted / Approved / Completed / Rejected / Cancelled" update (toggle per save) | – |
| Someone uses the contact form | "We got your message" auto-reply | The message (Reply goes straight to the sender) |

Nothing is sent until an SMTP provider is configured. Until then, emails are only written to the server log.

---

## Part 1 – Test locally (no account needed)

1. Make sure Docker Desktop is running.
2. Double-click **`START_MAIL_INBOX.bat`** (repo root). It opens a fake inbox at <http://localhost:8025>.
3. Start the site as usual (`START_FYURI.bat`).
4. Place an order / send a contact message / change an order status in the admin panel.
5. Every email appears instantly in the inbox at `localhost:8025`. Nothing reaches real addresses.

That's it – the dev config (`appsettings.Development.json`) already points at this inbox.

---

## Part 2 – Go live with a real provider

### Recommendation: **Brevo** (formerly Sendinblue)

Why Brevo over the alternatives for FYURI:

- **Free tier: 300 emails/day, forever** – more than enough for a boutique store. No credit card.
- Plain **SMTP** (no code changes, works with what's already built).
- Lets you send **from your own domain** (`no-reply@fyuri.co.il`) so emails don't land in spam and look professional.
- Simple dashboard to see delivered/bounced emails.

(Gmail App Passwords are fine for hobby use but hit sending limits, are tied to one personal account, and Google occasionally blocks them. SendGrid free tier was discontinued. Microsoft 365 requires a paid mailbox plus extra SMTP-auth setup.)

### Step-by-step

**A. Create the account**
1. Go to <https://www.brevo.com> → *Sign up free*. Use your business email.
2. Confirm your email and complete the short onboarding (company name = FYURI, you can skip the rest).

**B. Authenticate your domain (this is what keeps you out of spam)**
1. In Brevo: top-right profile → **Senders, Domains & Dedicated IPs** → **Domains** → **Add a domain** → enter `fyuri.co.il`.
2. Brevo shows 3–4 DNS records (a **Brevo code** TXT, **DKIM** TXT/CNAME, and **DMARC** TXT).
3. Log in to wherever `fyuri.co.il`'s DNS is managed (the company you bought the domain from, or Cloudflare if you moved it there). Add each record exactly as shown – copy/paste the *Name* and *Value*.
4. Back in Brevo, click **Verify**. DNS can take a few minutes to a few hours to propagate; keep clicking *Verify* until every record shows green.

**C. Add the sender address**
1. **Senders, Domains & Dedicated IPs** → **Senders** → **Add a sender**.
2. Name: `FYURI`, Email: `no-reply@fyuri.co.il` (once the domain is verified, any address on it works, no mailbox needed).

**D. Get the SMTP credentials**
1. **SMTP & API** (same menu) → **SMTP** tab.
2. Note the values shown:
   - Server: `smtp-relay.brevo.com`
   - Port: `587`
   - Login: your Brevo login email
3. Click **Generate a new SMTP key**, name it `fyuri-site`, and **copy the key immediately** – it's shown only once.

**E. Put the values into the server**
On the production machine, open the `.env` file next to `docker-compose.yml` and fill in:

```
EMAIL_ADMIN=you@fyuri.co.il           # where YOU receive order/contact alerts
EMAIL_SENDER=no-reply@fyuri.co.il     # the sender you added in step C
EMAIL_SENDER_NAME=FYURI
EMAIL_SMTP_SERVER=smtp-relay.brevo.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_SSL_MODE=StartTls
EMAIL_SMTP_USERNAME=<your Brevo login email>
EMAIL_SMTP_PASSWORD=<the SMTP key from step D>
```

Then restart the stack: `docker compose up -d --build backend`.

**F. Verify**
1. Place a test order on the live site with your own email address.
2. You should receive the confirmation and the owner address should receive the alert within a minute.
3. In Brevo → **Transactional** → **Logs** you'll see every send with its delivery status. If something fails, the backend log (`docker logs fyuri_backend`) shows the SMTP error.

---

## Using a different provider

Any SMTP provider works – just change the five `EMAIL_SMTP_*` values.

| Provider | Server | Port | SSL mode | Username / Password |
|---|---|---|---|---|
| Brevo | `smtp-relay.brevo.com` | 587 | `StartTls` | login email / SMTP key |
| Gmail / Workspace | `smtp.gmail.com` | 587 | `StartTls` | full Gmail address / [App Password](https://myaccount.google.com/apppasswords) (2-Step Verification must be on) |
| Microsoft 365 | `smtp.office365.com` | 587 | `StartTls` | mailbox address / password (SMTP AUTH must be enabled for the mailbox) |
| cPanel / hosting | usually `mail.yourdomain` | 465 | `SslOnConnect` | mailbox address / password |
| Mailpit (local test) | `localhost` | 1025 | `None` | leave empty |

`EMAIL_SMTP_SSL_MODE` accepts `StartTls`, `SslOnConnect`, `None`, or `Auto`.
