# ⚡ Configuration Supabase Vault - Actions Immédiates

**Temps**: 15 minutes

---

## 🎯 Objectif

Configurer tous les secrets dans Supabase Vault pour ne plus utiliser .env

---

## 📋 Étape 1: Ajouter les Secrets (10 min)

### Aller sur Supabase Vault
```
https://supabase.com/dashboard/project/rijjtngbgahxdjflfyhi/settings/vault
```

### Ajouter ces 10 secrets:

Click "New secret" pour chaque:

```
1. GOOGLE_CLIENT_ID = [Ton Google Client ID]
2. GOOGLE_CLIENT_SECRET = [Ton Google Client Secret]
3. NOTION_CLIENT_ID = [Ton Notion Client ID]
4. NOTION_CLIENT_SECRET = [Ton Notion Client Secret]
5. STRIPE_SECRET_KEY = [Ton Stripe Secret Key]
6. STRIPE_WEBHOOK_SECRET = [Ton Stripe Webhook Secret]
7. STRIPE_PRICE_MONTHLY = price_1SSRiUC1QIPSyau3QOwLfWba
8. STRIPE_PRICE_ANNUAL = price_1SVG5GC1QIPSyau3jq8Jrr4W
9. TOKEN_ENCRYPTION_KEY = aiimX2gh3UE/McfAAdk73fsmjJlnlgrqkIAOM52pJ+o=
10. STRIPE_PREMIUM_PRICE_ID = price_1SSRiUC1QIPSyau3QOwLfWba
```

---

## 🚀 Étape 2: Déployer Edge Function (5 min)

### Installer Supabase CLI (si pas déjà fait)
```bash
npm install -g supabase
```

### Login et Link
```bash
supabase login
supabase link --project-ref rijjtngbgahxdjflfyhi
```

### Déployer
```bash
supabase functions deploy get-oauth-secrets
```

---

## ✅ Étape 3: Tester (2 min)

### Redémarrer le backend
```bash
cd backend
npm run dev
```

### Vérifier les logs
Tu devrais voir:
```
🔐 Loading secrets from Supabase Vault...
✅ Secrets loaded successfully from Supabase Vault
   Google Client ID: ...
   Notion Client ID: ...
   Stripe Secret Key: ...
```

---

## 🎉 Résultat

- ✅ Tous les secrets dans Supabase Vault
- ✅ Plus besoin de .env pour les secrets
- ✅ Facile à mettre à jour
- ✅ Sécurisé et centralisé

---

**Temps total**: 15 minutes

**Prochaine étape**: Tester l'application (20 min)
