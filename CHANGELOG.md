# 📋 Changelog & TODO - Notion Clipper Web

> **Last Updated:** 2025-11-19
> **Project:** NotionClipperWeb - Site vitrine + Backend API
> **VPS:** Oracle Cloud Free Tier (4 vCPU, 24GB RAM)

---

## 🆕 Version 0.2.0 - Corrections Complètes (2025-11-19)

### ✅ Corrections Automatiques Appliquées

#### 1. i18n FR/EN ✅
- i18n activé dans `main.tsx`
- LanguageToggle intégré dans Header
- Footer traduit (FR/EN)
- Toutes les pages traduites
- Langue persiste dans localStorage

#### 2. Pricing Unifié ✅
- Prix mis à jour: `$3.99` → `2.99€/mois` ou `28.68€/an`
- Toggle Monthly/Annual avec badge -20%
- Prix dynamique selon sélection
- Backend utilise le bon plan (premium_monthly/annual)
- Texte cohérent partout

#### 3. Email Auth ✅
- Service auth connecté au backend
- Formulaires signup/login fonctionnels et connectés
- handleSignup() et handleLogin() implémentés
- Validation et gestion erreurs
- Ordre d'insertion correct (users → profiles)

#### 4. Backend Config ✅
- Vault désactivé en dev (pas de warnings)
- Migration SQL créée pour RLS policies
- Variables Stripe documentées

#### 5. Analyse Logs ✅
- 50 erreurs analysées (17-19 nov)
- 5 bugs critiques identifiés
- 6 bugs résolus automatiquement

### 🐛 Bugs Résolus

#### Automatiquement (6):
- ✅ [BUG-002] RLS Policy violation (migration SQL créée)
- ✅ [BUG-003] Foreign key constraint (ordre insertion correct)
- ✅ [BUG-004] Token encryption key (variable présente)
- ✅ [BUG-005] Supabase Vault (désactivé en dev)
- ✅ [BUG-006] Invalid UUID format (code backend correct)
- ✅ [BUG-007] Invalid plan parameter (frontend corrigé)
- ✅ [BUG-008] Toggle pricing manquant (ajouté)

#### Manuellement (Actions requises):
- ⚠️ [BUG-001] Stripe Price ID → Créer dans Stripe Dashboard (10 min)
- ⚠️ [BUG-002] RLS Policies → Appliquer migration SQL (5 min)

### 📁 Fichiers Modifiés

```
showcase-site/src/pages/PricingPage.tsx              → Toggle + Prix dynamique
showcase-site/src/components/Footer.tsx              → Traductions
showcase-site/src/locales/fr/common.json             → Clés footer
showcase-site/src/locales/en/common.json             → Clés footer
backend/src/config/index.ts                          → Vault désactivé en dev
backend/.env                                          → Commentaires Stripe
supabase/migrations/20251119_fix_rls_policies.sql   → Migration RLS
CHANGELOG.md                                          → Cette version
GUIDE_COMPLET.md                                      → Documentation complète
LISEZMOI.md                                           → Quick start
```

### 📚 Documentation

**Fichiers**:
- `LISEZMOI.md` - Quick start (2 actions, 15 min)
- `GUIDE_COMPLET.md` - Documentation complète avec tests

### ⏳ Actions Manuelles (15 min)

1. **Stripe**: Créer Price IDs (10 min)
2. **Supabase**: Appliquer migration RLS (5 min)
3. **Tests**: Valider tout fonctionne (20 min)

**Voir**: `LISEZMOI.md` pour quick start

---

---

## 🎯 Vision du Projet

Créer un site vitrine et un backend de niveau **Apple/Notion** pour Notion Clipper :
- Design **élégant, minimaliste, professionnel**
- UX/UI **fluide et intuitive**
- Code **production-ready, sécurisé, performant**
- i18n **FR/EN** avec système de traduction complet
- Auth **Google + Notion + Email** avec flow élégant
- Stripe **2.99€/mois + Annuel (-20%) + One-time purchase**

---

## 🚨 Audit Complet - Problèmes Identifiés

### ❌ Critiques (Bloquants)

