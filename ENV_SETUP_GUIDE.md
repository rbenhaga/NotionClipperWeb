# Environment Variables Setup Guide

## 🚨 Missing Configuration

Your backend is missing some required environment variables. Here's how to fix it:

---

## ✅ Already Configured

- ✅ Supabase (URL, keys)
- ✅ JWT Secret
- ✅ Token Encryption Key (just added)
- ✅ Rate limiting
- ✅ Logging

---

## ❌ Missing Configuration

### 1. Google OAuth (Required for Google login)

**Where to get:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Authorized redirect URIs: `http://localhost:3001/api/auth/google/callback`
7. Copy Client ID and Client Secret

**Add to `backend/.env`:**
```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
```

---

### 2. Notion OAuth (Required for Notion integration)

**Where to get:**
1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Name: "Clipper Pro"
4. Type: "Public integration"
5. Redirect URI: `http://localhost:3001/api/auth/notion/callback`
6. Copy OAuth client ID and OAuth client secret

**Add to `backend/.env`:**
```bash
NOTION_CLIENT_ID=your-notion-client-id
NOTION_CLIENT_SECRET=your-notion-client-secret
NOTION_REDIRECT_URI=http://localhost:3001/api/auth/notion/callback
```

---

### 3. Stripe (Required for payments)

**Where to get:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy "Secret key" (starts with `sk_test_...`)
3. Go to "Developers" → "Webhooks" → "Add endpoint"
4. Endpoint URL: `http://localhost:3001/api/webhooks/stripe`
5. Events to listen: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
6. Copy "Signing secret" (starts with `whsec_...`)

**Add to `backend/.env`:**
```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

---

### 4. Stripe Price IDs (Required for checkout)

**How to create:**

#### Option A: Quick Setup (Beta Price $3.99/mo)

1. Go to [Stripe Products](https://dashboard.stripe.com/test/products)
2. Click "Add product"
3. Name: "Clipper Pro Beta"
4. Description: "Beta access with lifetime $3.99/mo pricing"
5. Pricing model: "Recurring"
6. Price: $3.99 USD
7. Billing period: Monthly
8. Add a 14-day free trial
9. Click "Save product"
10. Copy the Price ID (starts with `price_...`)

**Add to `backend/.env`:**
```bash
STRIPE_PRICE_MONTHLY=price_your_beta_price_id
```

#### Option B: Full Setup (3 prices)

Create 3 products in Stripe:

**Product 1: Monthly ($3.99 beta → $5.99 regular)**
- Name: "Clipper Pro Monthly"
- Price: $3.99 USD (for beta) or $5.99 USD (for regular)
- Billing: Monthly
- Trial: 14 days

**Product 2: Annual ($59/year)**
- Name: "Clipper Pro Annual"
- Price: $59 USD
- Billing: Yearly
- Trial: 14 days

**Product 3: One-time (optional)**
- Name: "Clipper Pro Lifetime"
- Price: $99 USD (one-time)
- Billing: One-time payment

**Add to `backend/.env`:**
```bash
STRIPE_PRICE_MONTHLY=price_monthly_id
STRIPE_PRICE_ANNUAL=price_annual_id
STRIPE_PRICE_ONETIME=price_onetime_id
```

---

## 🔧 Quick Fix for Testing

If you just want to test locally without setting up everything:

### Minimal Setup (Just to make it work):

1. **Keep Google/Notion OAuth empty** (users won't be able to login, but app won't crash)
2. **Add Stripe test keys** (required for checkout to work)
3. **Add at least one Stripe Price ID** (for monthly plan)

```bash
# backend/.env
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
STRIPE_PRICE_MONTHLY=price_your_id
```

---

## 🚀 After Configuration

1. Restart your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Test OAuth flows:
   - Google: http://localhost:3001/api/auth/google
   - Notion: http://localhost:3001/api/auth/notion

3. Test Stripe checkout:
   - Go to http://localhost:5173/pricing
   - Click "Start 14-Day Free Trial"
   - Should redirect to Stripe Checkout

---

## 📝 Production Setup

For production (VPS deployment):

1. **Use Supabase Vault** for secrets (recommended):
   ```bash
   supabase secrets set GOOGLE_CLIENT_SECRET=your-secret
   supabase secrets set NOTION_CLIENT_SECRET=your-secret
   supabase secrets set STRIPE_SECRET_KEY=your-key
   ```

2. **Or use environment variables** on your VPS:
   - Add to `.env` file on server
   - Or use systemd environment files
   - Or use Docker secrets

See `VAULT_SETUP.md` for detailed Vault setup instructions.

---

## ❓ Troubleshooting

### Error: "TOKEN_ENCRYPTION_KEY not configured"
✅ **Fixed!** Already added to your `.env`

### Error: "Failed to create checkout session"
❌ Missing Stripe keys or Price IDs
→ Add `STRIPE_SECRET_KEY` and `STRIPE_PRICE_MONTHLY`

### Error: "Failed to exchange Google authorization code"
❌ Missing Google OAuth credentials
→ Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### Error: "Failed to exchange Notion authorization code"
❌ Missing Notion OAuth credentials
→ Add `NOTION_CLIENT_ID` and `NOTION_CLIENT_SECRET`

---

## 🎯 Priority Order

For beta launch, configure in this order:

1. **✅ Token Encryption** (done)
2. **🔴 Stripe** (required for payments)
3. **🟠 Google OAuth** (required for user login)
4. **🟠 Notion OAuth** (required for Notion integration)

Without Stripe: Users can't upgrade to Pro
Without OAuth: Users can't login at all

---

## 📞 Need Help?

- Stripe docs: https://stripe.com/docs/api
- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- Notion OAuth: https://developers.notion.com/docs/authorization

---

**Next step:** Add your Stripe keys to `backend/.env` and restart the server.
