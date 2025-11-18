# 📖 API GUIDE - Documentation Complète

> **NotionClipperWeb Backend API**
> REST API • OAuth 2.0 • JWT • Stripe Webhooks

---

## 🌐 Base URL

```
Development:  http://localhost:3001/api
Production:   https://your-domain.com/api
```

---

## 🔐 Authentication

### JWT Token Authentication

Tous les endpoints protégés requièrent un **Bearer token** dans le header `Authorization`.

**Format** :
```http
Authorization: Bearer <JWT_TOKEN>
```

**Obtention du token** :
1. Via OAuth (Google/Notion) → redirection avec token
2. Via Email/Password → `POST /auth/login` retourne le token

**Token Payload** :
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "provider": "google",
  "iat": 1700000000,
  "exp": 1700086400
}
```

**Expiration** : 24 heures (configurable via `JWT_EXPIRES_IN`)

---

## 📍 Endpoints

### ━━━━━ AUTH ━━━━━

#### `GET /auth/google`

Initie le flux OAuth Google.

**Auth** : ❌ Non requis

**Response** : Redirect vers Google OAuth

**Exemple** :
```bash
curl -L http://localhost:3001/api/auth/google
```

---

#### `GET /auth/google/callback`

Callback Google OAuth (géré automatiquement).

**Query params** :
- `code` : Authorization code (fourni par Google)
- `error` : Error message (si erreur)

**Response** : Redirect vers frontend avec token
```
http://localhost:5173/auth/success?token=<JWT_TOKEN>
```

---

#### `GET /auth/notion`

Initie le flux OAuth Notion.

**Auth** : ❌ Non requis

**Response** : Redirect vers Notion OAuth

**Exemple** :
```bash
curl -L http://localhost:3001/api/auth/notion
```

---

#### `GET /auth/notion/callback`

Callback Notion OAuth (géré automatiquement).

**Query params** :
- `code` : Authorization code (fourni par Notion)
- `error` : Error message (si erreur)

**Response** : Redirect vers frontend avec token

**Note** : Si l'email Notion n'est pas disponible, redirect vers `/auth/email?workspace=<ID>` pour demander l'email.

---

#### `POST /auth/signup`

Inscription avec email/password (Supabase Auth).

**Auth** : ❌ Non requis

**Request body** :
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe" // optionnel
}
```

**Response** (201 Created) :
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe"
  },
  "tokens": {
    "accessToken": "eyJhbG...",
    "tokenType": "Bearer",
    "expiresIn": "24h"
  }
}
```

**Validation** :
- Email valide
- Password ≥ 8 caractères
- Email de vérification envoyé automatiquement

---

#### `POST /auth/login`

Connexion avec email/password.

**Auth** : ❌ Non requis

**Request body** :
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK) :
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe"
  },
  "tokens": {
    "accessToken": "eyJhbG...",
    "tokenType": "Bearer",
    "expiresIn": "24h"
  }
}
```

**Errors** :
- `401 Unauthorized` : Invalid credentials
- `403 Forbidden` : Email not verified

---

#### `POST /auth/resend-verification`

Renvoyer l'email de vérification.

**Auth** : ❌ Non requis

**Request body** :
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK) :
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

---

#### `POST /auth/logout`

Logout (côté client : supprimer le token).

**Auth** : ❌ Non requis

**Response** (200 OK) :
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### ━━━━━ USER ━━━━━

#### `GET /user/profile`

Récupérer le profil utilisateur actuel.

**Auth** : ✅ Requis

**Headers** :
```http
Authorization: Bearer <JWT_TOKEN>
```

**Response** (200 OK) :
```json
{
  "success": true,
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "avatar_url": "https://...",
  "auth_provider": "google",
  "created_at": "2024-11-18T10:30:00Z"
}
```

---

#### `GET /user/subscription`

Récupérer l'abonnement utilisateur actuel.

**Auth** : ✅ Requis

**Response** (200 OK) :
```json
{
  "success": true,
  "id": "uuid",
  "tier": "premium",
  "status": "active",
  "current_period_end": "2024-12-18T10:30:00Z",
  "cancel_at_period_end": false
}
```

**Si pas d'abonnement** (retourne FREE par défaut) :
```json
{
  "success": true,
  "tier": "free",
  "status": "active",
  "quotas": {
    "clips_per_month": 100,
    "files_per_month": 10,
    "focus_mode_minutes": 60,
    "compact_mode_minutes": 30
  }
}
```

---

#### `GET /user/notion-connection`

Récupérer la connexion Notion workspace.

**Auth** : ✅ Requis

**Response** (200 OK) :
```json
{
  "success": true,
  "workspace_id": "abc123",
  "workspace_name": "My Workspace",
  "is_active": true,
  "connected_at": "2024-11-18T10:30:00Z"
}
```

**Si pas de connexion** (404 Not Found) :
```json
{
  "success": false,
  "error": {
    "message": "No Notion connection found"
  }
}
```

---

### ━━━━━ STRIPE ━━━━━

#### `POST /stripe/create-checkout-session`

Créer une session Stripe Checkout pour upgrade Premium.

**Auth** : ✅ Requis (optionnel pour guest checkout)

