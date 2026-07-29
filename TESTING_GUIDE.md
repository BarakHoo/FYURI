# FYURI Bilingual Platform - Testing Guide

## 🚀 Quick Start

The FYURI platform is now running with full bilingual support and light/dark mode!

### Access the Application

- **Frontend (React)**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MySQL Database**: localhost:3307

## 🧪 Testing Checklist

### 1. Language Switching Test

**Steps:**
1. Open http://localhost:3000
2. Look for the language icon (🌐) in the top-right navbar
3. Click it to toggle between Hebrew and English
4. Verify the following pages change language:

   - [ ] **Home Page** - Hero text, categories, "Why FYURI?" section
   - [ ] **Products Page** (`/products`) - Product names, descriptions, buttons
   - [ ] **Product Detail** (`/products/:id`) - Product info, specs, buttons
   - [ ] **Cart Page** (`/cart`) - Cart title, items, totals, buttons
   - [ ] **Checkout Page** (`/checkout`) - Form labels, notice text, validation
   - [ ] **About Page** (`/about`) - Company info, values, expertise
   - [ ] **Contact Page** (`/contact`) - Form labels, contact info, hours
   - [ ] **Lab Services** (`/services`) - Service cards, descriptions
   - [ ] **Footer** - Links, contact info, copyright

### 2. Theme Switching Test

**Steps:**
1. Look for the theme icon (☀️ or 🌙) in the top-right navbar
2. Click it to toggle between light and dark mode
3. Verify:
   - [ ] Background color changes
   - [ ] Text remains readable
   - [ ] Cards and papers update colors
   - [ ] Buttons maintain proper contrast
   - [ ] All pages respect the theme

### 3. RTL/LTR Layout Test

**Steps:**
1. Switch to **Hebrew** language
   - [ ] Text should align **right**
   - [ ] Navbar items flow right-to-left
   - [ ] Forms align properly
2. Switch to **English** language
   - [ ] Text should align **left**
   - [ ] Navbar items flow left-to-right
   - [ ] Forms align properly

### 4. Checkout Notice Test (Key Requirement)

**Steps:**
1. Add a product to cart
2. Go to checkout page
3. Look for the notice at the top of the page

**Hebrew Version Should Read:**
> שימו לב: תשלום לא מתבצע באתר. נציג שלנו יצור איתכם קשר לסיום ההזמנה ותיאום משלוח. נשמח לענות על כל שאלה ולעזור לכם לבחור את הציוד המושלם.

**English Version Should Read:**
> Please note: No payment is processed on the site. Our representative will contact you to finalize your order and arrange delivery. We're happy to answer any questions and help you choose the perfect equipment.

- [ ] Verify notice sounds **friendly and helpful** (not strict/regulatory)
- [ ] Verify notice appears in **both languages**
- [ ] Verify notice is easy to understand

### 5. Product Data Test

**Steps:**
1. Go to Products page (`/products`)
2. Switch to **Hebrew**:
   - [ ] Product names show Hebrew version
   - [ ] Descriptions show Hebrew version
   - [ ] If no Hebrew version, shows English as fallback
3. Switch to **English**:
   - [ ] Product names show English version
   - [ ] Descriptions show English version

### 6. Form Validation Test

**Steps:**
1. Go to Checkout page
2. Try submitting empty form
3. Verify error messages appear in:
   - [ ] Hebrew when Hebrew is selected
   - [ ] English when English is selected

### 7. Navigation Test

**Steps:**
1. Test all navbar links in **both languages**:
   - [ ] בית / Home → `/`
   - [ ] קטלוג / Catalog → `/products`
   - [ ] מי אנחנו / About Us → `/about`
   - [ ] שירותי מעבדה / Lab Services → `/services`
   - [ ] צור קשר / Contact → `/contact`

### 8. Footer Test

**Steps:**
1. Scroll to bottom of any page
2. Verify footer shows:
   - [ ] Bilingual branding
   - [ ] Bilingual links
   - [ ] Bilingual contact info
   - [ ] Copyright in both languages

## 🎯 Key Features to Verify

### Bilingual Coverage
- [ ] No hard-coded Hebrew text remains visible
- [ ] No hard-coded English text remains visible
- [ ] Every UI element supports both languages
- [ ] Language toggle works on all pages

### Theme Support
- [ ] Theme toggle accessible from any page
- [ ] Theme persists across page navigation
- [ ] Both themes are readable and professional
- [ ] Icons change (sun ↔ moon)

### User Experience
- [ ] Checkout notice is friendly (not regulatory/strict)
- [ ] Smooth language switching (no page reload)
- [ ] Smooth theme switching (no page reload)
- [ ] All buttons and links work correctly

## 🐛 Known Behaviors

1. **Language Default**: App starts in Hebrew by default
2. **Theme Default**: App starts in dark mode by default
3. **Product Images**: Placeholder (grey boxes) - not yet implemented
4. **Contact Form**: Console log only (no backend submission yet)
5. **MySQL Port**: Running on 3307 (not default 3306)

## 📊 Sample Test Flow

### Complete User Journey Test

1. **Start**: Open http://localhost:3000
2. **Theme**: Switch to light mode (click ☀️)
3. **Language**: Switch to English (click 🌐)
4. **Browse**: Click "Catalog" → view products
5. **Detail**: Click on a product → view details
6. **Add to Cart**: Click "Add to Cart" → verify cart icon updates
7. **View Cart**: Click cart icon → verify items
8. **Checkout**: Click "Proceed to Checkout"
9. **Verify Notice**: Read the friendly checkout notice
10. **Language Switch**: Toggle back to Hebrew
11. **Verify Notice**: Read Hebrew version of notice
12. **Theme Switch**: Toggle back to dark mode
13. **Complete**: Fill form and submit (test validation)

## ✅ Success Criteria

All bilingual and theme features are working when:

- ✅ Every page has both Hebrew and English versions
- ✅ No hard-coded strings visible in UI
- ✅ Light and dark themes both work properly
- ✅ RTL/LTR layout works correctly
- ✅ Checkout notice is friendly and bilingual
- ✅ All forms validate in both languages
- ✅ Navigation works in both languages
- ✅ Footer is fully bilingual

---

## 🎉 You're All Set!

The FYURI platform is now fully bilingual with light/dark mode support. 

**Next**: Open http://localhost:3000 and start testing! 🚀
