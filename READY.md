# 🚀 READY - Guide de Démarrage Rapide

> **NotionClipperWeb** - Backend API optimisé + Site vitrine
> Design Apple/Notion • OAuth + Stripe • Analytics + Quotas

---

## ✨ Ce qui a été fait (Optimisation Complète)

### 📊 Base de Données

**Optimisation radicale** : 11 tables → **5 tables** (-55% de complexité)

| Tables Supprimées ❌ | Raison |
|---------------------|--------|
| `users` | Doublon avec `user_profiles` |
| `notion_workspaces` | Doublon avec `notion_connections` |
| `clip_history` | Géré par l'app desktop |
| `user_favorites` | Feature UI desktop |
| `mode_sessions` | Non prioritaire |
| `notion_api_keys` | Non utilisé (OAuth only) |

| Tables Essentielles ✅ | Utilité |
|----------------------|---------|
| `user_profiles` | Auth Google/Notion/Email |
| `subscriptions` | Stripe billing + tier |
| `usage_records` | Quotas mensuels |
| `usage_events` | Analytics détaillés |
| `notion_connections` | Token chiffré (AES-256) |

### 🔧 Migrations SQL Créées

6 migrations professionnelles ont été créées :

```bash
supabase/migrations/
├── 20251118000000_drop_unused_tables.sql       # Nettoyage
├── 20251118000001_create_optimized_schema.sql  # 5 tables + constraints
├── 20251118000002_create_indexes.sql           # 28 indexes performance
├── 20251118000003_create_rpc_functions.sql     # 4 RPC functions
├── 20251118000004_create_triggers.sql          # 5 triggers automation
└── 20251118000005_create_rls_policies.sql      # 13 RLS policies
```

### 🛡️ Sécurité Renforcée

- ✅ **Token Notion chiffré** (bug critique corrigé dans `auth.service.ts`)
- ✅ **RLS policies complètes** (users peuvent SEULEMENT lire leurs données)
- ✅ **Service role bypass** (backend VPS a accès complet)
- ✅ **Zero-trust model** (anon = NO ACCESS)

### ⚡ Performance

- ✅ **28 indexes** (btree + gin) pour queries <10ms
- ✅ **4 RPC functions** pour usage tracking atomique
- ✅ **5 triggers** pour automation (auto-subscription, timestamps, etc.)
- ✅ **Quota enforcement** avant action (prevent abuse)

---

## 🎯 Architecture Optimisée

```
┌──────────────────────────────────────────────────────┐
│                 DESKTOP APP (Electron)                │
│  ┌──────────────────┐  ┌──────────────────┐         │
│  │ Notion API       │  │ Local Storage    │         │
│  │ (Direct calls)   │  │ (Clip history)   │         │
│  └──────────────────┘  └──────────────────┘         │
│           │                      │                    │
│           │ OAuth + Usage        │                    │
│           ▼ tracking             │                    │
│  ┌──────────────────────────────────────┐           │
│  │    BACKEND VPS (Node.js/Express)     │           │
│  ├──────────────────────────────────────┤           │
│  │ • OAuth Google/Notion/Email          │           │
│  │ • Stripe Checkout + Webhooks         │           │
│  │ • Usage Tracking (RPC functions)     │           │
│  │ • Quota Enforcement                  │           │
│  │ • Analytics API                      │           │
│  └──────────────────────────────────────┘           │
│           │                                           │
│           ▼                                           │
│  ┌──────────────────────────────────────┐           │
│  │      SUPABASE (PostgreSQL)           │           │
│  │ • user_profiles                      │           │
│  │ • subscriptions (Stripe)             │           │
│  │ • usage_records (quotas)             │           │
│  │ • usage_events (analytics)           │           │
│  │ • notion_connections (encrypted)     │           │
│  └──────────────────────────────────────┘           │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│            SHOWCASE SITE (React + Vite)              │
│  • Landing page                                      │
│  • Pricing                                           │
│  • Dashboard (usage analytics)                       │
│  • Settings                                          │
└──────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (5 minutes)

### 1️⃣ Prérequis

```bash
Node.js 20 LTS
pnpm 8.x
Comptes: Supabase, Stripe, Google OAuth, Notion OAuth
```

### 2️⃣ Appliquer les Migrations SQL

**Option A : Via Supabase Dashboard** (Recommandé pour développement)

1. Ouvrir Supabase Dashboard : https://app.supabase.com
2. Aller dans **SQL Editor**
3. Exécuter les migrations dans l'ordre :

```bash
# 1. Drop unused tables
cat supabase/migrations/20251118000000_drop_unused_tables.sql

# 2. Create optimized schema
cat supabase/migrations/20251118000001_create_optimized_schema.sql

# 3. Create indexes
cat supabase/migrations/20251118000002_create_indexes.sql

# 4. Create RPC functions
cat supabase/migrations/20251118000003_create_rpc_functions.sql

# 5. Create triggers
cat supabase/migrations/20251118000004_create_triggers.sql

# 6. Create RLS policies
cat supabase/migrations/20251118000005_create_rls_policies.sql
```

**Option B : Via Supabase CLI** (Recommandé pour production)

```bash
# Installer Supabase CLI
npm install -g supabase

# Login
supabase login

# Lier le projet
supabase link --project-ref YOUR_PROJECT_REF

# Appliquer toutes les migrations
supabase db push
```

### 3️⃣ Configuration Backend

```bash
cd backend

# Installer les dépendances
pnpm install

# Copier .env
cp .env.example .env

