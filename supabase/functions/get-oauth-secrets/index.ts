/**
 * Supabase Edge Function: Get OAuth Secrets
 * Returns OAuth secrets from Supabase Vault for backend VPS
 * Secured with SERVICE_ROLE_KEY verification
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY');

    // Verify it's the service role key
    if (token !== serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get secrets from environment (Supabase Vault)
    const secrets = {
      GOOGLE_CLIENT_ID: Deno.env.get('GOOGLE_CLIENT_ID'),
      GOOGLE_CLIENT_SECRET: Deno.env.get('GOOGLE_CLIENT_SECRET'),
      NOTION_CLIENT_ID: Deno.env.get('NOTION_CLIENT_ID'),
      NOTION_CLIENT_SECRET: Deno.env.get('NOTION_CLIENT_SECRET'),
      STRIPE_SECRET_KEY: Deno.env.get('STRIPE_SECRET_KEY'),
      STRIPE_WEBHOOK_SECRET: Deno.env.get('STRIPE_WEBHOOK_SECRET'),
      TOKEN_ENCRYPTION_KEY: Deno.env.get('TOKEN_ENCRYPTION_KEY'),
      STRIPE_PRICE_MONTHLY: Deno.env.get('STRIPE_PRICE_MONTHLY'),
      STRIPE_PRICE_ANNUAL: Deno.env.get('STRIPE_PRICE_ANNUAL'),
    };

    // Verify all secrets are present
    const missingSecrets = Object.entries(secrets)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingSecrets.length > 0) {
      return new Response(
        JSON.stringify({
          error: 'Missing secrets',
          missing: missingSecrets,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(secrets), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