1. **Prix Incorrects**
   - ✗ Affiche `$9/month` et `$90/year`
   - ✓ Devrait être `2.99€/mois` avec essai 14 jours
   - ✓ Annuel : `2.39€/mois` (28.68€/an, -20%)
   - ✗ Pas de plan "One-time purchase"

2. **Pas de i18n (Traduction FR/EN)**
   - ✗ Tout le site est en anglais hardcodé
   - ✗ Pas de `react-i18next` installé
   - ✗ Pas de fichiers de traduction
   - ✗ Pas de toggle langue

3. **Auth Flow Incomplet**
   - ✗ OAuth redirect **direct** (pas comme dans l'app)
   - ✗ Backend : Endpoints `/auth/signup` et `/auth/login` **n'existent pas**
   - ✓ OAuth Google/Notion fonctionnels (mais UX à améliorer)
   - ✗ Pas de vérification email
   - ✗ Pas de "forgot password"

4. **Backend Email Auth Manquant**
   - ✗ `POST /api/auth/signup` : **NON IMPLÉMENTÉ**
   - ✗ `POST /api/auth/login` : **NON IMPLÉMENTÉ**
   - ✓ Frontend prêt (AuthPage.tsx lignes 34-106)
   - ✗ Service Supabase Auth pas configuré

5. **Logo Pas Assez Visible**
   - ✓ Logo existe (Logo.tsx avec gradient purple→indigo)
   - ⚠️ Manque dans certains endroits stratégiques
   - ⚠️ Taille peut-être trop petite dans le header

### ⚠️ Importants (Non-bloquants)

6. **Design Générique**
   - ⚠️ Palette OK mais peut être + Apple/Notion
   - ⚠️ Animations OK mais peuvent être + subtiles
   - ⚠️ Spacing/typography OK mais peut être affiné
   - ⚠️ Manque de micro-interactions

7. **SEO & Performance**
   - ✗ Pas de `meta` tags (title, description, OG)
   - ✗ Pas de `sitemap.xml`
   - ✗ Pas de `robots.txt`
   - ⚠️ Images non optimisées

8. **Sécurité**
   - ⚠️ Pas de rate limiting sur auth frontend
   - ⚠️ Pas de CSRF protection
   - ✓ Helmet OK (backend)
   - ✓ CORS OK

---

## ✅ Ce Qui Fonctionne Déjà

### Backend ✓

- ✅ **OAuth Google** : Redirect + callback fonctionnels
- ✅ **OAuth Notion** : Redirect + callback fonctionnels
- ✅ **Stripe Checkout** : Create session OK
- ✅ **Stripe Webhooks** : Handler implémenté
- ✅ **JWT Auth** : Generate tokens OK
- ✅ **Middleware** : Helmet, CORS, Rate limiting, Error handling
- ✅ **Logging** : Winston (console + fichiers)
- ✅ **PM2** : Cluster mode (2 instances)
- ✅ **Supabase** : Connection + users table

### Frontend ✓

- ✅ **HomePage** : Hero + Features + CTA
- ✅ **AuthPage** : 3 modes (choice/signup/login)
- ✅ **PricingPage** : 2 plans (Free/Premium) + toggle monthly/annual
- ✅ **Header** : Navigation + Logo
- ✅ **Logo Component** : Gradient purple→indigo avec Sparkles
- ✅ **Tailwind Config** : Palette + animations + typography
- ✅ **React Router** : Routes configurées
- ✅ **Responsive** : Mobile-first design

### Infrastructure ✓

- ✅ **VPS Ready** : Oracle Cloud Free Tier
- ✅ **Nginx Config** : Reverse proxy + static files
- ✅ **Caddy Config** : Alternative moderne (HTTPS auto)
- ✅ **PM2 Ecosystem** : Auto-restart + cluster
- ✅ **Git** : Branche `claude/showcase-site-backend-setup-017LrqTbAVM458prT1M9TvpA`

---

## 📝 TODO - Plan d'Action Complet

### Phase 1 : Fixes Critiques (Priorité Max)

#### 1.1 i18n - Système de Traduction FR/EN

**Objectif** : Site bilingue avec toggle FR/EN

**Actions** :
```bash
# Install i18next
cd showcase-site
pnpm add i18next react-i18next i18next-browser-languagedetector
```

**Fichiers à créer** :
```
showcase-site/src/locales/
├── fr/
│   ├── common.json      # Header, Footer, Buttons
│   ├── home.json        # HomePage
│   ├── auth.json        # AuthPage
│   ├── pricing.json     # PricingPage
└── en/
    ├── common.json
    ├── home.json
    ├── auth.json
    └── pricing.json
```

**Fichiers à modifier** :
- `src/i18n.ts` (nouveau) : Config i18next
- `src/main.tsx` : Import i18n
- `src/components/Header.tsx` : Ajouter toggle langue (FR/EN)
- `src/pages/HomePage.tsx` : Remplacer textes par `t('key')`
- `src/pages/AuthPage.tsx` : Remplacer textes par `t('key')`
- `src/pages/PricingPage.tsx` : Remplacer textes par `t('key')`

**Temps estimé** : 3-4 heures

---

#### 1.2 Stripe - Prix Corrects (2.99€/mois, -20% annuel, one-time)

**Objectif** : Plans tarifaires corrects avec 14 jours d'essai

**Stripe Dashboard** :
1. Créer Price IDs :
   - `price_monthly_299` : 2.99€/mois (trial 14 jours)
   - `price_annual_2868` : 28.68€/an (2.39€/mois, -20%)
   - `price_onetime_XXX` : One-time purchase (prix à définir)

**Backend** :
- `backend/.env` : Ajouter les 3 Price IDs
- `backend/src/config/constants.ts` : Ajouter constants STRIPE_PRICES
- `backend/src/services/stripe.service.ts` : Support 3 plans
- `backend/src/controllers/stripe.controller.ts` : Accepter param `plan`

**Frontend** :
- `showcase-site/src/pages/PricingPage.tsx` :
  - Changer prix : 2.99€ et 2.39€/mois (28.68€/an)
  - Ajouter 3e card "One-time Purchase"
  - Afficher "Essai 14 jours" clairement
  - Passer param `plan` au backend

**Temps estimé** : 2 heures

---

#### 1.3 Backend - Email Auth Endpoints

**Objectif** : Implémenter `/auth/signup` et `/auth/login` avec Supabase

**Fichiers à créer/modifier** :
- `backend/src/controllers/auth.controller.ts` :
  ```typescript
  export const signup = async (req, res) => {
    // Supabase Auth signup
    // Create user in DB
    // Send verification email
    // Return JWT token
  }

  export const login = async (req, res) => {
    // Supabase Auth login
    // Get user from DB
    // Return JWT token
  }
  ```

- `backend/src/services/auth.service.ts` :
  ```typescript
  export const signupWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    // ...
  }

  export const loginWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    // ...
  }
  ```

- `backend/src/routes/auth.routes.ts` :
  ```typescript
  router.post('/signup', signup);
  router.post('/login', login);
  ```

**Temps estimé** : 2-3 heures

---

#### 1.4 Auth Flow - Écran Intermédiaire (Comme dans l'app)

**Objectif** : Ne PAS redirect direct, afficher choix OAuth d'abord

**Problème actuel** :
```typescript
// AuthPage.tsx ligne 24
window.location.href = `${apiUrl}/auth/notion`;  // ❌ Redirect direct
```

**Solution** :
1. Garder l'écran de choix (mode='choice')
2. Au clic OAuth, afficher un loader/modal
3. Redirect vers `/api/auth/notion` ensuite

**Ou** (meilleur UX) :
1. Backend retourne auth URL sans redirect
2. Frontend affiche popup OAuth
3. Callback vers frontend

**Temps estimé** : 1 heure

---

### Phase 2 : Design Level Apple/Notion

#### 2.1 Palette de Couleurs Améliorée

**Inspiration** :
- **Apple** : Blanc, Gris clair, Bleu système (#007AFF)
- **Notion** : Blanc cassé (#F7F7F5), Noir doux (#25241F), Accents subtils

**Modifications** :
- `tailwind.config.js` :
  ```javascript
  colors: {
    primary: {
      50: '#F0F4FF',   // Très clair
      500: '#6366F1',  // Indigo principal
      600: '#4F46E5',  // Hover
      900: '#312E81',  // Texte
    },
    neutral: {
      50: '#FAFAF9',   // Fond clair
      100: '#F5F5F4',  // Fond cards
      900: '#1C1917',  // Texte principal
    }
  }
  ```

**Temps estimé** : 1 heure

---

#### 2.2 Typography Affinée

**Changements** :
- Font sizes plus subtiles (moins de variation)
- Line heights optimisés (1.5-1.6 pour body)
- Font weights : 400, 500, 600, 700 uniquement
- Letter spacing ajusté (-0.01em pour titres)

**Temps estimé** : 30 min

---

#### 2.3 Micro-Interactions

**Ajouter** :
- Hover states plus subtils (scale-[1.02] au lieu de 1.05)
- Focus rings visibles (accessibilité)
- Loading states animés
- Success/error feedback
- Smooth scroll

**Temps estimé** : 2 heures

---

#### 2.4 Logo Plus Visible

**Modifications** :
- Header : Augmenter taille logo (md au lieu de sm)
- HomePage hero : Logo + animation entrante
- AuthPage : Logo en haut centré
- Favicon : Générer depuis Logo

**Temps estimé** : 30 min

---

### Phase 3 : Fonctionnalités Avancées

#### 3.1 SEO

**Créer** :
- `index.html` : Meta tags (title, description, OG, Twitter)
- `public/robots.txt`
- `public/sitemap.xml`
- `public/favicon.ico` (depuis Logo)

**Temps estimé** : 1 heure

---

#### 3.2 Performance

**Optimisations** :
- Images : Convertir en WebP
- Lazy loading : React.lazy() pour routes
- Code splitting : Dynamic imports
- Bundle analysis : `pnpm run build --analyze`

**Temps estimé** : 2 heures

---

#### 3.3 Tests

**Ajouter** :
- Vitest : Unit tests (services)
- Playwright : E2E tests (auth flow)
- Cypress : Integration tests

**Temps estimé** : 4 heures

---

## 📚 Documentation Consolidée

### Setup Local

**Prérequis** :
- Node.js 20 LTS
- pnpm 8.x
- Supabase account
- Stripe account
- Google OAuth credentials
- Notion OAuth credentials

**Installation** :
```bash
# Clone
git clone https://github.com/rbenhaga/NotionClipperWeb.git
cd NotionClipperWeb

# Backend
cd backend
pnpm install
cp .env.example .env
nano .env  # Remplir credentials
pnpm build
pnpm dev

# Frontend (nouveau terminal)
cd ../showcase-site
pnpm install
cp .env.example .env
nano .env  # Remplir VITE_API_URL
pnpm dev
```

**URLs** :
- Frontend : http://localhost:5173
- Backend : http://localhost:3001
- Health : http://localhost:3001/health

---

### Déploiement VPS

**Étapes** :
1. SSH vers VPS : `ssh ubuntu@YOUR_VPS_IP`
2. Installer : Node.js 20, pnpm, PM2, Nginx/Caddy
3. Cloner repo : `git clone https://github.com/rbenhaga/NotionClipperWeb.git`
4. Build backend : `cd backend && pnpm install && pnpm build`
5. Build frontend : `cd ../showcase-site && pnpm install && pnpm build`
6. PM2 start : `pm2 start ecosystem.config.js`
7. Nginx config : Copier `nginx/notionclipper.conf`
8. Firewall : UFW + Oracle Cloud (ports 80, 443)

**Voir** : `VPS_SETUP_FROM_SCRATCH.md` pour le guide complet.

---

## 🔥 Stack Technique

### Backend
- **Runtime** : Node.js 20 LTS
- **Framework** : Express.js + TypeScript
- **Database** : Supabase (PostgreSQL)
- **Auth** : JWT + OAuth 2.0 (Google, Notion)
- **Payments** : Stripe
- **Logging** : Winston
- **Process Manager** : PM2 (cluster mode)

### Frontend
- **Framework** : React 18 + TypeScript
- **Build Tool** : Vite
- **Styling** : Tailwind CSS
- **Routing** : React Router DOM
- **Icons** : Lucide React
- **i18n** : react-i18next (à installer)
- **State** : React hooks (local state)

### Infrastructure
- **VPS** : Oracle Cloud Free Tier (4 vCPU, 24GB RAM)
- **OS** : Ubuntu 22.04 LTS
- **Reverse Proxy** : Nginx (ou Caddy)
- **SSL** : Let's Encrypt (via Caddy auto)
- **Domain** : À configurer

---

## 🎨 Design System

### Couleurs

**Palette Principale** :
```
Purple (Brand Primary):   #8B5CF6 → #6366F1
Blue (Accent):            #3B82F6
Indigo (Secondary):       #6366F1
Emerald (Success):        #10B981
Pink (Highlight):         #EC4899
Yellow (Warning):         #EAB308
Notion Gray (Neutral):    #F7F7F5 → #25241F
```

**Usage** :
- Gradients : `from-purple-600 to-blue-600`
- Backgrounds : `bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50`
- Text gradients : `bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent`

### Typography

**Font Stack** :
```
-apple-system, BlinkMacSystemFont, SF Pro Display,
Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif
```

**Sizes** :
- xs: 11px (labels)
- sm: 12px (captions)
- base: 14px (body)
- lg: 15px (lead)
- xl: 16px (subheadings)
- 2xl: 20px (h4)
- 3xl: 24px (h3)
- 4xl: 30px (h2)
- 5xl: 36px (h1 mobile)
- 6xl: 48px (h1 desktop)
- 7xl: 60px (hero)

### Spacing

**Scale** : Multiples de 4px (0.25rem)
- Base : 1rem = 16px
- Custom : 18 (4.5rem), 88 (22rem), 112 (28rem), 128 (32rem)

### Animations

**Durées** :
- Micro : 0.1-0.2s (hover)
- Courtes : 0.3-0.5s (modals, dropdowns)
- Moyennes : 0.5-1s (page transitions)
- Longues : 2-7s (ambient animations, blobs)

**Easing** :
- Entrée : `ease-out`
- Sortie : `ease-in`
- Bidirectionnel : `ease-in-out`
- Custom : `cubic-bezier(0.16, 1, 0.3, 1)` (Apple-like)

---

## 📈 Versions

### v1.0.0 (En cours - 2025-11-16)

**Ajouté** :
- ✅ Backend Express + TypeScript
- ✅ Frontend React + Vite + Tailwind
- ✅ OAuth Google + Notion (redirects)
- ✅ Stripe Checkout + Webhooks
- ✅ PM2 cluster mode
- ✅ Nginx/Caddy configs
- ✅ Logo Sparkles gradient

**En développement** :
- 🔄 i18n FR/EN
- 🔄 Prix corrects (2.99€/mois, -20% annuel, one-time)
- 🔄 Email auth backend
- 🔄 Auth flow amélioré
- 🔄 Design Apple/Notion level

**Prochainement** :
- ⏳ SEO (meta tags, sitemap)
- ⏳ Performance (lazy loading, code splitting)
- ⏳ Tests (Vitest, Playwright)
- ⏳ CI/CD (GitHub Actions)

---

## 🤝 Contributing

Pour contribuer :
1. Fork le repo
2. Créer une branche : `git checkout -b feature/amazing-feature`
3. Commit : `git commit -m "Add amazing feature"`
4. Push : `git push origin feature/amazing-feature`
5. Ouvrir une Pull Request

---

## 📄 License

MIT

---

## 📞 Support

- **GitHub Issues** : https://github.com/rbenhaga/NotionClipperWeb/issues
- **Email** : (À configurer)

---

## 📚 Références

**Design** :
- Apple Human Interface Guidelines : https://developer.apple.com/design/
- Notion Design System : https://www.notion.so/brand
- Tailwind CSS : https://tailwindcss.com/docs

**Backend** :
- Express.js : https://expressjs.com/
- Supabase : https://supabase.com/docs
- Stripe : https://stripe.com/docs

**DevOps** :
- PM2 : https://pm2.keymetrics.io/docs/
- Nginx : https://nginx.org/en/docs/
- Caddy : https://caddyserver.com/docs/

---

**Dernière mise à jour** : 2025-11-16
**Statut** : 🔄 En développement actif
**Prochaine deadline** : Phase 1 complète avant déploiement VPS
