# Supabase Edge Functions - Déploiement

## Prérequis

1. **Supabase CLI** doit être installé et configuré
2. **Projet Supabase** doit être lié (`supabase link`)

## Déployer l'Edge Function `get-oauth-secrets`

Cette fonction expose les secrets OAuth stockés dans Supabase Vault pour le backend VPS.

### Déploiement

```bash
# Depuis la racine du projet
supabase functions deploy get-oauth-secrets

# Ou depuis le dossier functions
cd supabase/functions
supabase functions deploy get-oauth-secrets
```

### Test

```bash
# Obtenir la clé SERVICE_ROLE_KEY
supabase secrets list

# Tester la fonction
curl -X GET \
  https://rijjtngbgahxdjflfyhi.supabase.co/functions/v1/get-oauth-secrets \
  -H "Authorization: Bearer VOTRE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

Réponse attendue:
```json
{
  "GOOGLE_CLIENT_ID": "...",
  "GOOGLE_CLIENT_SECRET": "...",
  "NOTION_CLIENT_ID": "...",
  "NOTION_CLIENT_SECRET": "...",
  "STRIPE_SECRET_KEY": "sk_...",
  "STRIPE_WEBHOOK_SECRET": "whsec_..."
}
```

### Configuration Backend

Le backend VPS récupère automatiquement les secrets au démarrage via cette Edge Function.

**Fichier**: `backend/src/services/secrets.service.ts`

```typescript
// Les secrets sont récupérés au démarrage et mis en cache pendant 1h
const secrets = await getSecrets();
```

**Fallback**: Si l'Edge Function échoue, le backend utilise les variables d'environnement `.env` en fallback.

## Sécurité

- ✅ L'Edge Function vérifie que la requête provient du `SERVICE_ROLE_KEY`
- ✅ Les secrets ne sont jamais exposés au client
- ✅ Cache côté backend (1 heure) pour réduire les appels
- ✅ Fallback sur `.env` si l'Edge Function est indisponible

## Vérification Email avec Supabase Auth

Le système d'authentification email utilise maintenant **Supabase Auth** qui gère automatiquement:

### Fonctionnalités Automatiques

- ✅ **Hachage de mot de passe** (bcrypt)
- ✅ **Email de vérification** automatique à l'inscription
- ✅ **Templates d'email** personnalisables dans Supabase Dashboard
- ✅ **Gestion des tokens** de vérification
- ✅ **Expiration automatique** des tokens

### Configuration Email (Supabase Dashboard)

1. Aller dans **Authentication > Email Templates**
2. Personnaliser le template "Confirm signup"
3. Configurer l'expéditeur dans **Settings > Auth**

**Note**: Sans domaine personnalisé, les emails sont envoyés depuis `noreply@mail.app.supabase.io`

### Endpoints Backend

#### 1. Inscription avec vérification email
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

Réponse:
```json
{
  "status": "success",
  "data": {
    "message": "Account created successfully",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe"
    },
    "tokens": {
      "accessToken": "jwt...",
      "tokenType": "Bearer",
      "expiresIn": "7d"
    }
  }
}
```

**Important**: Un email de vérification est automatiquement envoyé. L'utilisateur doit cliquer sur le lien avant de pouvoir se connecter.

#### 2. Connexion (vérifie que l'email est confirmé)
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Si l'email n'est pas vérifié:
```json
{
  "status": "error",
  "error": {
    "message": "Please verify your email before logging in",
    "code": 403
  }
}
```

#### 3. Renvoyer l'email de vérification
```bash
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

Réponse:
```json
{
  "status": "success",
  "data": {
    "message": "Verification email sent successfully"
  }
}
```

### Flow Complet

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend
    participant B as Backend
    participant SA as Supabase Auth
    participant E as Email

    U->>F: S'inscrit (email/password)
    F->>B: POST /api/auth/signup
    B->>SA: signUp() avec emailRedirectTo
    SA->>E: Envoie email de vérification
    SA-->>B: Retourne user (email_confirmed=false)
    B-->>F: Retourne JWT + message
    F-->>U: "Email de vérification envoyé"

    E-->>U: Reçoit email
    U->>E: Clique sur lien de vérification
    E->>SA: Vérifie email
    SA->>F: Redirige vers /auth/verify

    U->>F: Se connecte
    F->>B: POST /api/auth/login
    B->>SA: signInWithPassword()
    SA-->>B: Vérifie email_confirmed=true
    B-->>F: Retourne JWT
    F-->>U: Connecté!
```

### Configuration Frontend

Créer une page de vérification (`/auth/verify`) qui capture le token depuis l'URL:

```typescript
// src/pages/AuthVerify.tsx
export default function AuthVerify() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const type = searchParams.get('type');

  useEffect(() => {
    if (token && type === 'signup') {
      // Afficher message de succès
      // Rediriger vers login
    }
  }, [token, type]);

  return <div>Email vérifié! Vous pouvez maintenant vous connecter.</div>;
}
```

## Sans Nom de Domaine

Actuellement, les emails de vérification sont envoyés depuis:
- **Expéditeur**: `noreply@mail.app.supabase.io`
- **Liens**: Redirect vers `http://localhost:5173/auth/verify` (dev) ou votre URL VPS (prod)

Pour personnaliser l'expéditeur, vous devrez:
1. Acheter un nom de domaine
2. Configurer les DNS (SPF, DKIM, DMARC)
3. Ajouter le domaine dans **Supabase Dashboard > Settings > Auth**

**Alternative**: Utiliser un service d'email externe (SendGrid, Mailgun, Resend) via Supabase Auth webhooks.
