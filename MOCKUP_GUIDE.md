# Guide Rapide : Ajouter des Mockups Professionnels

## 🎯 Priorité des Images (par impact conversion)

### 1. **Extension Chrome en action** (CRITIQUE)
**Emplacement:** `HomePage.tsx` - Section "Extension Chrome"
**Dimensions:** 800x600px
**Contenu à montrer:**
- Browser avec extension popup ouverte
- Page web réelle (ex: article Medium)
- Bouton "Clip to Notion" visible
- Notion workspace en arrière-plan

**Outils rapides:**
- Figma + plugin "Browser Mockup"
- Capture d'écran réelle de ton prototype
- Canva template "Chrome Extension"

---

### 2. **Desktop App Interface** (HAUTE)
**Emplacement:** `HomePage.tsx` - Section "Desktop App"
**Dimensions:** 1200x900px
**Contenu à montrer:**
- Interface de l'app desktop
- Liste de clips avec preview
- Queue offline visible (3-4 items)
- Status "Syncing..." ou "Offline mode"

---

### 3. **Comparison "Before/After"** (HAUTE)
**Emplacement:** Nouvelle section ou `ComparisonTable`
**Dimensions:** 1000x500px (split screen)
**Contenu:**
- **Gauche:** Official clipper avec erreur "Please go online"
- **Droite:** Clipper Pro avec "Queued offline ✓"

---

### 4. **Demo Video** (30 secondes)
**Emplacement:** `HomePage.tsx` - Hero section
**Contenu:**
1. Copier du texte (3s)
2. Extension détecte (2s)
3. Clic "Clip to Notion" (2s)
4. Apparaît dans Notion (3s)
5. Mode offline demo (10s)
6. Sync automatique (5s)

**Outils:**
- OBS Studio (gratuit, screen recording)
- Loom (simple, cloud-based)
- QuickTime (macOS natif)

---

## 🚀 Méthode Rapide (2-3 heures)

### Option A: Figma (Recommandé)
```
1. Créer compte Figma gratuit
2. Chercher "Browser Extension Mockup" dans Community
3. Dupliquer template
4. Remplacer avec tes screenshots
5. Exporter PNG 2x
```

### Option B: Screenshots Réels
```
1. Ouvre Chrome DevTools
2. Resize window à 1280x800
3. Screenshot ton prototype (même incomplet)
4. Ajoute blur sur parties non finies
5. Ajoute annotations avec Figma/Canva
```

### Option C: Placeholder Amélioré (Temporaire)
```tsx
// Remplace les placeholders actuels par:
<div className="relative">
  <img 
    src="/mockups/extension-demo.png" 
    alt="Extension Chrome demo"
    className="rounded-lg shadow-2xl"
  />
  <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
    Coming Soon
  </div>
</div>
```

---

## 📁 Structure des Fichiers

```
showcase-site/
  public/
    mockups/
      extension-chrome.png      (800x600)
      desktop-app.png           (1200x900)
      comparison-before-after.png (1000x500)
      workflow-animation.gif    (800x600)
    videos/
      demo-30s.mp4             (1920x1080, <5MB)
```

---

## ✅ Checklist Avant Lancement

- [ ] Hero demo video (30s minimum)
- [ ] Extension screenshot (réel ou mockup)
- [ ] Desktop app screenshot
- [ ] Comparison image (before/after)
- [ ] Toutes images optimisées (<200KB chacune)
- [ ] Alt text descriptif pour SEO

---

## 🎨 Style Guide pour Mockups

**Couleurs:**
- Primary: Purple #9333EA → Blue #2563EB
- Accent: Orange #F97316 (urgency)
- Success: Green #10B981

**Fonts:**
- Headings: Inter Bold
- Body: Inter Regular

**Shadows:**
- Cards: `shadow-2xl` (Tailwind)
- Buttons: `shadow-lg hover:shadow-xl`

---

## 💡 Tips Pro

1. **Utilisez de vraies données** dans les mockups (pas "Lorem ipsum")
2. **Montrez le problème résolu** (pas juste l'interface)
3. **Ajoutez des annotations** ("Works offline ✓", "No errors ✓")
4. **Utilisez des curseurs** pour montrer l'interaction
5. **Ajoutez du mouvement** (GIF ou video > static image)

---

## 🔗 Ressources Gratuites

- **Mockups:** https://mockuphone.com
- **Icons:** https://lucide.dev (déjà utilisé)
- **Animations:** https://lottiefiles.com
- **Screen Recording:** https://obsproject.com
- **Image Optimization:** https://tinypng.com

---

**Temps estimé:** 2-3 heures pour les 4 images prioritaires
**Impact conversion:** +50-80% selon Product Hunt data
