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

    const response = await fetch(edgeFunctionUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.supabase.serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json() as { error?: string };
      throw new Error(error.error || 'Failed to fetch secrets');
    }

    const secrets = await response.json() as Omit<SecretsCache, 'lastFetched'>;

    // Update cache
    secretsCache = {
      ...secrets,
      lastFetched: Date.now(),
    };

    logger.info('Secrets successfully fetched from Supabase Vault');

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
