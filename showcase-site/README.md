# NotionClipper Showcase Website

Professional showcase website for NotionClipper with complete OAuth integration, subscription management, and user dashboard.

## Features

- ✅ **Complete OAuth Integration**
  - Google OAuth via Supabase Auth
  - Notion OAuth via custom Edge Function flow
  - Secure CSRF protection with state validation

- ✅ **User Dashboard**
  - Subscription tier display (Free/Premium/Grace Period)
  - Real-time usage quotas (clips, files, focus mode, compact mode)
  - Stripe Customer Portal integration
  - One-click upgrade to Premium

- ✅ **Professional Design**
  - Client-friendly content (no technical jargon)
  - Multi-language support (FR/EN) with i18next
  - Responsive layout with Tailwind CSS
  - Animated UI with Framer Motion

- ✅ **Complete Changelog**
  - 7 versions from v0.1.0 to v1.2.0
  - Real stats: 421+ commits, 5 months development, 50k+ LOC
  - Simplified for end-users

- ✅ **Security First**
  - All secrets stored in Supabase Vault
  - Public keys only in frontend
  - Row Level Security (RLS) on all database tables
  - AES-256-GCM encryption for sensitive data

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Animation**: Framer Motion
- **i18n**: react-i18next
- **Auth**: Supabase Auth + Custom OAuth
- **Backend**: Supabase Edge Functions
- **Database**: PostgreSQL with RLS
- **Payments**: Stripe (Checkout + Customer Portal)

## Project Structure

```
showcase-site/
├── src/
│   ├── assets/          # Images, logos, icons
│   ├── components/      # Reusable UI components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ScrollToTop.tsx
│   ├── lib/             # Library configurations
│   │   └── supabase.ts  # Supabase client initialization
│   ├── services/        # Business logic services
│   │   ├── auth.service.ts          # Authentication service
│   │   └── subscription.service.ts  # Subscription management
│   ├── pages/           # Page components
│   │   ├── HomePage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── AuthCallbackPage.tsx       # Google OAuth callback
│   │   ├── NotionCallbackPage.tsx     # Notion OAuth callback
│   │   ├── DashboardPage.tsx          # User dashboard
│   │   ├── PricingPage.tsx
│   │   ├── ChangelogPage.tsx
│   │   ├── PrivacyPage.tsx
│   │   ├── TermsPage.tsx
│   │   └── LegalPage.tsx
│   ├── i18n/            # Translations (FR/EN)
│   ├── App.tsx          # Main app with routes
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── .env.example         # Environment variables template
├── OAUTH_SETUP.md       # Detailed OAuth configuration guide
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase project with Edge Functions deployed
- Google OAuth credentials
- Notion OAuth credentials
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/NotionClipperWeb.git
cd NotionClipperWeb/showcase-site
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```bash
# Supabase Configuration (PUBLIC - safe to expose)
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# OAuth Client IDs (PUBLIC - safe to expose)
VITE_NOTION_CLIENT_ID=<your-notion-client-id>
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>

# Stripe (PUBLIC - safe to expose)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_<your-publishable-key>

# App Configuration
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:5173
```

4. Store secrets in Supabase Vault (see OAUTH_SETUP.md for details):
```sql
INSERT INTO vault.secrets (name, secret) VALUES
  ('NOTION_CLIENT_SECRET', '<your-notion-client-secret>'),
  ('GOOGLE_CLIENT_SECRET', '<your-google-client-secret>'),
  ('STRIPE_SECRET_KEY', '<your-stripe-secret-key>'),
  ('ENCRYPTION_KEY', '<your-32-byte-hex-encryption-key>')
ON CONFLICT (name) DO UPDATE SET secret = EXCLUDED.secret;
```

5. Configure OAuth callbacks (see OAUTH_SETUP.md for complete guide):
   - Google Cloud Console: Add `http://localhost:5173/auth/callback`
   - Notion Integration: Add `http://localhost:5173/auth/callback/notion`

6. Start development server:
```bash
npm run dev
```

Visit `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production (TypeScript + Vite)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## OAuth Configuration

For detailed OAuth setup instructions, see [OAUTH_SETUP.md](./OAUTH_SETUP.md).

### Quick Summary

1. **Google OAuth**: Configured via Supabase Dashboard → Authentication → Providers
2. **Notion OAuth**: Configured via Notion Integration Settings + Supabase Edge Function
3. **Callbacks**:
   - Google: `https://<project-ref>.supabase.co/auth/v1/callback`
   - Notion: `https://notionclipper.com/auth/callback/notion`

