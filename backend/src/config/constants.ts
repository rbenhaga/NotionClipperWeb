/**
 * Application Constants
 * Centralized configuration values
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
} as const;

export const STRIPE_PLANS = {
  PREMIUM_MONTHLY: 'premium_monthly',
  PREMIUM_ANNUAL: 'premium_annual',
  PREMIUM_ONETIME: 'premium_onetime',
} as const;

export const STRIPE_PRICES = {
  PREMIUM_MONTHLY: {
    amount: 299, // 2.99€ in cents
    currency: 'eur',
    interval: 'month',
    trial_period_days: 14,
  },
  PREMIUM_ANNUAL: {
    amount: 2868, // 28.68€ in cents (20% off)
    currency: 'eur',
    interval: 'year',
    trial_period_days: 14,
  },
  PREMIUM_ONETIME: {
    amount: null, // TBD
    currency: 'eur',
    interval: 'one_time',
  },
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
  TRIALING: 'trialing',
} as const;

export const AUTH_PROVIDERS = {
  GOOGLE: 'google',
  NOTION: 'notion',
  EMAIL: 'email',
} as const;

// Quota limits per tier
export const QUOTAS = {
  FREE: {
    clips_per_month: 100,
    files_per_month: 10,
    focus_mode_minutes: 60,
    compact_mode_minutes: 30,
  },
  PREMIUM: {
    clips_per_month: -1, // Unlimited
    files_per_month: -1, // Unlimited
    focus_mode_minutes: -1, // Unlimited
    compact_mode_minutes: -1, // Unlimited
  },
  ENTERPRISE: {
    clips_per_month: -1,
    files_per_month: -1,
    focus_mode_minutes: -1,
    compact_mode_minutes: -1,
  },
} as const;

// OAuth scopes
export const OAUTH_SCOPES = {
  GOOGLE: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ].join(' '),
  NOTION: 'email,user:read,workspace:read',
} as const;

// API endpoints
export const GOOGLE_OAUTH = {
  AUTH_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
  TOKEN_URL: 'https://oauth2.googleapis.com/token',
  USERINFO_URL: 'https://www.googleapis.com/oauth2/v2/userinfo',
} as const;

export const NOTION_OAUTH = {
  AUTH_URL: 'https://api.notion.com/v1/oauth/authorize',
  TOKEN_URL: 'https://api.notion.com/v1/oauth/token',
} as const;

// Rate limiting
export const RATE_LIMITS = {
  GENERAL: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5,
  },
  STRIPE_WEBHOOK: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 100,
  },
} as const;

// Cache TTL
export const CACHE_TTL = {
  USER_DATA: 5 * 60 * 1000, // 5 minutes
  SUBSCRIPTION: 10 * 60 * 1000, // 10 minutes
  NOTION_TOKEN: 30 * 60 * 1000, // 30 minutes
} as const;

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to access this resource',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  VALIDATION_ERROR: 'Invalid input data',
  INTERNAL_ERROR: 'An internal server error occurred',
  OAUTH_FAILED: 'OAuth authentication failed',
  STRIPE_ERROR: 'Payment processing error',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
  TOKEN_EXPIRED: 'Your session has expired, please login again',
  INVALID_TOKEN: 'Invalid authentication token',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  SUBSCRIPTION_CREATED: 'Subscription created successfully',
  SUBSCRIPTION_UPDATED: 'Subscription updated successfully',
  SUBSCRIPTION_CANCELED: 'Subscription canceled successfully',
} as const;

// Regex patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  JWT: /^Bearer\s+[\w-]+\.[\w-]+\.[\w-]+$/,
} as const;

// JWT
export const JWT_CONFIG = {
  ALGORITHM: 'HS256',
  ISSUER: 'notion-clipper-backend',
  AUDIENCE: 'notion-clipper-app',
} as const;

// Logging
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const;
