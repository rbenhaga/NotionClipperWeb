# Supabase Vault Configuration Guide

## Problème identifié

Le backend reçoit une erreur **401 Unauthorized** avec le message `"Invalid JWT"` lors de l'appel à l'Edge Function `get-oauth-secrets`.

**Cause**: Le fichier `.env` contient `SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here` au lieu de la vraie clé.

## Solution en 2 étapes

### Étape 1: Configurer le SERVICE_ROLE_KEY dans .env

1. **Obtenir votre SERVICE_ROLE_KEY**:
   - Allez sur https://supabase.com/dashboard/project/rijjtngbgahxdjflfyhi/settings/api
   - Sous "Project API keys", copiez la clé **service_role** (pas anon!)
   - ⚠️ **Cette clé est secrète** - ne la commitez JAMAIS dans git

2. **Mettre à jour backend/.env**:
   ```bash
   # Dans backend/.env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Votre vraie clé
   JWT_SECRET=<générer avec: openssl rand -base64 32>
   ```

### Étape 2: Configurer les secrets OAuth dans Supabase Vault

L'Edge Function `get-oauth-secrets` récupère les secrets depuis Supabase Vault via `Deno.env.get()`.

**Via Supabase CLI** (recommandé):

```bash
# 1. Login (si pas déjà fait)
supabase login

# 2. Link le projet
supabase link --project-ref rijjtngbgahxdjflfyhi

# 3. Configurer SERVICE_ROLE_KEY (requis pour l'Edge Function)
# IMPORTANT: Utilisez la MÊME valeur que dans backend/.env
supabase secrets set SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIs..."

# 4. Configurer les secrets OAuth
supabase secrets set GOOGLE_CLIENT_ID="votre_google_client_id"
supabase secrets set GOOGLE_CLIENT_SECRET="votre_google_client_secret"
supabase secrets set NOTION_CLIENT_ID="votre_notion_client_id"
supabase secrets set NOTION_CLIENT_SECRET="votre_notion_client_secret"
supabase secrets set STRIPE_SECRET_KEY="sk_test_..."
supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_..."

# 5. Vérifier que tout est configuré
supabase secrets list
```

**OU utilisez le script automatique**:

```bash
./setup-vault-secrets.sh
```

**Via Dashboard Supabase** (alternatif):

1. Allez sur https://supabase.com/dashboard/project/rijjtngbgahxdjflfyhi/settings/vault
2. Cliquez "New Secret" pour chaque variable:
   - `SERVICE_ROLE_KEY` ⚠️ **Même valeur que backend/.env**
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NOTION_CLIENT_ID`
   - `NOTION_CLIENT_SECRET`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

3. Pour les Edge Functions, les secrets sont automatiquement disponibles via `Deno.env.get()`

**Note importante sur SERVICE_ROLE_KEY**:
- L'Edge Function `get-oauth-secrets` l'utilise pour authentifier les requêtes
- Il doit être identique dans `backend/.env` ET dans Supabase Vault
- C'est votre service_role key du dashboard Supabase

### Étape 3: Redémarrer et vérifier

1. **Redémarrer le backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Vérifier les logs**:
   ```
   ✅ Edge Function response status: 200 OK
   ✅ Secrets successfully fetched from Supabase Vault
      Google Client ID: 123456789012345678...
      Notion Client ID: a1b2c3d4-e5f6-7890...
   ```

## Où trouver vos clés OAuth

### Google OAuth
1. https://console.cloud.google.com/apis/credentials
2. Sélectionnez votre projet
3. Trouvez "Identifiants OAuth 2.0"
4. Client ID et Client Secret

### Notion OAuth
1. https://www.notion.so/my-integrations
2. Sélectionnez votre integration
3. Secrets → OAuth Client ID et Client Secret

### Stripe
1. https://dashboard.stripe.com/test/apikeys
2. Secret key (commence par `sk_test_...`)
3. https://dashboard.stripe.com/test/webhooks
4. Webhook signing secret (commence par `whsec_...`)

## Sécurité

- ✅ **SERVICE_ROLE_KEY**: Stockée localement dans `.env` (gitignored)
- ✅ **OAuth Secrets**: Stockées dans Supabase Vault (chiffrées)
- ✅ **Edge Function**: Vérifie le SERVICE_ROLE_KEY avant de retourner les secrets
- ✅ **Backend**: Appelle l'Edge Function au démarrage pour charger les secrets
- ✅ **Fallback**: Utilise les variables `.env` si Vault échoue

## Dépannage

### Erreur 401 "Invalid JWT"
- ❌ Le SERVICE_ROLE_KEY dans `.env` est incorrect
- ✅ Récupérez la vraie clé depuis le dashboard Supabase

### Erreur 403 "Unauthorized"
- ❌ `SERVICE_ROLE_KEY` n'est pas configuré dans Supabase Vault
- ✅ Exécutez: `supabase secrets set SERVICE_ROLE_KEY="votre_clé"`
- ⚠️ Utilisez la MÊME valeur que dans `backend/.env`

### Erreur 500 "Missing secrets"
- ❌ Les secrets ne sont pas configurés dans Supabase Vault
- ✅ Utilisez `supabase secrets set` pour les configurer

### Logs montrent "(empty)"
- ❌ Les secrets retournés par Vault sont vides
- ✅ Vérifiez avec `supabase secrets list`
- ✅ Assurez-vous que les noms de variables correspondent exactement

### Backend utilise toujours les placeholders
- ❌ Le fichier `.env` contient des valeurs placeholder
- ✅ Supprimez les lignes avec placeholders ou laissez-les vides
- ✅ Les vraies valeurs viendront de Vault
