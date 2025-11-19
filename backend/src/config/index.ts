/**
 * Main Configuration File
 * Loads and validates environment variables
 */

import dotenv from 'dotenv';
import { AppConfig } from '../types/index.js';

// Load .env file
dotenv.config();

/**
 * Validate required environment variables
 * Note: OAuth secrets are loaded from Supabase Vault, not .env
 */
function validateEnv(): void {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
  ];

  // These can come from .env OR Supabase Vault
  const optional = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NOTION_CLIENT_ID',
    'NOTION_CLIENT_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'TOKEN_ENCRYPTION_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env file and ensure all required variables are set.'
    );
  }

  // Warn about optional variables (will be loaded from Vault if missing)
  const missingOptional = optional.filter((key) => !process.env[key]);
  if (missingOptional.length > 0) {
    console.log(
      `⚠️  Note: These variables will be loaded from Supabase Vault: ${missingOptional.join(', ')}`
    );
  }
}

// Validate environment on load
validateEnv();

/**
 * Application configuration object
 */
export const config: AppConfig = {
  env: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : [
        'http://localhost:3000',
        'http://localhost:5173',
        'notion-clipper://localhost',
      ],

  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },

  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback',
    },
    notion: {
      clientId: process.env.NOTION_CLIENT_ID || '',
      clientSecret: process.env.NOTION_CLIENT_SECRET || '',
      redirectUri: process.env.NOTION_REDIRECT_URI || 'http://localhost:3001/api/auth/notion/callback',
    },
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    prices: {
      monthly: process.env.STRIPE_PRICE_MONTHLY || '',
      annual: process.env.STRIPE_PRICE_ANNUAL || '',
      onetime: process.env.STRIPE_PRICE_ONETIME || '',
    },
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/backend.log',
  },
};

/**
 * Initialize secrets from Supabase Vault
 * MUST be called before starting the server
 */
export async function initializeSecrets(): Promise<void> {
  try {
    // Dynamically import to avoid circular dependency
    const { getSecrets } = await import('../services/secrets.service.js');

    console.log('🔐 Loading secrets from Supabase Vault...');
    const secrets = await getSecrets();

    // Update config with secrets from Vault
    config.oauth.google.clientId = secrets.GOOGLE_CLIENT_ID || config.oauth.google.clientId;
    config.oauth.google.clientSecret = secrets.GOOGLE_CLIENT_SECRET || config.oauth.google.clientSecret;
    config.oauth.notion.clientId = secrets.NOTION_CLIENT_ID || config.oauth.notion.clientId;
    config.oauth.notion.clientSecret = secrets.NOTION_CLIENT_SECRET || config.oauth.notion.clientSecret;
    config.stripe.secretKey = secrets.STRIPE_SECRET_KEY || config.stripe.secretKey;
    config.stripe.webhookSecret = secrets.STRIPE_WEBHOOK_SECRET || config.stripe.webhookSecret;
    config.stripe.prices.monthly = secrets.STRIPE_PRICE_MONTHLY || config.stripe.prices.monthly;
    config.stripe.prices.annual = secrets.STRIPE_PRICE_ANNUAL || config.stripe.prices.annual;
    
    // Set TOKEN_ENCRYPTION_KEY in process.env so crypto service can access it
    if (secrets.TOKEN_ENCRYPTION_KEY) {
      process.env.TOKEN_ENCRYPTION_KEY = secrets.TOKEN_ENCRYPTION_KEY;
    }

    console.log('✅ Secrets loaded successfully from Supabase Vault');
    console.log(`   Google Client ID: ${config.oauth.google.clientId.substring(0, 20)}...`);
    console.log(`   Notion Client ID: ${config.oauth.notion.clientId.substring(0, 20)}...`);
    console.log(`   Stripe Secret Key: ${config.stripe.secretKey.substring(0, 20)}...`);
    console.log(`   Token Encryption Key: ${secrets.TOKEN_ENCRYPTION_KEY ? '✓ loaded' : '✗ missing'}`);
  } catch (error) {
    console.error('❌ Failed to load secrets from Vault:', error);
    console.log('⚠️  Falling back to environment variables...');

    // Verify we have the minimum required secrets
    if (!config.oauth.google.clientId || !config.oauth.notion.clientId) {
      throw new Error(
        'Missing OAuth credentials. Please configure them in Supabase Vault or .env file.'
      );
    }
  }
}

/**
 * Check if running in production
 */
export const isProduction = config.env === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = config.env === 'development';

/**
 * Check if running in test
 */
export const isTest = config.env === 'test';
