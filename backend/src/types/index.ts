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
  FREE = 'free',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end?: boolean;
  created_at: Date;
  updated_at: Date;
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
    premiumPriceId: string;
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
