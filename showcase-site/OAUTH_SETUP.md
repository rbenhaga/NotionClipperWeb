# OAuth Configuration Guide for NotionClipper Showcase Site

This document explains how to configure OAuth callbacks for the NotionClipper showcase website to enable Google and Notion authentication.

## Overview

The showcase site uses two OAuth providers:
- **Google OAuth**: Handled by Supabase Auth (native integration)
- **Notion OAuth**: Custom flow via Supabase Edge Functions

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (showcase-site)                    │
│                                                                  │
│  AuthPage.tsx → initiates OAuth flow                           │
│  AuthCallbackPage.tsx → handles Google callback                │
│  NotionCallbackPage.tsx → handles Notion callback              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase Services                          │
│                                                                  │
│  • Supabase Auth (Google OAuth)                                │
│  • Edge Function: notion-oauth (Notion OAuth)                  │
│  • Edge Function: get-user-profile                             │
│  • Edge Function: create-user                                  │
│  • Edge Function: get-subscription                             │
│  • Edge Function: create-checkout                              │
│  • Edge Function: create-portal-session                        │
└─────────────────────────────────────────────────────────────────┘
```

## Prerequisites

Before configuring OAuth, ensure you have:

1. ✅ Supabase project created and configured
2. ✅ All Edge Functions deployed (notion-oauth, get-user-profile, create-user, etc.)
3. ✅ Supabase Vault configured with secrets:
   - `NOTION_CLIENT_SECRET`
   - `GOOGLE_CLIENT_SECRET` (if using custom Google OAuth)
   - `STRIPE_SECRET_KEY`
   - `ENCRYPTION_KEY` (for AES-256-GCM encryption)
4. ✅ Domain configured (e.g., `https://notionclipper.com` or `http://localhost:5173` for dev)

## 1. Google OAuth Configuration

### Option A: Using Supabase Auth (Recommended)

Supabase provides native Google OAuth integration, which is the easiest approach.

#### Step 1: Enable Google Provider in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click **Enable**
4. Note the **Redirect URL** provided by Supabase (usually `https://<project-ref>.supabase.co/auth/v1/callback`)

#### Step 2: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application** as application type
6. Configure:
   - **Name**: `NotionClipper Showcase Site`
   - **Authorized JavaScript origins**:
     ```
     https://notionclipper.com
     http://localhost:5173
     ```
   - **Authorized redirect URIs**:
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     http://localhost:5173/auth/callback
     ```
7. Click **Create** and copy the **Client ID** and **Client Secret**

#### Step 3: Configure Supabase with Google Credentials

1. In Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Paste your **Client ID** and **Client Secret**
3. Click **Save**

#### Step 4: Update .env

```bash
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

### How Google OAuth Works

1. User clicks "Continue with Google" on `/auth`
2. `authService.signInWithGoogle()` redirects to Google OAuth page
3. User approves permissions
4. Google redirects to Supabase callback URL
5. Supabase processes auth and redirects to `/auth/callback`
6. `AuthCallbackPage.tsx` verifies session and redirects to `/dashboard`

---

## 2. Notion OAuth Configuration

Notion OAuth requires custom implementation since it's not natively supported by Supabase.

### Step 1: Create Notion Integration

