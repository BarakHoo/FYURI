# Quick Start: Adding Your Logo and Video

## 1. Add Your Logo (IMMEDIATE - 1 minute)

You already have the logo image. Just save it:

**Location:** `fyuri.client/public/images/logos/fyuri-logo.png`

**Steps:**
1. Save the metallic FYURI logo image (the one with the owl) as `fyuri-logo.png`
2. Navigate to: `C:\Users\JOHNDOE\source\repos\FYURI\fyuri.client\public\images\logos\`
3. Paste the `fyuri-logo.png` file there
4. Rebuild and restart:
   ```powershell
   docker compose build frontend
   docker compose up -d
   ```
5. Visit http://localhost:3000 - logo will appear in navbar!

---

## 2. Add Homepage Video Background (5-10 minutes)

### Option A: Download Free Stock Video (Recommended)

I recommend these specific videos from free sources:

**Pexels (Best Options):**
1. Go to https://www.pexels.com/videos/
2. Search for: "soldier night vision"
3. Download any tactical/military night footage
4. Suggested searches:
   - "military night"
   - "soldiers tactical"
   - "special forces"
   - "army training"

**Direct Links to Good Videos:**
- https://www.pexels.com/search/videos/military%20night/
- https://www.pexels.com/search/videos/tactical/

### Option B: Use a Simple Fallback

If you don't have a video yet, the homepage will still work - it just won't have the video background until you add one.

### Steps Once You Have Video:

1. Download your chosen video
2. Rename it to: `tactical-nvg.mp4`
3. Place it in: `C:\Users\JOHNDOE\source\repos\FYURI\fyuri.client\public\videos\tactical-nvg.mp4`
4. Rebuild frontend:
   ```powershell
   cd C:\Users\JOHNDOE\source\repos\FYURI
   docker compose build frontend
   docker compose up -d
   ```
5. Visit http://localhost:3000 - you'll see the video background!

---

## Video Editing (if needed)

If your video is too large or wrong format:

### Using Windows Video Editor (Built-in):
1. Search "Video Editor" in Windows Start
2. Import your video
3. Trim to 15-20 seconds
4. Export as MP4, 1080p

### Or use online tools:
- https://www.kapwing.com/tools/resize-video (free, no signup)
- https://online-video-cutter.com/ (free)

**Target:** Under 10 MB file size, MP4 format

---

## Expected Result

Once both are added:

✅ **Navbar**: Metallic FYURI logo with owl appears in top-left
✅ **Homepage**: Full-screen tactical NVG video background with text overlay
✅ **Professional Look**: Modern, tactical, military-grade feel

---

## Right Now Status (Without Media)

Currently without the assets:
- ❌ Logo: Shows "FYURI" text fallback (theme colored)
- ❌ Video: Shows solid blue/navy background

Both work fine, just less visually impressive than with the media assets.

---

## Product Images (Optional - Can Add Later)

If you want to add product images too:
- Location: `fyuri.client/public/images/products/`
- See: `fyuri.client/public/images/products/README.md` for details
- Not urgent - products will show without images for now

---

## Test Commands (After Adding Files)

```powershell
# Navigate to project
cd C:\Users\JOHNDOE\source\repos\FYURI

# Rebuild frontend with new assets
docker compose build frontend

# Restart stack
docker compose up -d

# Check if containers are running
docker ps

# View in browser
# http://localhost:3000
```

---

## Need Help?

If something doesn't work:
1. Check file names are exact: `fyuri-logo.png`, `tactical-nvg.mp4`
2. Check file locations (use Windows Explorer to navigate)
3. Check Docker logs: `docker logs fyuri_frontend`
4. Make sure you rebuilt the frontend after adding files