**Request body** :
```json
{
  "plan": "premium_monthly" // ou "premium_annual" ou "premium_onetime"
}
```

**Response** (200 OK) :
```json
{
  "success": true,
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Redirection** : Frontend doit rediriger vers `url`

**Plans disponibles** :
- `premium_monthly` : 2.99€/mois (trial 14 jours)
- `premium_annual` : 28.68€/an (20% off, trial 14 jours)
- `premium_onetime` : Achat unique (TBD)

---

#### `POST /stripe/create-portal`

Créer une session Stripe Customer Portal (gestion abonnement).

**Auth** : ✅ Requis

**Request body** :
```json
{
  "returnUrl": "http://localhost:5173/settings"
}
```

**Response** (200 OK) :
```json
{
  "success": true,
  "url": "https://billing.stripe.com/p/session/..."
}
```

**Redirection** : Frontend doit rediriger vers `url`

**Fonctionnalités du portal** :
- Voir les factures
- Modifier le moyen de paiement
- Annuler l'abonnement
- Télécharger les reçus

---

#### `POST /webhooks/stripe`

Webhook Stripe (géré automatiquement par le backend).

**Auth** : ❌ Non requis (signature Stripe)

**Headers** :
```http
stripe-signature: <STRIPE_SIGNATURE>
```

**Events gérés** :
- `checkout.session.completed` : Subscription activée
- `customer.subscription.created` : Subscription créée
- `customer.subscription.updated` : Subscription modifiée
- `customer.subscription.deleted` : Subscription annulée
- `invoice.payment_failed` : Paiement échoué

**Configuration Stripe** :
1. Dashboard → Developers → Webhooks
2. Add endpoint : `https://your-domain.com/api/webhooks/stripe`
3. Events : Sélectionner tous les events `checkout.*` et `customer.subscription.*`
4. Copier le `Webhook signing secret` dans `STRIPE_WEBHOOK_SECRET`

---

### ━━━━━ USAGE TRACKING ━━━━━

#### `POST /usage/track`

Tracker l'utilisation d'une feature (clips, files, minutes).

**Auth** : ✅ Requis (ou service_role backend)

**Request body** :
```json
{
  "userId": "uuid",
  "feature": "clips", // "clips", "files", "focus_mode_minutes", "compact_mode_minutes"
  "increment": 1, // optionnel, default 1
  "metadata": { // optionnel
    "content_type": "text",
    "source": "desktop-app"
  }
}
```

**Response** (200 OK) :
```json
{
  "success": true,
  "usageRecord": {
    "id": "uuid",
    "clips_count": 5,
    "files_count": 0,
    "focus_mode_minutes": 0,
    "compact_mode_minutes": 0,
    "year": 2024,
    "month": 11
  }
}
```

**Logique** :
1. Incrémente le compteur via RPC `increment_usage_counter`
2. Crée automatiquement un `usage_record` si premier usage du mois
3. Log un `usage_event` si `metadata` fourni
4. Retourne le `usage_record` mis à jour

---

#### `GET /usage/current`

Récupérer l'usage du mois en cours.

**Auth** : ✅ Requis

**Response** (200 OK) :
```json
{
  "success": true,
  "usage": {
    "clips_count": 5,
    "files_count": 0,
    "focus_mode_minutes": 0,
    "compact_mode_minutes": 0,
    "year": 2024,
    "month": 11
  }
}
```

**Si pas d'usage** (retourne 0) :
```json
{
  "success": true,
  "usage": {
    "clips_count": 0,
    "files_count": 0,
    "focus_mode_minutes": 0,
    "compact_mode_minutes": 0,
    "year": 2024,
    "month": 11
  }
}
```

---

### ━━━━━ NOTION ━━━━━

#### `POST /notion/get-token`

Récupérer et déchiffrer le token Notion d'un utilisateur (backend only).

**Auth** : ✅ Requis (service_role)

**Request body** :
```json
{
  "userId": "uuid"
}
```

**Response** (200 OK) :
```json
{
  "success": true,
  "token": "secret_decrypted_token",
  "workspaceName": "My Workspace",
  "workspaceIcon": "📝"
}
```

**Errors** :
- `404 Not Found` : No Notion connection found
- `403 Forbidden` : Notion connection inactive

---

#### `POST /notion/save-connection`

Sauvegarder une connexion Notion (backend only, appelé par OAuth callback).

**Auth** : ✅ Requis (service_role)

**Request body** :
```json
{
  "userId": "uuid",
  "workspaceId": "abc123",
  "workspaceName": "My Workspace",
  "workspaceIcon": "📝",
  "accessToken": "secret_token",
  "isActive": true
}
```

**Response** (200 OK) :
```json
{
  "success": true,
  "connection": {
    "id": "uuid",
    "userId": "uuid",
    "workspaceId": "abc123",
    "workspaceName": "My Workspace",
    "workspaceIcon": "📝",
    "accessToken": "secret_token", // returned for immediate use
    "isActive": true
  }
}
```

**Sécurité** : Le token est **chiffré (AES-256-GCM)** avant stockage en DB.

---

#### `POST /notion/get-user-by-workspace`

