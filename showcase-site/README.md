# Notion Clipper - Showcase Site

Site vitrine moderne avec design Apple/Notion pour Notion Clipper.

## Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + PostCSS
- **Routing:** React Router DOM
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **TypeScript:** Strict mode

## Installation

```bash
# Installer les dépendances
pnpm install

# Créer .env
cp .env.example .env

# Éditer .env avec vos credentials
nano .env
```

## Développement

```bash
# Démarrer le serveur de développement
pnpm dev

# Accéder à http://localhost:3000
```

## Build pour Production

```bash
# Build
pnpm build

# Preview du build
pnpm preview
```

## Déploiement VPS

Voir `/VPS_DEPLOYMENT_GUIDE.md` pour les instructions complètes.

Le site sera servi par Nginx depuis `dist/` après le build.

## Structure

```
src/
├── components/     # Composants réutilisables
│   └── Header.tsx
├── pages/          # Pages du site
│   ├── HomePage.tsx
│   ├── PricingPage.tsx
│   ├── AuthSuccess.tsx
│   └── AuthError.tsx
├── styles/         # Styles globaux
│   └── index.css
├── App.tsx         # App principal avec routes
└── main.tsx        # Point d'entrée
```

## Features

### Design System

- ✅ Apple-inspired palette de couleurs
- ✅ Typography scale cohérente
- ✅ Spacing système (multiples de 4px)
- ✅ Glass morphism effects
- ✅ Smooth animations
- ✅ Dark mode support

### Pages

- ✅ Homepage avec hero section
- ✅ Features grid
- ✅ Pricing page (Free vs Premium)
- ✅ Auth callbacks (success/error)

### Components

- ✅ Header avec navigation responsive
- ✅ Footer
- ✅ Cards avec hover effects
- ✅ Buttons (primary, secondary)

### Responsive

- ✅ Mobile-first design
- ✅ Breakpoints: sm (640px), md (768px), lg (1024px)
- ✅ Touch-friendly interactions

## Variables d'Environnement

```env
VITE_API_URL=http://YOUR_VPS_IP/api
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Customization

### Colors

Éditer `tailwind.config.js` pour modifier la palette :

```js
theme: {
  extend: {
    colors: {
      gray: { /* ... */ },
      primary: { /* ... */ },
    }
  }
}
```

### Typography

Éditer `tailwind.config.js` :

```js
fontFamily: {
  sans: ['-apple-system', 'BlinkMacSystemFont', ...],
}
```

## License

MIT
