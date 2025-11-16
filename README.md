# 🚀 Notion Clipper Web

> **Site vitrine professionnel + Backend API pour Notion Clipper**
> Design Apple/Notion • i18n FR/EN • OAuth + Email Auth • Stripe Payments

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-20.x-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

---

## ✨ Features

- 🎨 **Design Apple/Notion** : Interface élégante et minimaliste
- 🌍 **i18n FR/EN** : Traduction complète français/anglais (en cours)
- 🔐 **Auth Multi-Provider** : Google + Notion + Email/Password
- 💳 **Stripe Payments** : 2.99€/mois • Annuel -20% • One-time purchase
- ⚡ **Performance** : React 18 + Vite + Tailwind CSS
- 🔒 **Sécurité** : JWT + OAuth 2.0 + Helmet + Rate limiting
- 📱 **Responsive** : Mobile-first design
- 🚀 **Production-Ready** : PM2 cluster + Nginx/Caddy + SSL

---

## 📁 Structure

```
NotionClipperWeb/
├── backend/              # API Node.js/Express
│   ├── src/
│   │   ├── config/       # Configuration
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── types/        # TypeScript types
│   │   ├── utils/        # Utilities
│   │   └── server.ts     # Entry point
│   ├── logs/             # Winston logs
│   ├── .env.example      # Environment variables template
│   └── ecosystem.config.js  # PM2 config
│
├── showcase-site/        # Frontend React
│   ├── src/
│   │   ├── assets/       # Logo, images
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── locales/      # i18n translations (en cours)
│   │   ├── styles/       # Global CSS
│   │   ├── App.tsx       # App with routes
│   │   └── main.tsx      # Entry point
│   ├── public/           # Static assets
│   ├── .env.example      # Vite env vars
│   └── tailwind.config.js  # Tailwind config
│
├── nginx/                # Nginx configs
├── caddy/                # Caddy configs (alternative)
├── CHANGELOG.md          # Changelog & TODO complet
└── README.md             # Ce fichier
```

---

## 🚀 Quick Start

### Prérequis

- **Node.js** 20 LTS
- **pnpm** 8.x (ou npm)
- **Comptes** : Supabase, Stripe, Google OAuth, Notion OAuth

### Installation Locale

```bash
# 1. Cloner le repo
git clone https://github.com/rbenhaga/NotionClipperWeb.git
cd NotionClipperWeb

# 2. Backend
cd backend
pnpm install
cp .env.example .env
nano .env  # Remplir vos credentials
pnpm build
pnpm dev   # Démarre sur http://localhost:3001

# 3. Frontend (nouveau terminal)
cd ../showcase-site
pnpm install
cp .env.example .env
nano .env  # Ajouter VITE_API_URL=http://localhost:3001/api
pnpm dev   # Démarre sur http://localhost:5173
```

### URLs de Développement

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3001/api
- **Health Check** : http://localhost:3001/health

---

## 🔐 Configuration

### Backend `.env`

```env
# Server
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# Frontend
FRONTEND_URL=http://localhost:5173

# Supabase
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# Notion OAuth
NOTION_CLIENT_ID=your_client_id
NOTION_CLIENT_SECRET=your_client_secret
NOTION_REDIRECT_URI=http://localhost:3001/api/auth/notion/callback

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PRICE_ID=price_...

# JWT
JWT_SECRET=your_random_secret  # openssl rand -base64 32
TOKEN_ENCRYPTION_KEY=your_encryption_key
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:3001/api
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🏗️ Build pour Production

### Backend

```bash
cd backend
pnpm install --prod
pnpm build
# Les fichiers buildés sont dans dist/
```

### Frontend

```bash
cd showcase-site
pnpm install
pnpm build
# Les fichiers buildés sont dans dist/
```

---

## 🚀 Déploiement VPS

**Guide complet** : Voir `CHANGELOG.md` section "Déploiement VPS"

**Résumé** :
1. Provisionner VPS (Oracle Cloud Free Tier recommandé)
2. Installer Node.js 20, pnpm, PM2, Nginx/Caddy
3. Cloner le repo et build backend + frontend
4. Configurer PM2 pour auto-restart
5. Configurer Nginx/Caddy comme reverse proxy
6. Configurer SSL avec Let's Encrypt (Caddy auto, Nginx via Certbot)
7. Ouvrir ports 80/443 dans le firewall

---

## 📚 API Routes

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| GET | `/api/auth/notion` | Initiate Notion OAuth |
| GET | `/api/auth/notion/callback` | Notion OAuth callback |
| POST | `/api/auth/signup` | Email signup (en cours) |
| POST | `/api/auth/login` | Email login (en cours) |
| POST | `/api/auth/logout` | Logout |

### Stripe

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/stripe/create-checkout-session` | Create Stripe Checkout |
| POST | `/api/stripe/create-portal` | Create Customer Portal |
| POST | `/api/webhooks/stripe` | Stripe webhooks |

### User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile (auth) |
| GET | `/api/user/subscription` | Get subscription (auth) |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

---

## 🎨 Design System

### Couleurs

```css
/* Primary Gradient */
background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);

/* Backgrounds */
.bg-gradient-soft {
  background: linear-gradient(to bottom right,
    rgb(239 246 255),
    rgb(250 245 255),
    rgb(253 242 248)
  );
}

/* Text Gradient */
.text-gradient {
  background: linear-gradient(to right, #8B5CF6, #6366F1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Typography

```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display',
             'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

/* Sizes */
--text-xs:   11px;
--text-sm:   12px;
--text-base: 14px;
--text-lg:   15px;
--text-xl:   16px;
--text-2xl:  20px;
--text-3xl:  24px;
--text-4xl:  30px;
--text-5xl:  36px;
--text-6xl:  48px;
--text-7xl:  60px;
```

### Spacing

```css
/* Custom Spacing */
--spacing-18:  4.5rem;  /* 72px */
--spacing-88:  22rem;   /* 352px */
--spacing-112: 28rem;   /* 448px */
--spacing-128: 32rem;   /* 512px */
```

---

## 🧪 Tests

```bash
# Unit tests (à venir)
cd backend
pnpm test

# E2E tests (à venir)
cd showcase-site
pnpm test:e2e
```

---

## 📊 Stack Technique

### Backend
- Node.js 20 LTS
- Express.js + TypeScript
- Supabase (PostgreSQL)
- Stripe
- JWT + OAuth 2.0
- Winston (logging)
- PM2 (process manager)

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- React Router DOM
- Lucide React (icons)
- react-i18next (en cours)

### Infrastructure
- Oracle Cloud Free Tier (4 vCPU, 24GB RAM)
- Ubuntu 22.04 LTS
- Nginx ou Caddy (reverse proxy)
- Let's Encrypt (SSL)

---

## 📝 Changelog

Voir [CHANGELOG.md](CHANGELOG.md) pour l'historique complet des changements, TODO et roadmap.

---

## 🤝 Contributing

Les contributions sont les bienvenues !

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

---

## 📄 License

MIT License - voir [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 Remerciements

- [Notion](https://notion.so) pour l'inspiration design
- [Apple](https://apple.com) pour les guidelines UX/UI
- [Tailwind CSS](https://tailwindcss.com) pour le système de design
- [Supabase](https://supabase.com) pour le backend
- [Stripe](https://stripe.com) pour les paiements

---

## 📞 Support

- **Documentation complète** : [CHANGELOG.md](CHANGELOG.md)
- **Issues** : [GitHub Issues](https://github.com/rbenhaga/NotionClipperWeb/issues)

---

**Made with ❤️ for Notion users**
