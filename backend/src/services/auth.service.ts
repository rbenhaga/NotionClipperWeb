/**
 * Authentication Service
 * Handles OAuth flows and user authentication
 */

import { config } from '../config/index.js';
import { GOOGLE_OAUTH, NOTION_OAUTH } from '../config/constants.js';
import { db } from '../config/database.js';
import { generateToken } from '../middleware/auth.middleware.js';
import { logger } from '../utils/logger.js';
import {
  GoogleTokenResponse,
  GoogleOAuthProfile,
  NotionOAuthResponse,
  UnauthorizedError,
  AppError,
} from '../types/index.js';

/**
 * Exchange Google OAuth code for tokens
 */
export async function exchangeGoogleCode(code: string): Promise<GoogleTokenResponse> {
  const params = new URLSearchParams({
    code,
    client_id: config.oauth.google.clientId,
    client_secret: config.oauth.google.clientSecret,
    redirect_uri: config.oauth.google.redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch(GOOGLE_OAUTH.TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error('Google token exchange failed:', error);
    throw new UnauthorizedError('Failed to exchange Google authorization code');
  }

  return response.json() as Promise<GoogleTokenResponse>;
}

/**
 * Get Google user info from access token
 */
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleOAuthProfile> {
  const response = await fetch(GOOGLE_OAUTH.USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error('Google userinfo fetch failed:', error);
    throw new UnauthorizedError('Failed to fetch Google user info');
  }

  return response.json() as Promise<GoogleOAuthProfile>;
}

/**
 * Exchange Notion OAuth code for tokens
 */
export async function exchangeNotionCode(code: string): Promise<NotionOAuthResponse> {
  const credentials = Buffer.from(
    `${config.oauth.notion.clientId}:${config.oauth.notion.clientSecret}`
  ).toString('base64');

  const response = await fetch(NOTION_OAUTH.TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.oauth.notion.redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error('Notion token exchange failed:', error);
    throw new UnauthorizedError('Failed to exchange Notion authorization code');
  }

  return response.json() as Promise<NotionOAuthResponse>;
}

/**
 * Create or update user from Google OAuth
 */
export async function createOrUpdateGoogleUser(profile: GoogleOAuthProfile) {
  // Check if user exists by email first
  const existingUser = await db.getUserByEmail(profile.email);

  if (existingUser) {
    logger.info(`Updating existing user: ${existingUser.id}`);
    // User exists, update their profile
    return db.upsertUser({
      id: existingUser.id,
      email: profile.email,
      full_name: profile.name || existingUser.full_name,
      avatar_url: profile.picture || existingUser.avatar_url,
      auth_provider: existingUser.auth_provider, // Keep original provider
    });
  }

  // User doesn't exist, create in auth.users first using Supabase Admin API
  logger.info(`Creating new Google user via Supabase Auth`);

  const { data: authUser, error: authError } = await db.getSupabaseClient().auth.admin.createUser({
    email: profile.email,
    email_confirm: true, // Auto-confirm email for OAuth users
    user_metadata: {
      full_name: profile.name,
      avatar_url: profile.picture,
      auth_provider: 'google',
    },
  });

  if (authError) {
    logger.error('Failed to create auth user:', authError);
    throw new AppError(`Failed to create user: ${authError.message}`, 500);
  }

  if (!authUser.user) {
    throw new AppError('Failed to create user', 500);
  }

  // Now create user profile with the auth.users ID
  const userData = {
    id: authUser.user.id,
    email: profile.email,
    full_name: profile.name,
    avatar_url: profile.picture,
    auth_provider: 'google' as const,
  };

  const user = await db.upsertUser(userData);

  // Create default free subscription for new user
  await db.upsertSubscription({
    user_id: authUser.user.id,
    tier: 'FREE',
    status: 'active',
  });

  logger.info(`Free subscription created for new Google user: ${authUser.user.id}`);

  return user;
}

/**
 * Create or update user from Notion OAuth
 */
export async function createOrUpdateNotionUser(
  oauthResponse: NotionOAuthResponse,
  email?: string
) {
  // Extract email from owner if available
  const ownerEmail = email || oauthResponse.owner?.user?.person?.email;

  if (!ownerEmail) {
    throw new AppError('Email is required for Notion authentication', 400);
  }

  // Check if user exists by email first
  const existingUser = await db.getUserByEmail(ownerEmail);

  if (existingUser) {
    logger.info(`Updating existing user: ${existingUser.id}`);

    // Save/update Notion connection for existing user
    await saveNotionConnection(
      existingUser.id,
      oauthResponse.workspace_id,
      oauthResponse.workspace_name || 'My Workspace',
      oauthResponse.access_token
    );

    // User exists, update their profile
    return db.upsertUser({
      id: existingUser.id,
      email: ownerEmail,
      full_name: oauthResponse.owner?.user?.name || existingUser.full_name,
      avatar_url: oauthResponse.owner?.user?.avatar_url || existingUser.avatar_url,
      auth_provider: existingUser.auth_provider, // Keep original provider
    });
  }

  // User doesn't exist, create in auth.users first using Supabase Admin API
  logger.info(`Creating new Notion user via Supabase Auth`);

  const { data: authUser, error: authError } = await db.getSupabaseClient().auth.admin.createUser({
    email: ownerEmail,
    email_confirm: true, // Auto-confirm email for OAuth users
    user_metadata: {
      full_name: oauthResponse.workspace_name || oauthResponse.owner?.user?.name,
      avatar_url: oauthResponse.workspace_icon || oauthResponse.owner?.user?.avatar_url,
      auth_provider: 'notion',
    },
  });

  if (authError) {
    logger.error('Failed to create auth user:', authError);
    throw new AppError(`Failed to create user: ${authError.message}`, 500);
  }

  if (!authUser.user) {
    throw new AppError('Failed to create user', 500);
  }

  const userId = authUser.user.id;

  const userData = {
    id: userId,
    email: ownerEmail,
    full_name: oauthResponse.workspace_name || oauthResponse.owner?.user?.name,
    avatar_url: oauthResponse.workspace_icon || oauthResponse.owner?.user?.avatar_url,
    auth_provider: 'notion' as const,
  };

  // Create Notion user profile
  const user = await db.upsertUser(userData);

  // Create default free subscription for new user
  await db.upsertSubscription({
    user_id: userId,
    tier: 'FREE',
    status: 'active',
  });

  logger.info(`Free subscription created for new Notion user: ${userId}`);

  // Save Notion connection
  await saveNotionConnection(
    userId,
    oauthResponse.workspace_id,
    oauthResponse.workspace_name || 'My Workspace',
    oauthResponse.access_token
  );

  return user;
}

/**
 * Save encrypted Notion connection
 */
async function saveNotionConnection(
  userId: string,
  workspaceId: string,
  workspaceName: string,
  accessToken: string
) {
  // Import crypto service for token encryption
  const { encryptToken } = await import('../services/crypto.service.js');

  // Encrypt token before saving (AES-256-GCM)
  const encryptedToken = await encryptToken(accessToken);

  logger.info('Notion token encrypted successfully');

  await db.saveNotionConnection(userId, workspaceId, workspaceName, encryptedToken);

  logger.info(`Notion connection saved for user: ${userId}`);
}

/**
 * Create user with email/password using Supabase Auth
 * Automatically sends email verification
 */
export async function createEmailUser(email: string, password: string, fullName?: string) {
  // Use Supabase Auth to create user (handles password hashing and email verification)
  const { data, error } = await db.getSupabaseClient().auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || email.split('@')[0],
      },
      emailRedirectTo: `${config.frontendUrl}/auth/verify`,
    },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      throw new AppError('User with this email already exists', 409);
    }
    throw new AppError(error.message, 400);
  }

  if (!data.user) {
    throw new AppError('Failed to create user', 500);
  }

  // Create user record in our database
  const userId = data.user.id;

  const userData = {
    id: userId,
    email: data.user.email!,
    full_name: fullName || email.split('@')[0],
    auth_provider: 'email' as const,
  };

  const user = await db.upsertUser(userData);

  logger.info(`Email user created with verification email sent: ${user.email}`);

  return {
    ...user,
    emailVerificationSent: true,
  };
}