# Éditer .env avec vos credentials
nano .env
```

**Variables essentielles** :

```env
# Supabase
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  # ⚠️ SERVICE_ROLE_KEY (pas anon key!)

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# Notion OAuth
NOTION_CLIENT_ID=...
NOTION_CLIENT_SECRET=...
NOTION_REDIRECT_URI=http://localhost:3001/api/auth/notion/callback

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PRICE_ID_MONTHLY=price_...
STRIPE_PREMIUM_PRICE_ID_ANNUAL=price_...

# JWT
JWT_SECRET=$(openssl rand -base64 32)

# Token Encryption (AES-256-GCM)
TOKEN_ENCRYPTION_KEY=$(openssl rand -base64 32)
```

### 4️⃣ Lancer le Backend

```bash
# Build
pnpm build

# Dev mode (hot reload)
pnpm dev

# Production mode (PM2)
pnpm start
```

Backend accessible sur : **http://localhost:3001/api**

### 5️⃣ Configuration Frontend (Showcase Site)

```bash
cd showcase-site

# Installer les dépendances
pnpm install

# Copier .env
cp .env.example .env

# Éditer .env
nano .env
```

**Variables frontend** :

```env
VITE_API_URL=http://localhost:3001/api
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...  # ⚠️ ANON KEY (pas service role!)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 6️⃣ Lancer le Frontend

```bash
# Dev mode
pnpm dev

# Frontend accessible sur : http://localhost:5173

# Build production
pnpm build
```

---

## 🧪 Tests Rapides

### Test 1 : Health Check

```bash
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"...","service":"notion-clipper-backend"}
```

### Test 2 : OAuth Google

1. Ouvrir : http://localhost:3001/api/auth/google
2. Login avec Google
3. Redirection vers frontend avec token JWT
4. Vérifier dans Supabase Dashboard → Table `user_profiles`

### Test 3 : Usage Tracking (RPC)

```bash
# Depuis Supabase SQL Editor
SELECT * FROM increment_usage_counter(
  'USER_UUID_HERE',
  'clips',
  1
);

# Vérifier : Table usage_records
SELECT * FROM usage_records ORDER BY created_at DESC LIMIT 1;
```

### Test 4 : Quota Check

```bash
# RPC function
SELECT * FROM get_current_quota('USER_UUID_HERE');

# Expected: tier, clips_limit, clips_used, etc.
```

---

## 📊 Quotas par Tier

| Feature | Free | Premium |
|---------|------|---------|
| Clips/mois | 100 | Illimité (-1) |
| Files/mois | 10 | Illimité (-1) |
| Focus mode | 60 min | Illimité (-1) |
| Compact mode | 30 min | Illimité (-1) |

---

## 🔐 Sécurité Checklist

- ✅ **SERVICE_ROLE_KEY** jamais exposé au frontend
- ✅ **TOKEN_ENCRYPTION_KEY** stocké dans .env (non versionné)
- ✅ **Notion tokens** chiffrés avant DB (AES-256-GCM)
- ✅ **RLS policies** activées sur toutes les tables
- ✅ **CORS** configuré (whitelist origins)
- ✅ **Rate limiting** (15 min window, 100 req max)
- ✅ **Helmet.js** headers sécurisés

---

## 📈 Monitoring

### Logs Backend

```bash
# Logs en temps réel
tail -f backend/logs/combined.log

# Erreurs uniquement
tail -f backend/logs/error.log
```

### Supabase Dashboard

1. **Auth** : https://app.supabase.com → Authentication → Users
2. **Database** : Table Editor → Vérifier les tables
3. **Logs** : Logs → API Logs

### Stripe Dashboard

1. **Webhooks** : https://dashboard.stripe.com → Developers → Webhooks
2. **Customers** : Customers → Voir les subscriptions
3. **Test Mode** : Activer "View test data"

---

## 🐛 Troubleshooting

### Erreur : "No subscription found for user"

```bash
# Vérifier que le trigger auto-subscription fonctionne
SELECT * FROM subscriptions WHERE user_id = 'USER_UUID';

# Si vide, créer manuellement :
INSERT INTO subscriptions (user_id, tier, status)
VALUES ('USER_UUID', 'free', 'active');
```

### Erreur : "Failed to decrypt token"

```bash
# Vérifier TOKEN_ENCRYPTION_KEY dans .env
echo $TOKEN_ENCRYPTION_KEY | base64 -d | wc -c
# Expected: 32 bytes (256 bits)

# Regénérer si nécessaire
openssl rand -base64 32
```

### Erreur : "RPC function not found"

```bash
# Vérifier que la migration 003 est appliquée
SELECT proname FROM pg_proc WHERE proname LIKE 'increment_usage%';

# Ré-appliquer si nécessaire
cat supabase/migrations/20251118000003_create_rpc_functions.sql | psql
```

---

## 📚 Documentation Complète

- **API_GUIDE.md** : Documentation API complète (endpoints, auth, webhooks)
- **TODO_FRONTEND.md** : Plan frontend détaillé (12-15h, pages, composants)
- **SETUP_GUIDE.md** : Déploiement VPS Oracle (production-ready)

---

## ✅ Next Steps

1. ✅ **Lire API_GUIDE.md** pour comprendre tous les endpoints
2. ✅ **Lire TODO_FRONTEND.md** pour développer le site vitrine
3. ✅ **Tester les flux OAuth** (Google + Notion)
4. ✅ **Configurer Stripe webhooks** (mode test)
5. ✅ **Développer les pages frontend** (Dashboard, Pricing, Settings)

---

**Made with ❤️ by NotionClipper Team**
*Design Apple/Notion • Quality-first • Security-first*
