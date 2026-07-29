# FYURI Image Setup Guide

## Fixed Issues
✅ **Theme Persistence**: Light/Dark mode now persists across page navigation using localStorage
✅ **Footer Links**: Footer links now use React Router, preventing page reloads and theme resets

## Image Integration Options

### Current Status
The application currently uses placeholder images. You have two options for real images:

### **Option 1: Local Images (Recommended)**

#### Step 1: Create Image Directories
Run these commands in PowerShell:
```powershell
New-Item -ItemType Directory -Path "fyuri.client\public\images\products" -Force
New-Item -ItemType Directory -Path "fyuri.client\public\images\logos" -Force
New-Item -ItemType Directory -Path "fyuri.client\public\images\banners" -Force
```

#### Step 2: Download Images from Existing Websites

**From FYURI Website (https://fyuri.co.il):**
- Logo: Save as `fyuri.client\public\images\logos\fyuri-logo.png`
- Product images: Save in `fyuri.client\public\images\products\`

**From ArgusNVS Website (https://www.argusnvs.com):**
- Professional product photos
- Banner/hero images
- Save in respective folders

#### Step 3: Image Naming Convention
For products, use this format:
- `product-[sku]-1.jpg` (main image)
- `product-[sku]-2.jpg` (additional views)
- `product-[sku]-3.jpg` (additional views)

Example:
- `product-PVS14-1.jpg`
- `product-PVS14-2.jpg`
- `product-DTNVS-1.jpg`

#### Step 4: Update Image References
Once images are in place, I can update the product data to reference them.

---

### **Option 2: External URLs**

Use direct links to images hosted on FYURI's or ArgusNVS's servers (if available).

Example:
```javascript
imageUrls: [
  'https://fyuri.co.il/images/products/pvs14.jpg',
  'https://www.argusnvs.com/images/products/dtnvs.jpg'
]
```

---

## Recommended Images to Download

### Essential:
1. **FYURI Logo** (for navbar and footer)
2. **Hero Banner** (for homepage)
3. **Product Images**:
   - PVS-14 Night Vision Monocular
   - DTNVS Binocular System
   - Thermal Imaging Monocular
   - PVS-31 Binocular
   - Night Vision Goggles
   - Helmet Mounts
   - IR Illuminators

### Optional but Recommended:
4. **Category Icons/Images**
5. **About Us** page images
6. **Lab Services** page images

---

## Image Specifications

### Logos:
- Format: PNG with transparent background
- Size: 200x80px (navbar) or original with max-width CSS

### Product Images:
- Format: JPG or PNG
- Size: 800x800px minimum
- Aspect ratio: 1:1 (square) or 4:3
- Quality: High resolution for zoom

### Hero/Banner:
- Format: JPG or WebP
- Size: 1920x600px
- Quality: High (for large displays)

---

## Next Steps

**Tell me which option you prefer:**
1. **Local images**: I'll create the folder structure and update all product references
2. **External URLs**: Provide the base URL or specific image URLs
3. **Mix**: Use local for logo/branding, external for products

**What I can do automatically:**
- Create image folders
- Update product data with new image paths
- Add logo component to navbar/footer
- Set up image optimization and lazy loading
- Add fallback images for missing products

**What you need to do:**
- Download/provide the actual image files
- Place them in the correct folders (if using local)
- Or provide the URLs (if using external)

---

## Quick Start Commands

Once you've downloaded images, place them in the folders and I'll update the code:

```powershell
# View current public folder structure
Get-ChildItem -Path "fyuri.client\public" -Recurse

# Copy images (example)
Copy-Item -Path "C:\Downloads\fyuri-logo.png" -Destination "fyuri.client\public\images\logos\"
Copy-Item -Path "C:\Downloads\product-images\*" -Destination "fyuri.client\public\images\products\"
```

Let me know when you're ready and which approach you'd like to take!
