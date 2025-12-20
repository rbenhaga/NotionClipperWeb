/**
 * TypeScript Type Definitions for Backend API
 */

import { Request } from 'express';

// ============================================
// USER & AUTH TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  auth_provider: 'google' | 'notion' | 'email';
  created_at: Date;
  updated_at: Date;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  provider: 'google' | 'notion' | 'email';
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

// ============================================
// OAUTH TYPES
// ============================================

export interface GoogleOAuthProfile {
  id: string;
  email: string;
  verified_email: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
}

export interface NotionOAuthResponse {
  access_token: string;
  bot_id: string;
  workspace_id: string;
  workspace_name?: string;
  workspace_icon?: string;
  owner: {
    type: string;
    user?: {
      id: string;
      name?: string;
      avatar_url?: string;
      type: string;
      person?: {
        email?: string;
      };
    };
  };
}

// ============================================
// SUBSCRIPTION & STRIPE TYPES
// ============================================

export enum SubscriptionTier {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  GRACE_PERIOD = 'GRACE_PERIOD',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIALING = 'trialing',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_price_id?: string;
  current_period_start: Date;
  current_period_end: Date;
  cancel_at?: Date;
  canceled_at?: Date;
  grace_period_ends_at?: Date;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// USAGE TRACKING TYPES
// ============================================

export interface UsageRecord {
  id: string;
  user_id: string;
  subscription_id: string;
  period_start: Date;
  period_end: Date;
  year: number;
  month: number;
  clips_count: number;
  files_count: number;
  focus_mode_minutes: number;
  compact_mode_minutes: number;
  created_at: Date;
  updated_at: Date;
}

export enum UsageEventType {
  CLIP_SENT = 'clip_sent',
  FILE_UPLOADED = 'file_uploaded',
  FOCUS_MODE_STARTED = 'focus_mode_started',
  FOCUS_MODE_ENDED = 'focus_mode_ended',
  COMPACT_MODE_STARTED = 'compact_mode_started',
  COMPACT_MODE_ENDED = 'compact_mode_ended',
  QUOTA_EXCEEDED = 'quota_exceeded',
  SUBSCRIPTION_UPGRADED = 'subscription_upgraded',
  SUBSCRIPTION_DOWNGRADED = 'subscription_downgraded',
}

export enum UsageFeature {
  CLIPS = 'clips',
  FILES = 'files',
  FOCUS_MODE_MINUTES = 'focus_mode_minutes',
  COMPACT_MODE_MINUTES = 'compact_mode_minutes',
}

export interface UsageEvent {
  id: string;
  user_id: string;
  subscription_id?: string;
  usage_record_id: string;
  event_type: UsageEventType;
  feature: UsageFeature;
  metadata?: Record<string, any>;
  created_at: Date;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    timestamp: Date;
    requestId?: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// CONFIGURATION TYPES
// ============================================

export interface AppConfig {
  env: 'development' | 'production' | 'test';
  port: number;
  host: string;
  frontendUrl: string;
  allowedOrigins: string[];
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  oauth: {
    google: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    };
    notion: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    };
  };
  stripe: {
    secretKey: string;
    webhookSecret: string;
    prices: {
      monthly: string;
      annual: string;
      onetime: string;
    };
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  logging: {
    level: string;
    file: string;
  };
  notion: {
    maxInFlightRequests: number;
    cooldownMinSeconds: number;
    maxRetryAfterSeconds: number;
    readMaxRetries: number;
    backoffBaseMs: number;
    backoffMaxMs: number;
    circuitBreaker: {
      failureThreshold: number;
      resetMs: number;
      halfOpenMaxCalls: number;
    };
  };
  redis: {
    url?: string;
    enableQueue: boolean;
  };
  queue: {
    notionWrites: {
      attempts: number;
      backoffDelayMs: number;
      maxBackoffMs: number;
      maxAttempts: number;
      concurrency: number;
      removeOnComplete: number;
      removeOnFail: number;
    };
  };
  featureFlags: {
    notionDegradedMode: boolean;
    proxyWritesAsync: boolean;
  };
  observability: {
    enablePrometheus: boolean;
    metricsRoute: string;
    metricsToken?: string;
  };
}

// ============================================
// ERROR TYPES
// ============================================

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', details);
    this.name = 'ConflictError';
  }
}
