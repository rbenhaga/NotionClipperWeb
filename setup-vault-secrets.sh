#!/bin/bash
# Script to configure all Supabase Vault secrets

echo "🔐 Configuring Supabase Vault secrets..."
echo ""
echo "This script will help you configure all required secrets in Supabase Vault."
echo ""

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Link to project if not already linked
echo "🔗 Linking to Supabase project..."
supabase link --project-ref rijjtngbgahxdjflfyhi

echo ""
echo "📝 Please provide the following secrets:"
echo ""

# Function to prompt for secret
prompt_secret() {
    local var_name=$1
    local description=$2
    local example=$3

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$var_name"
    echo "Description: $description"
    if [ -n "$example" ]; then
        echo "Example: $example"
    fi
    read -sp "Value: " value
    echo ""

    if [ -n "$value" ]; then
        supabase secrets set "$var_name=$value"
        echo "✅ $var_name configured"
    else
        echo "⚠️  Skipped $var_name"
    fi
    echo ""
}

# SERVICE_ROLE_KEY (for Edge Function authentication)
prompt_secret "SERVICE_ROLE_KEY" \
    "Your Supabase service_role key (same as in backend/.env)" \
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Google OAuth
prompt_secret "GOOGLE_CLIENT_ID" \
    "Get from: https://console.cloud.google.com/apis/credentials" \
    "123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com"

prompt_secret "GOOGLE_CLIENT_SECRET" \
    "Google OAuth Client Secret" \
    "GOCSPX-..."

# Notion OAuth
prompt_secret "NOTION_CLIENT_ID" \
    "Get from: https://www.notion.so/my-integrations" \
    "a1b2c3d4-e5f6-7890-abcd-ef1234567890"

prompt_secret "NOTION_CLIENT_SECRET" \
    "Notion OAuth Client Secret" \
    "secret_..."

# Stripe
prompt_secret "STRIPE_SECRET_KEY" \
    "Get from: https://dashboard.stripe.com/test/apikeys" \
    "sk_test_..."

prompt_secret "STRIPE_WEBHOOK_SECRET" \
    "Get from: https://dashboard.stripe.com/test/webhooks" \
    "whsec_..."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Configuration complete!"
echo ""
echo "To verify your secrets:"
echo "   supabase secrets list"
echo ""
echo "To test the backend:"
echo "   cd backend && npm run dev"
echo ""
