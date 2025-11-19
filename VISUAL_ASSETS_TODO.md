# Visual Assets TODO - Priority Order

## 🎥 1. Demo Video (60 seconds) - HIGHEST PRIORITY

### What to Show
1. **Opening (5s):** "Watch Clipper Pro work offline"
2. **Step 1 (15s):** Copy text from a webpage (Ctrl+C)
3. **Step 2 (10s):** Press Ctrl+Shift+C → Show notification "✓ Sent to Notion"
4. **Step 3 (15s):** Open Notion → Show content appeared
5. **Step 4 (15s):** Disconnect wifi → Copy again → Show "Queued (offline)"
6. **Closing (10s):** Reconnect → Show "✓ Synced" + "No more 'go online' errors"

### Tools
- **Mac:** QuickTime Screen Recording (free, built-in)
- **Windows:** OBS Studio (free) or Windows Game Bar (Win+G)
- **Polish:** Screen.studio ($89, optional but makes it look pro)
- **Convert to GIF:** ezgif.com (free)

### Specs
- Resolution: 1920x1080 (16:9)
- Length: 60 seconds max
- Format: MP4 or WebM
- File size: < 10MB (for fast loading)

### Where to Add
Replace placeholder in `HomePage.tsx` line ~100:
```tsx
{/* Video Demo Placeholder */}
<video autoPlay loop muted playsInline className="rounded-lg">
  <source src="/demo-video.mp4" type="video/mp4" />
</video>
```

---

## 📸 2. Screenshots (3 Essential)

### Screenshot A: Offline Queue
**What to show:**
- Desktop app or extension popup
- 3-4 items with status:
  - "Pending..." (yellow)
  - "Syncing..." (blue)
  - "✓ Synced" (green)
- Timestamp showing they were queued offline

**Dimensions:** 800x600px
**Format:** PNG with transparency
**File:** `public/screenshots/offline-queue.png`

---

### Screenshot B: Success Notification
**What to show:**
- Browser notification or toast
- Text: "✓ Sent to Notion"
- Notion logo + Clipper Pro logo
- Clean, minimal design

**Dimensions:** 400x200px
**Format:** PNG with transparency
**File:** `public/screenshots/success-notification.png`

---

### Screenshot C: Side-by-Side Comparison
**What to show:**
- Left side: Official clipper showing "Please go online to save" error (red)
- Right side: Clipper Pro showing "✓ Queued for sync" (green)
- Both with wifi icon crossed out

**Dimensions:** 1200x600px
**Format:** PNG
**File:** `public/screenshots/comparison.png`

**Tool:** Figma (free) or Canva (free)

---

## 🎨 3. Optional But High Impact

### Screenshot D: Desktop App Interface
- Show clean, modern UI
- Clips list with search
- Settings panel
- Dark mode toggle

**Dimensions:** 1200x900px
**File:** `public/screenshots/desktop-app.png`

---

### Screenshot E: Extension Popup
- Show extension icon in browser toolbar
- Popup with quick actions
- Recent clips list
- Database selector

**Dimensions:** 400x600px
**File:** `public/screenshots/extension-popup.png`

---

## 📝 4. Testimonial Graphics (After Getting Quotes)

### Format
```
"Quote text here. This is the ONLY clipper 
that doesn't lose my stuff."

— Sarah K., Content Manager
```

**Design:**
- White background with subtle gradient
- Purple accent color
- Profile photo (optional, use avatar if no photo)
- 5 stars rating

**Dimensions:** 600x400px
**Tool:** Canva (free templates)

---

## 🚀 Quick Win: Placeholder Improvements

While waiting for real assets, improve placeholders:

### Current Placeholders (in HomePage.tsx)
All have this structure:
```tsx
<div className="bg-gradient-to-br from-purple-100 to-blue-100 ...">
  <ImageIcon />
  <p>📸 Screenshot Placeholder</p>
</div>
```

### Improved Placeholder (More Descriptive)
Add mockup wireframes or use Unsplash images as temporary:
- Search "notion app screenshot" on Unsplash
- Use as placeholder until you have real screenshots
- Add blur filter to indicate it's temporary

---

## 📊 Asset Priority Matrix

| Asset | Impact | Effort | Priority |
|-------|--------|--------|----------|
| 60s Demo Video | 🔥🔥🔥 | 2h | **DO FIRST** |
| Offline Queue Screenshot | 🔥🔥🔥 | 30min | **DO SECOND** |
| Success Notification | 🔥🔥 | 20min | **DO THIRD** |
| Comparison Screenshot | 🔥🔥 | 1h | Do This Week |
| Desktop App Screenshot | 🔥 | 1h | When App Ready |
| Extension Screenshot | 🔥 | 30min | When Ext Ready |
| Testimonial Graphics | 🔥🔥 | 1h | After Getting Quotes |

---

## 🎬 Recording Tips

### For Demo Video
1. **Clean your desktop** (hide personal files)
2. **Use a clean browser profile** (no weird extensions)
3. **Prepare the script** (know exactly what to show)
4. **Record in 4K** (downscale to 1080p for quality)
5. **No audio needed** (add text overlays instead)
6. **Keep it fast-paced** (1-2 seconds per action)

### For Screenshots
1. **Use consistent browser** (Chrome with clean theme)
2. **Zoom to 100%** (no weird scaling)
3. **Hide personal data** (use fake names/emails)
4. **Good lighting** (if showing physical device)
5. **Crop tightly** (remove unnecessary UI)

---

## 🔗 Resources

### Free Tools
- **Screen Recording:** OBS Studio, QuickTime
- **Screenshot Editing:** GIMP, Photopea (web-based Photoshop)
- **Video Editing:** DaVinci Resolve (free)
- **GIF Conversion:** ezgif.com
- **Mockups:** Figma (free), Canva (free)

### Paid (Optional)
- **Screen.studio** ($89 one-time) - Makes videos look pro instantly
- **CleanShot X** ($29/year) - Best screenshot tool for Mac
- **Snagit** ($50) - Screenshot + simple editing

---

## ✅ Checklist

- [ ] Record 60s demo video
- [ ] Convert to MP4 (< 10MB)
- [ ] Add to `public/videos/demo.mp4`
- [ ] Update HomePage.tsx video placeholder
- [ ] Take offline queue screenshot
- [ ] Take success notification screenshot
- [ ] Create comparison screenshot (Figma)
- [ ] Add all to `public/screenshots/`
- [ ] Update image paths in components
- [ ] Test loading speed (< 3s)
- [ ] Optimize images (TinyPNG.com)

---

**Estimated Total Time:** 4-5 hours
**Expected Conversion Lift:** +25-30% (visual proof is powerful)

**Start with:** Demo video (2 hours) → Biggest impact