1. Go to [Notion Developers](https://www.notion.so/my-integrations)
2. Click **New integration**
3. Configure:
   - **Name**: `NotionClipper`
   - **Associated workspace**: Select your workspace
   - **Type**: Public integration
   - **Capabilities**:
     - ✅ Read content
     - ✅ Insert content
     - ✅ Update content
     - ❌ No user information (optional based on your needs)
4. Click **Submit**

### Step 2: Configure OAuth Settings

1. In your integration settings, scroll to **OAuth Domain & URIs**
2. Configure:
   - **Redirect URIs**:
     ```
     https://notionclipper.com/auth/callback/notion
     http://localhost:5173/auth/callback/notion
     ```
3. Note your **OAuth client ID** and **OAuth client secret**

### Step 3: Store Secrets in Supabase Vault

You must store the Notion client secret in Supabase Vault (NOT in .env):

```sql
-- Run this in Supabase SQL Editor
INSERT INTO vault.secrets (name, secret)
VALUES ('NOTION_CLIENT_SECRET', '<your-notion-client-secret>')
ON CONFLICT (name) DO UPDATE SET secret = EXCLUDED.secret;
```

### Step 4: Verify Edge Function Configuration

Ensure your `notion-oauth` Edge Function is deployed and has access to Vault:

```typescript
// supabase/functions/notion-oauth/index.ts
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  // Get secret from Vault
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data: secret } = await supabase
    .rpc('read_secret', { secret_name: 'NOTION_CLIENT_SECRET' });

  // Exchange code for token...
});
```

### Step 5: Update .env

```bash
VITE_NOTION_CLIENT_ID=<your-notion-oauth-client-id>
```

### How Notion OAuth Works

1. User clicks "Continue with Notion" on `/auth`
2. `authService.initiateNotionOAuth()` generates Notion OAuth URL with:
   - `client_id`: From `VITE_NOTION_CLIENT_ID`
   - `redirect_uri`: `https://notionclipper.com/auth/callback/notion`
   - `state`: Random CSRF token stored in sessionStorage
3. User redirects to Notion and approves permissions
4. Notion redirects back with `code` and `state` parameters
5. `NotionCallbackPage.tsx` calls `authService.handleNotionCallback()`
6. Edge Function `notion-oauth` exchanges code for access token using Vault secret
7. Edge Function creates/updates user in database
8. Frontend creates Supabase session and redirects to `/dashboard`

---

## 3. Environment Variables

### Frontend (.env)

Create a `.env` file in `showcase-site/` directory:

```bash
# Supabase Configuration (PUBLIC - safe to expose)
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# OAuth Client IDs (PUBLIC - safe to expose)
VITE_NOTION_CLIENT_ID=<your-notion-client-id>
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>.apps.googleusercontent.com

# Stripe (PUBLIC - safe to expose)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_<your-publishable-key>

# App Configuration
VITE_APP_URL=https://notionclipper.com
VITE_API_URL=https://notionclipper.com
```

### Backend (Supabase Vault)

All secrets MUST be stored in Supabase Vault:

```sql
-- Run these in Supabase SQL Editor
INSERT INTO vault.secrets (name, secret) VALUES
  ('NOTION_CLIENT_SECRET', '<your-notion-client-secret>'),
  ('GOOGLE_CLIENT_SECRET', '<your-google-client-secret>'),
  ('STRIPE_SECRET_KEY', '<your-stripe-secret-key>'),
  ('ENCRYPTION_KEY', '<your-32-byte-hex-encryption-key>')
ON CONFLICT (name) DO UPDATE SET secret = EXCLUDED.secret;
```

---

## 4. Callback URL Configuration Summary

### Production (https://notionclipper.com)

| Provider | Callback URL | Configured In |
|----------|-------------|---------------|
| Google | `https://<project-ref>.supabase.co/auth/v1/callback` | Google Cloud Console |
| Notion | `https://notionclipper.com/auth/callback/notion` | Notion Integration Settings |

### Development (http://localhost:5173)

| Provider | Callback URL | Configured In |
|----------|-------------|---------------|
| Google | `https://<project-ref>.supabase.co/auth/v1/callback` | Google Cloud Console |
| Notion | `http://localhost:5173/auth/callback/notion` | Notion Integration Settings |

---

## 5. Testing OAuth Flow

### Google OAuth Test

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:5173/auth`
3. Click "Continue with Google"
4. Approve permissions
5. Should redirect to `/dashboard` with authenticated session

### Notion OAuth Test

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:5173/auth`
3. Click "Continue with Notion"
4. Select workspace and approve permissions
5. Should redirect to `/dashboard` with authenticated session and Notion workspace connected

### Troubleshooting

**Google OAuth Errors:**
- ❌ `redirect_uri_mismatch`: Check authorized redirect URIs in Google Cloud Console
- ❌ `invalid_client`: Verify Client ID and Secret in Supabase Dashboard

**Notion OAuth Errors:**
- ❌ `invalid_state`: State mismatch (possible CSRF attack) - Clear sessionStorage and retry
- ❌ `invalid_redirect_uri`: Check redirect URIs in Notion Integration Settings
- ❌ `Failed to exchange code`: Check Supabase Vault has correct `NOTION_CLIENT_SECRET`

**Dashboard Not Loading:**
- ❌ Check browser console for errors
- ❌ Verify Edge Functions are deployed: `supabase functions list`
- ❌ Check Edge Function logs: `supabase functions logs <function-name>`
- ❌ Verify database tables exist: `users`, `subscriptions`, `usage_records`

---

## 6. Security Best Practices

1. ✅ **Never expose secrets in frontend code** - All secrets in Supabase Vault
2. ✅ **Use HTTPS in production** - OAuth requires secure connections
3. ✅ **Validate state parameter** - Prevents CSRF attacks (implemented in `authService.handleNotionCallback`)
4. ✅ **Restrict CORS** - Edge Functions should only allow requests from your domain
5. ✅ **Use Row Level Security (RLS)** - Ensure users can only access their own data
6. ✅ **Rotate secrets regularly** - Update Vault secrets periodically

---

## 7. Edge Functions Required

Ensure these Edge Functions are deployed:

1. **notion-oauth** - Handles Notion OAuth code exchange
2. **create-user** - Creates user profile after OAuth
3. **get-user-profile** - Fetches user profile
4. **get-subscription** - Fetches user subscription
5. **create-checkout** - Creates Stripe checkout session
6. **create-portal-session** - Creates Stripe customer portal session
7. **track-usage** - Tracks usage events (clips, files, minutes)

Deploy with:
```bash
cd supabase
supabase functions deploy <function-name>
```

---

## 8. Database Schema

Ensure these tables exist in your Supabase database:

- `users` - User profiles
- `subscriptions` - User subscriptions and tiers
- `usage_records` - Monthly usage aggregations
- `usage_events` - Individual usage events

Check the NotionClipper app repository for complete schema and migrations.

---

## Support

For issues or questions:
- Check Edge Function logs: `supabase functions logs <function-name>`
- Review Supabase Auth logs in Dashboard
- Verify environment variables are set correctly
- Test with `console.log()` in callback pages

---

**Last Updated:** 2025-11-17
**Version:** 1.0.0
**Author:** NotionClipper Team