## Deployment

### Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

### Deploy to VPS

1. Build the project:
```bash
npm run build
```

2. Upload `dist/` directory to your VPS

3. Configure Nginx/Apache to serve static files:

**Nginx example:**
```nginx
server {
    listen 80;
    server_name notionclipper.com;

    root /var/www/notionclipper/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

4. Set up SSL with Let's Encrypt:
```bash
sudo certbot --nginx -d notionclipper.com
```

5. Update OAuth callbacks to production URLs:
   - Google: `https://notionclipper.com/auth/callback`
   - Notion: `https://notionclipper.com/auth/callback/notion`

### Deploy to Vercel/Netlify

1. Connect your repository to Vercel/Netlify

2. Configure build settings:
   - **Build command**: `npm run build`
   - **Output directory**: `dist`

3. Add environment variables in dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_NOTION_CLIENT_ID`
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_STRIPE_PUBLISHABLE_KEY`

4. Deploy and update OAuth callbacks

## Edge Functions Required

Ensure these Supabase Edge Functions are deployed:

1. **notion-oauth** - Handles Notion OAuth code exchange
2. **create-user** - Creates user profile after OAuth
3. **get-user-profile** - Fetches user profile
4. **get-subscription** - Fetches user subscription
5. **create-checkout** - Creates Stripe checkout session
6. **create-portal-session** - Creates Stripe customer portal session
7. **track-usage** - Tracks usage events

Deploy with:
```bash
cd ../supabase
supabase functions deploy <function-name>
```

## Database Schema

Required tables (should already exist in NotionClipper app database):

- `users` - User profiles
- `subscriptions` - User subscriptions and tiers
- `usage_records` - Monthly usage aggregations
- `usage_events` - Individual usage events
- `notion_integrations` - Notion workspace connections

## Testing OAuth Flow

### Test Google OAuth

1. Navigate to `/auth`
2. Click "Continue with Google"
3. Approve permissions
4. Should redirect to `/dashboard` with authenticated session

### Test Notion OAuth

1. Navigate to `/auth`
2. Click "Continue with Notion"
3. Select workspace and approve permissions
4. Should redirect to `/dashboard` with Notion workspace connected

### Test Dashboard

1. After authentication, verify dashboard shows:
   - User profile (email, join date)
   - Subscription tier (Free/Premium)
   - Usage quotas with progress bars
   - "Manage Subscription" or "Upgrade to Premium" button

### Test Stripe Integration

1. Click "Upgrade to Premium" (if on Free tier)
2. Should redirect to Stripe Checkout
3. Complete test payment with card: `4242 4242 4242 4242`
4. Should redirect back to dashboard with Premium tier

## Troubleshooting

### OAuth Errors

**Google:**
- Check `VITE_GOOGLE_CLIENT_ID` is correct
- Verify callback URL in Google Cloud Console
- Check Supabase Auth provider is enabled

**Notion:**
- Check `VITE_NOTION_CLIENT_ID` is correct
- Verify `NOTION_CLIENT_SECRET` is in Supabase Vault
- Check callback URL in Notion Integration Settings
- Review Edge Function logs: `supabase functions logs notion-oauth`

### Dashboard Not Loading

- Verify Edge Functions are deployed
- Check browser console for errors
- Verify `.env` variables are set
- Check Supabase database tables exist

### Build Errors

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

## Security

- ✅ All secrets stored in Supabase Vault (never in frontend)
- ✅ CORS configured to only allow requests from your domain
- ✅ Row Level Security (RLS) enabled on all database tables
- ✅ CSRF protection with state validation in OAuth flows
- ✅ HTTPS enforced in production
- ✅ Token encryption with AES-256-GCM

## License

Proprietary - NotionClipper Team

## Support

For issues or questions:
- Review [OAUTH_SETUP.md](./OAUTH_SETUP.md)
- Check Edge Function logs
- Review Supabase Auth logs
- Contact: support@notionclipper.com

---

**Last Updated:** 2025-11-17
**Version:** 1.0.0
**Author:** NotionClipper Team
