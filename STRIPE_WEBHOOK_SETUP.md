# 🔔 Configuration Stripe Webhook

**Problème**: Le paiement fonctionne mais la subscription n'est pas mise à jour.

**Cause**: Stripe webhook pas configuré.

---

## 🚀 Solution Rapide (Dev)

### Option A: Stripe CLI (Recommandé pour dev)

```bash
# Installer Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks vers localhost
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

Copier le webhook secret affiché (commence par `whsec_...`)

Ajouter dans Supabase Vault:
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🌐 Solution Production

### 1. Aller sur Stripe Dashboard
```
https://dashboard.stripe.com/test/webhooks
```

### 2. Créer un webhook
- Click "Add endpoint"
- URL: `https://votre-domaine.com/api/webhooks/stripe`
- Events à écouter:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`

### 3. Copier le webhook secret
- Format: `whsec_...`

### 4. Ajouter dans Supabase Vault
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## ✅ Vérification

Une fois configuré, quand tu paies:
1. Stripe envoie un webhook
2. Backend reçoit l'événement
3. Subscription mise à jour automatiquement
4. Dashboard affiche "PREMIUM"

---

## 🔧 Test Manuel (Temporaire)

En attendant le webhook, tu peux mettre à jour manuellement dans Supabase:

```sql
-- Aller sur Supabase SQL Editor
UPDATE subscriptions
SET 
  tier = 'PREMIUM',
  status = 'active',
  stripe_customer_id = 'cus_...',  -- Voir dans Stripe Dashboard
  stripe_subscription_id = 'sub_...'  -- Voir dans Stripe Dashboard
WHERE user_id = '7c7d8213-3cab-4a74-be3c-47bf14d98fcc';
```

Puis rafraîchir le dashboard.

---

**Temps**: 5 minutes avec Stripe CLI
