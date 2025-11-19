# 🔧 Debug Stripe - Erreur 401

**Erreur**: `Failed to create checkout session` (401 Unauthorized)

---

## 🔍 Diagnostic

L'erreur 401 de Stripe signifie que la clé API est invalide ou expirée.

### Vérifier la clé Stripe actuelle:

```bash
# Voir les logs backend
# La clé devrait commencer par: sk_test_51LDo1PC1QIP...
```

---

## ✅ Solution

### 1. Obtenir la vraie clé Stripe

Aller sur: https://dashboard.stripe.com/test/apikeys

Copier la **Secret key** (commence par `sk_test_...`)

### 2. Mettre à jour dans Supabase Vault

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_VOTRE_VRAIE_CLE
```

### 3. Redéployer Edge Function

```bash
supabase functions deploy get-oauth-secrets
```

### 4. Redémarrer le backend

```bash
cd backend
npm run dev
```

### 5. Tester

```
http://localhost:5173/pricing
→ Click "Start Free Trial"
→ Devrait redirect vers Stripe Checkout
```

---

## 🔐 Sauvegarder la clé

Ajouter dans `.secrets.local`:

```
STRIPE_SECRET_KEY=sk_test_VOTRE_VRAIE_CLE
```

---

**Temps**: 5 minutes