Trouver un utilisateur par workspace ID (auto-reconnection).

**Auth** : ❌ Non requis

**Request body** :
```json
{
  "workspaceId": "abc123"
}
```

**Response** (200 OK) :
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "avatar_url": "https://...",
    "auth_provider": "notion"
  }
}
```

**Si pas trouvé** :
```json
{
  "success": true,
  "user": null
}
```

---

### ━━━━━ HEALTH ━━━━━

#### `GET /health`

Health check du backend.

**Auth** : ❌ Non requis

**Response** (200 OK) :
```json
{
  "status": "ok",
  "timestamp": "2024-11-18T10:30:00.000Z",
  "service": "notion-clipper-backend"
}
```

---

## ⚠️ Error Responses

Tous les endpoints retournent un format d'erreur standard :

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": {} // optionnel
  }
}
```

### HTTP Status Codes

| Code | Signification | Exemple |
|------|---------------|---------|
| 200 | OK | Success |
| 201 | Created | User created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Invalid token |
| 403 | Forbidden | Email not verified |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Email already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Codes

| Code | Message | Action |
|------|---------|--------|
| `VALIDATION_ERROR` | Invalid input data | Check request body |
| `UNAUTHORIZED` | Invalid token | Refresh token or re-login |
| `FORBIDDEN` | Access denied | Check permissions |
| `NOT_FOUND` | Resource not found | Verify ID |
| `CONFLICT` | Resource already exists | Use different email |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait 15 minutes |
| `INTERNAL_ERROR` | Server error | Retry later |

---

## 🔒 Rate Limiting

| Endpoint Pattern | Window | Max Requests |
|------------------|--------|--------------|
| `/api/*` (general) | 15 min | 100 |
| `/api/auth/*` | 15 min | 5 |
| `/api/webhooks/stripe` | 1 min | 100 |

**Response** (429 Too Many Requests) :
```json
{
  "success": false,
  "error": {
    "message": "Too many requests, please try again later",
    "code": "RATE_LIMIT_EXCEEDED"
  }
}
```

**Headers** :
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000000
```

---

## 📊 Usage Quotas

### Quotas par Tier

| Feature | Free | Premium |
|---------|------|---------|
| Clips/mois | 100 | Illimité (-1) |
| Files/mois | 10 | Illimité (-1) |
| Focus mode | 60 min | Illimité (-1) |
| Compact mode | 30 min | Illimité (-1) |

### Check Quota (RPC function - backend only)

```sql
SELECT * FROM check_quota_limit('USER_UUID', 'clips');
```

**Response** :
```json
{
  "allowed": true,
  "reason": "Quota OK: 5/100 clips used this month",
  "current_usage": 5,
  "quota_limit": 100
}
```

**Si limite atteinte** :
```json
{
  "allowed": false,
  "reason": "Quota limit reached: 100/100 clips used this month",
  "current_usage": 100,
  "quota_limit": 100
}
```

---

## 🧪 Testing avec cURL

### Test OAuth Flow (simplified)

```bash
# 1. Initiate Google OAuth
curl -L http://localhost:3001/api/auth/google

# 2. After redirect, extract token from URL
# Example: http://localhost:5173/auth/success?token=eyJhbG...

# 3. Use token for authenticated requests
TOKEN="eyJhbG..."

curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3001/api/user/profile
```

### Test Email Signup

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "fullName": "Test User"
  }'
```

### Test Usage Tracking

```bash
curl -X POST http://localhost:3001/api/usage/track \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_UUID",
    "feature": "clips",
    "increment": 1
  }'
```

### Test Stripe Checkout

```bash
curl -X POST http://localhost:3001/api/stripe/create-checkout-session \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "premium_monthly"
  }'
```

---

## 📝 Best Practices

### 1. Toujours utiliser HTTPS en production

```javascript
// Vérifier l'environnement
if (process.env.NODE_ENV === 'production' && !req.secure) {
  return res.redirect(301, `https://${req.headers.host}${req.url}`);
}
```

### 2. Stocker les tokens de façon sécurisée

```javascript
// ❌ Mauvais : localStorage (XSS vulnerable)
localStorage.setItem('token', token);

// ✅ Bon : httpOnly cookie
res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});
```

### 3. Refresh token avant expiration

```javascript
// Vérifier l'expiration du token
const decoded = jwt.decode(token);
const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

if (expiresIn < 3600) { // < 1h
  // Refresh token
  await refreshToken();
}
```

### 4. Gérer les erreurs proprement

```javascript
try {
  const response = await fetch('/api/user/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (response.status === 401) {
    // Token expiré → re-login
    window.location.href = '/login';
  }

  const data = await response.json();
  // ...
} catch (error) {
  console.error('API error:', error);
  // Show user-friendly error
}
```

---

## 🔗 Ressources

- **Supabase Docs** : https://supabase.com/docs
- **Stripe API** : https://stripe.com/docs/api
- **Notion API** : https://developers.notion.com
- **Google OAuth** : https://developers.google.com/identity/protocols/oauth2

---

**Made with ❤️ by NotionClipper Team**
*API-First • Type-Safe • Production-Ready*