/**
 * Validate email/password credentials using Supabase Auth
 */
export async function validateEmailUser(email: string, password: string) {
  // Use Supabase Auth to validate credentials
  const { data, error } = await db.getSupabaseClient().auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('Email not confirmed')) {
      throw new AppError('Please verify your email before logging in', 403);
    }
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!data.user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Get user from our database
  const user = await db.getUserByEmail(email);

  if (!user) {
    // Create user record if it doesn't exist (edge case)
    const userData = {
      id: data.user.id,
      email: data.user.email!,
      full_name: data.user.user_metadata?.full_name || email.split('@')[0],
      auth_provider: 'email' as const,
    };
    return await db.upsertUser(userData);
  }

  if (user.auth_provider !== 'email') {
    throw new AppError(
      `This email is registered with ${user.auth_provider}. Please use ${user.auth_provider} to sign in.`,
      400
    );
  }

  logger.info(`Email user validated: ${user.email}`);

  return user;
}

/**
 * Resend email verification
 */
export async function resendVerificationEmail(email: string) {
  const { error } = await db.getSupabaseClient().auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${config.frontendUrl}/auth/verify`,
    },
  });

  if (error) {
    throw new AppError(error.message, 400);
  }

  logger.info(`Verification email resent to: ${email}`);

  return { message: 'Verification email sent successfully' };
}

/**
 * Generate authentication tokens for user
 */
export function generateAuthTokens(user: {
  id: string;
  email: string;
  auth_provider: 'google' | 'notion' | 'email';
}) {
  const accessToken = generateToken({
    userId: user.id,
    email: user.email,
    provider: user.auth_provider,
  });

  return {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: config.jwt.expiresIn,
  };
}
