# Media Assets Setup Instructions

## Logo

**File:** `fyuri.client/public/images/logos/fyuri-logo.png`

The logo image (metallic FYURI text with owl emblem) should be saved to this location.

### Steps:
1. Save your logo image file as `fyuri-logo.png`
2. Place it in: `fyuri.client/public/images/logos/`
3. The logo will automatically appear in the navbar

---

## Homepage Video Background

**File:** `fyuri.client/public/videos/tactical-nvg.mp4`

A tactical night vision operations video for the homepage hero section.

### Steps:
1. Find or create a video showing tactical operations with night vision equipment
2. Recommended specs:
   - Format: MP4 (H.264 codec)
   - Resolution: 1920x1080 (Full HD) minimum
   - Duration: 10-30 seconds (will loop)
   - File size: Under 10 MB (compress if needed)
   - Frame rate: 24-30 fps
   - Aspect ratio: 16:9
3. Create the directory if it doesn't exist:
   ```
   fyuri.client/public/videos/
   ```
4. Save the video as `tactical-nvg.mp4` in that directory

### Video Content Suggestions:
- Night vision helmet-mounted displays in use
- Tactical team operations at night
- Night vision goggles/binoculars POV footage
- Military/law enforcement training exercises using NVGs
- Infantry or special operations footage (green phosphor or white phosphor)

### Fallback:
If video is not available, the homepage will display with a solid background color. The video enhances the visual appeal but is not required for functionality.

---

## Product Images

Product images should be placed in: `fyuri.client/public/images/products/`

Current seeded products expect these image files:
- `pvs-14.jpg`, `pvs-14-1.jpg`, `pvs-14-2.jpg`
- `anpvs-15.jpg`, `anpvs-15-1.jpg`, `anpvs-15-2.jpg`
- `bnvd-barak.jpg`, `bnvd-barak-1.jpg`, `bnvd-barak-2.jpg`
- `pvs-31.jpg`, `pvs-31-1.jpg`
- `anpvs-7.jpg`, `anpvs-7-1.jpg`

### Image Specifications:
- Thumbnails: 400x400px (square)
- Detail images: 800x800px or larger
- Format: JPG or PNG
- File size: Under 500 KB each (compress if needed)
- Background: Clean white or transparent
- Lighting: Well-lit product photography showing device details

---

## Directory Structure

```
fyuri.client/public/
├── images/
│   ├── logos/
│   │   └── fyuri-logo.png          ← Save your logo here
│   └── products/
│       ├── pvs-14.jpg
│       ├── pvs-14-1.jpg
│       └── ...                      ← Product images
└── videos/
	└── tactical-nvg.mp4             ← Save homepage video here
```

---

## Free Stock Video Resources

If you need tactical/night vision footage, consider these royalty-free sources:

- **Pexels Videos**: https://www.pexels.com/videos/
- **Pixabay Videos**: https://pixabay.com/videos/
- **Videvo**: https://www.videvo.net/
- **Coverr**: https://coverr.co/

Search terms: "military", "tactical", "night vision", "soldiers night", "special forces"

---

## Testing

After adding the media files:

1. Rebuild the frontend Docker image:
   ```powershell
   docker compose build frontend
   ```

2. Restart the stack:
   ```powershell
   docker compose up -d
   ```

3. Visit http://localhost:3000 to see:
   - Logo in the navbar
   - Video background on homepage
   - Product images on product pages

---

## Notes

- All paths are relative to the `public` folder
- Files in `public` folder are served statically by Vite/Nginx
- Video will autoplay, loop, and be muted (no sound)
- The video has a dark overlay (50% opacity) to ensure text readability
- Logo has fallback styling if image is not found
