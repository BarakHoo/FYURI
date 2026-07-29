# FYURI Website — Project Summary for Owner Review

*A plain-language overview of what has been built so far.*

---

## 1. What Is FYURI Right Now?

FYURI is a fully working, bilingual (Hebrew/English) e-commerce website for night vision equipment (monoculars, binoculars, panoramic devices, image intensifiers, optics, and accessories), plus a private admin dashboard to manage everything — products, orders, and images — without needing a developer.

The site currently runs in a containerized environment (Docker) with its own database, and is ready to be moved onto a live public server.

---

## 2. Customer-Facing Website

### Homepage
- Full-screen looping hero video with the FYURI logo overlaid.
- A slim, scrollable top info bar with rotating contact details (email, phone) and social links (WhatsApp, Facebook, Instagram).
- Category shortcuts (Monoculars, Binoculars, Panoramic, Image Intensifiers, Optics, Accessories) that link straight to filtered product listings.
- Header starts transparent over the video and smoothly becomes solid-colored once you scroll past the hero — a modern, polished effect used only on the homepage.

### Product Catalog (`/products`)
- Browse all products or filter by category and by night-vision generation (Gen 1, Gen 2, Gen 2+, Gen 3).
- Clean, spacious product cards showing photo, name, short description, generation/stock badges, and price.
- "Details" and "Add to Cart" buttons on every card.
- Works on mobile with a slide-out filter drawer.

### Product Detail Page
- Full description, specifications, image gallery, pricing, and stock status for each product.
- Add to cart directly from the detail page.

### Shopping Cart & Checkout
- Persistent cart (survives page reloads) with quantity adjustment and removal.
- Checkout form collects customer name, phone, email, address, city, and notes — no payment processor needed since this is an inquiry/order-request model appropriate for regulated night-vision equipment.
- On submission, an order is created with a unique order number (e.g. `FYURI-20250101-AB12CD34`).

### Order Confirmation Page
- After submitting an order, the customer lands on a confirmation page showing their order number, a full summary of items and pricing, business hours, and "what happens next" steps.

### Automatic Order Emails (new)
- **Customer** automatically receives a confirmation email that mirrors the on-site confirmation page (order number, itemized summary, business hours, next steps, contact info).
- **You (the owner/admin)** automatically receive a notification email for every new order, with full customer contact details and the order breakdown — so nothing gets missed.
- Email sending is ready to go live; it just needs real SMTP credentials (e.g. Gmail, Office 365, SendGrid) plugged in before launch.

### Other Pages
- **About Us** — company background.
- **Lab Services** — description of services offered, with contact CTA.
- **Contact Us** — contact form and business details (note: the form currently shows a confirmation message but is not yet wired to send you an email — see "Next Steps" below).

### Language & Theme
- Full Hebrew/English toggle across the entire site, with correct RTL/LTR layout switching.
- Light/Dark mode toggle.

---

## 3. Admin Dashboard (Private, Password-Protected)

Accessible via a hidden login page, protected with **two-factor authentication (2FA)** and automatic lockout after repeated failed login attempts — so it's secure even if someone finds the login URL.

### Product Management
- Add, edit, and delete products from a simple form — no coding needed.
- Upload product photos directly (drag a file in, no need to host images elsewhere).
- Every technical field (SKU, Generation, Resolution, FOM, Tube Type, Specifications, etc.) now has plain-language explanations and examples right in the form, so anyone on staff can manage the catalog confidently.
- Toggle products active/inactive (hide from the site without deleting) and in-stock/out-of-stock.

### Order Management
- View every order submitted by customers, with full details (customer info, items, totals, timestamps).
- Order detail page to review a specific order in full.

### Live Image Uploads
- Images uploaded through the admin panel are stored on the server and immediately available on the live site — no manual file transfers.

---

## 4. Behind the Scenes (Technical Foundation)

*For context — this is the "engine" that makes everything above work reliably.*

- **Backend:** ASP.NET Core (.NET 10) with a MySQL database, handling products, orders, categories, and admin accounts.
- **Frontend:** React + Material UI, fast and mobile-friendly.
- **Containerized deployment:** The entire system (website, backend, database) runs via Docker Compose, making it straightforward to deploy on any server or cloud provider.
- **Security:** Admin login requires 2FA (one-time codes), JWT-based sessions, and brute-force lockout protection.

---

## 5. What's Left Before Going Live

1. **Move to a live server** — provision hosting, connect the domain, set up HTTPS.
2. **Connect real email sending** — supply SMTP credentials so order confirmation/notification emails actually send (currently logs instead of sending until configured).
3. **Wire up the Contact page form** — currently shows a "message sent" confirmation on the screen but doesn't yet email you the message; recommend connecting it the same way order emails work.
4. **Content review** — final check of all product listings, prices, and photos before public launch.
5. **Backups** — set up automatic database backups on the live server.

---

## 6. Summary

The site is feature-complete for a modern night-vision equipment storefront: customers can browse, filter, and request orders in Hebrew or English, and you get instant email alerts for every order. The admin dashboard lets your team manage products and orders without any technical help. The remaining steps are primarily deployment and email configuration — no further feature development is required to launch.
