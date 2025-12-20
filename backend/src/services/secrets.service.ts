/**
 * Secrets Service
 * Retrieves secrets from Supabase Vault via Edge Function
 * 
 * 🔒 SECURITY (2025-12-18):
 * - Uses BACKEND_SHARED_SECRET (not SERVICE_ROLE_KEY)
 * - POST method only (Edge Function rejects GET)
 * - No Origin header (Edge Function rejects browser requests)
 */

import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export interface SecretsCache {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  NOTION_CLIENT_ID: string;
  NOTION_CLIENT_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  TOKEN_ENCRYPTION_KEY: string;
  STRIPE_PRICE_MONTHLY: string;
  STRIPE_PRICE_ANNUAL: string;
  lastFetched: number;
}

let secretsCache: SecretsCache | null = null;
const CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Get secrets from Supabase Vault via Edge Function
 * Uses caching to avoid excessive calls
 * 
 * 🔒 SECURITY: Uses BACKEND_SHARED_SECRET for authentication
 */
export async function getSecrets(): Promise<SecretsCache> {
  // Return cached secrets if still valid
  if (secretsCache && Date.now() - secretsCache.lastFetched < CACHE_TTL) {
    return secretsCache;
  }

  logger.info('Fetching secrets from Supabase Edge Function...');

  try {
    // Call Supabase Edge Function to get secrets
    const edgeFunctionUrl = `${config.supabase.url}/functions/v1/get-oauth-secrets`;

    // 🔒 SECURITY: Use dedicated BACKEND_SHARED_SECRET
    // This secret is ONLY for backend-to-edge communication
    // It is NOT the same as SERVICE_ROLE_KEY
    const backendSecret = process.env.BACKEND_SHARED_SECRET;
    
    if (!backendSecret) {
      logger.error('CRITICAL: BACKEND_SHARED_SECRET not configured in environment');
      throw new Error('BACKEND_SHARED_SECRET not configured');
    }

    logger.info(`Calling Edge Function: ${edgeFunctionUrl}`);

    // 🔒 SECURITY: POST method, no Origin header (anti-browser)
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${backendSecret}`,
        'Content-Type': 'application/json',
        // 🔒 Explicitly NOT setting Origin header
      },
    });

    logger.info(`Edge Function response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      // Try to get error details
      const responseText = await response.text();
      logger.error(`Edge Function error response (${response.status}): ${responseText}`);

      let errorMessage = 'Failed to fetch secrets';
      try {
        const errorJson = JSON.parse(responseText) as { error?: string };
        errorMessage = errorJson.error || errorMessage;
      } catch {
        // Response is not JSON, use text as error
        errorMessage = responseText || errorMessage;
      }

      throw new Error(`HTTP ${response.status}: ${errorMessage}`);
    }

    const secrets = await response.json() as Omit<SecretsCache, 'lastFetched'>;

    // Verify we got all expected secrets
    const expectedSecrets = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'NOTION_CLIENT_ID',
      'NOTION_CLIENT_SECRET',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'TOKEN_ENCRYPTION_KEY',
      'STRIPE_PRICE_MONTHLY',
      'STRIPE_PRICE_ANNUAL',
    ];

    const missingSecrets = expectedSecrets.filter(
      (key) => !secrets[key as keyof typeof secrets]
    );

    if (missingSecrets.length > 0) {
      logger.warn(`Edge Function returned empty values for: ${missingSecrets.join(', ')}`);
      logger.warn('These secrets need to be configured in Supabase Vault');
    }

    // Update cache
    secretsCache = {
      ...secrets,
      lastFetched: Date.now(),
    };

    logger.info('Secrets successfully fetched from Supabase Vault');
    logger.info(`  Google Client ID: ${secrets.GOOGLE_CLIENT_ID ? '✓ loaded' : '✗ missing'}`);
    logger.info(`  Notion Client ID: ${secrets.NOTION_CLIENT_ID ? '✓ loaded' : '✗ missing'}`);
    logger.info(`  Stripe Secret Key: ${secrets.STRIPE_SECRET_KEY ? '✓ loaded' : '✗ missing'}`);

    return secretsCache;
  } catch (error) {
    logger.error('Error fetching secrets from Edge Function:', error);

    // 🔒 SECURITY: In PRODUCTION, fail hard - no fallback
    // This prevents running with incomplete security config
    const isProd = process.env.NODE_ENV === 'production';
    
    if (isProd) {
      logger.error('🚨 FATAL: Cannot start in production without Edge Function secrets');
      logger.error('   Ensure BACKEND_SHARED_SECRET is set and Edge Function is deployed');
      throw new Error('FATAL: Secrets not available in production - refusing to start');
    }

    // DEV/TEST only: Fallback to environment variables
    logger.warn('⚠️  DEV MODE: Falling back to environment variables for secrets');
    logger.warn('   This fallback is DISABLED in production');

    secretsCache = {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
      NOTION_CLIENT_ID: process.env.NOTION_CLIENT_ID || '',
      NOTION_CLIENT_SECRET: process.env.NOTION_CLIENT_SECRET || '',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
      TOKEN_ENCRYPTION_KEY: process.env.TOKEN_ENCRYPTION_KEY || '',
      STRIPE_PRICE_MONTHLY: process.env.STRIPE_PRICE_MONTHLY || '',
      STRIPE_PRICE_ANNUAL: process.env.STRIPE_PRICE_ANNUAL || '',
      lastFetched: Date.now(),
    };

    return secretsCache;
  }
}

/**
 * Get a specific secret
 */
export async function getSecret(name: keyof Omit<SecretsCache, 'lastFetched'>): Promise<string> {
  const secrets = await getSecrets();
  return secrets[name];
}

/**
 * Clear secrets cache (useful for testing or manual refresh)
 */
export function clearSecretsCache(): void {
  secretsCache = null;
  logger.info('Secrets cache cleared');
}
