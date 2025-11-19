# 🔐 Configuration Supabase Vault

**Date**: 19 novembre 2025

---

## 📋 Secrets à Configurer

### 1. Aller sur Supabase Dashboard
```
https://supabase.com/dashboard/project/rijjtngbgahxdjflfyhi/settings/vault
```

### 2. Ajouter les Secrets

Click "New secret" pour chaque variable:

#### OAuth Google
```
Name: GOOGLE_CLIENT_ID
Value: [Votre Google Client ID]

Name: GOOGLE_CLIENT_SECRET
Value: [Votre Google Client Secret]
```

#### OAuth Notion
```
Name: NOTION_CLIENT_ID
Value: [Votre Notion Client ID]

Name: NOTION_CLIENT_SECRET
Value: [Votre Notion Client Secret]
```

#### Stripe
```
Name: STRIPE_SECRET_KEY
Value: [Votre Stripe Secret Key]

Name: STRIPE_WEBHOOK_SECRET
Value: [Votre Stripe Webhook Secret]

Name: STRIPE_PRICE_MONTHLY
Value: price_1SSRiUC1QIPSyau3QOwLfWba

Name: STRIPE_PRICE_ANNUAL
Value: price_1SVG5GC1QIPSyau3jq8Jrr4W
```

#### Encryption
```
Name: TOKEN_ENCRYPTION_KEY
Value: aiimX2gh3UE/McfAAdk73fsmjJlnlgrqkIAOM52pJ+o=
```

**Note**: `STRIPE_PREMIUM_PRICE_ID` a été supprimé (redondant avec MONTHLY)

---

## 🚀 Déployer l'Edge Function

### 1. Installer Supabase CLI
```bash
npm install -g supabase
```

### 2. Login
```bash
supabase login
```

### 3. Link au projet
```bash
supabase link --project-ref rijjtngbgahxdjflfyhi
```

### 4. Déployer la fonction
```bash
supabase functions deploy get-oauth-secrets
```

### 5. Vérifier
```bash
# Tester l'Edge Function
curl -X GET \
  'https://rijjtngbgahxdjflfyhi.supabase.co/functions/v1/get-oauth-secrets' \
  -H 'Authorization: Bearer [VOTRE_SERVICE_ROLE_KEY]'
```

---

## ✅ Vérification

Une fois configuré, le backend devrait afficher:
```
🔐 Loading secrets from Supabase Vault...
✅ Secrets loaded successfully from Supabase Vault
   Google Client ID: ...
   Notion Client ID: ...
   Stripe Secret Key: ...
```

---

## 🔧 Dépannage

### Erreur "Unauthorized"
- Vérifier que SERVICE_ROLE_KEY est correct dans backend/.env
- Vérifier que l'Edge Function est déployée

### Erreur "Missing secrets"
- Vérifier que tous les secrets sont dans Supabase Vault
- Vérifier l'orthographe des noms de secrets

### Fallback sur .env
Si Vault échoue, le backend utilise automatiquement les variables .env en fallback.

---

**Temps total**: 10 minutes
