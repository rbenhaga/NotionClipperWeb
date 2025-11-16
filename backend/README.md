# Notion Clipper Backend API

Backend server pour Notion Clipper - OAuth callbacks, Stripe webhooks, et API pour le site vitrine.

## Stack Technique

- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Paiements:** Stripe
- **Process Manager:** PM2
- **Logging:** Winston

## Architecture

```
backend/
├── src/
│   ├── config/          # Configuration et constantes
│   ├── controllers/     # Controllers (handlers de routes) [À créer]
│   ├── middleware/      # Middleware Express
│   ├── routes/          # Définition des routes [À créer]
│   ├── services/        # Business logic
│   ├── types/           # Types TypeScript
│   ├── utils/           # Utilitaires
│   └── server.ts        # Point d'entrée principal
├── logs/                # Fichiers de logs
├── .env                 # Variables d'environnement (local)
└── ecosystem.config.js  # Configuration PM2
```

## Installation

```bash
# Installer les dépendances
pnpm install

# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos credentials
nano .env
```

## Configuration

Voir `.env.example` pour la liste complète des variables d'environnement requises.

**Variables critiques:**
- `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET`
- `NOTION_CLIENT_ID` et `NOTION_CLIENT_SECRET`
- `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET`
- `JWT_SECRET`

## Développement

```bash
# Mode développement (hot reload)
pnpm dev

# Build TypeScript
pnpm build

# Linter
pnpm lint

# Tests
pnpm test
```

## Production

```bash
# Build
pnpm build

# Démarrer avec PM2
pm2 start ecosystem.config.js

# Voir les logs
pm2 logs notion-clipper-backend

# Arrêter
pm2 stop notion-clipper-backend

# Restart
pm2 restart notion-clipper-backend
```

## Routes API

### Authentification

**OAuth Google:**
- `GET /api/auth/google` - Redirection vers Google OAuth
- `GET /api/auth/google/callback` - Callback après auth Google

**OAuth Notion:**
- `GET /api/auth/notion` - Redirection vers Notion OAuth
- `GET /api/auth/notion/callback` - Callback après auth Notion

### Stripe

- `POST /api/stripe/create-checkout` - Créer session Checkout
- `POST /api/stripe/create-portal` - Créer session Customer Portal
- `POST /api/webhooks/stripe` - Recevoir webhooks Stripe

### Utilisateur

- `GET /api/user/profile` - Profil utilisateur (auth requise)
- `GET /api/user/subscription` - Subscription actuelle (auth requise)

### Santé

- `GET /health` - Health check

## Sécurité

**Middleware implémentés:**
- ✅ Helmet (security headers)
- ✅ CORS avec origins restreintes
- ✅ Rate limiting (express-rate-limit)
- ✅ JWT authentication
- ✅ Error handling centralisé
- ✅ Request logging (Morgan + Winston)

**À faire:**
- [ ] Input validation (Zod)
- [ ] CSRF protection
- [ ] SQL injection prevention (Supabase gère ça)
- [ ] XSS protection (Helmet gère ça)

## Logging

Les logs sont écrits dans:
- Console (développement)
- `./logs/backend.log` (tous les logs)
- `./logs/backend-error.log` (erreurs uniquement)

**Niveaux:**
- `error` - Erreurs critiques
- `warn` - Avertissements
- `info` - Informations générales
- `debug` - Détails de débogage

## Déploiement VPS

Voir `CHANGELOG.md` pour la procédure complète de déploiement sur VPS Oracle.

**Résumé:**
1. SSH vers VPS
2. Cloner le repo
3. Installer dépendances
4. Configurer `.env`
5. Build le projet
6. Démarrer avec PM2
7. Configurer Nginx reverse proxy

## Support

Pour toute question, voir la documentation complète dans `CHANGELOG.md`.

## License

MIT
