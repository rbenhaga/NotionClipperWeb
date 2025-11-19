/**
 * Secrets Service
 * Retrieves secrets from Supabase Vault via Edge Function
 */

import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

interface SecretsCache {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  NOTION_CLIENT_ID: string;
  NOTION_CLIENT_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  TOKEN_ENCRYPTION_KEY: string;
  STRIPE_PREMIUM_PRICE_ID: string;
  STRIPE_PRICE_MONTHLY: string;
  STRIPE_PRICE_ANNUAL: string;
  lastFetched: number;
}

let secretsCache: SecretsCache | null = null;
const CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Get secrets from Supabase Vault via Edge Function
 * Uses caching to avoid excessive calls
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

    logger.info(`Calling Edge Function: ${edgeFunctionUrl}`);
    logger.debug(`Using SERVICE_ROLE_KEY: ${config.supabase.serviceRoleKey.substring(0, 20)}...`);

    const response = await fetch(edgeFunctionUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.supabase.serviceRoleKey}`,
        'Content-Type': 'application/json',
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
      'STRIPE_PREMIUM_PRICE_ID',
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
    logger.info(`  Google Client ID: ${secrets.GOOGLE_CLIENT_ID?.substring(0, 20) || '(empty)'}...`);
    logger.info(`  Notion Client ID: ${secrets.NOTION_CLIENT_ID?.substring(0, 20) || '(empty)'}...`);
    logger.info(`  Stripe Secret Key: ${secrets.STRIPE_SECRET_KEY?.substring(0, 20) || '(empty)'}...`);

    return secretsCache;
  } catch (error) {
    logger.error('Error fetching secrets from Edge Function:', error);

    // Fallback to environment variables if Edge Function fails
    logger.warn('Falling back to environment variables for secrets');

    secretsCache = {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
      NOTION_CLIENT_ID: process.env.NOTION_CLIENT_ID || '',
      NOTION_CLIENT_SECRET: process.env.NOTION_CLIENT_SECRET || '',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
      TOKEN_ENCRYPTION_KEY: process.env.TOKEN_ENCRYPTION_KEY || '',
      STRIPE_PREMIUM_PRICE_ID: process.env.STRIPE_PREMIUM_PRICE_ID || '',
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
