/**
 * OAuth Controllers
 * Handles Google and Notion OAuth authentication flows
 */

import { Request, Response } from 'express';
import { config } from '../config/index.js';
import { GOOGLE_OAUTH, NOTION_OAUTH, OAUTH_SCOPES } from '../config/constants.js';
import {
  exchangeGoogleCode,
  getGoogleUserInfo,
  exchangeNotionCode,
  createOrUpdateGoogleUser,
  generateAuthTokens,
  checkNotionWorkspaceAvailability,
} from '../services/auth.service.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { db } from '../config/database.js';
import * as workspaceService from '../services/workspace.service.js';
import { logger } from '../utils/logger.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { AppError } from '../types/index.js';

/**
 * GET /api/auth/google
 * Redirect to Google OAuth
 * Query params:
 *   - source: 'app' | 'web' (default: 'web')
 *   - redirect: custom redirect URL after auth (optional)
 */
export const initiateGoogleAuth = asyncHandler(
  async (req: Request, res: Response) => {
    const source = req.query.source as string || 'web';
    const customRedirect = req.query.redirect as string || '';
    
    // Encode state with source and optional redirect
    const state = Buffer.from(JSON.stringify({ source, redirect: customRedirect })).toString('base64');
    
    const params = new URLSearchParams({
      client_id: config.oauth.google.clientId,
      redirect_uri: config.oauth.google.redirectUri,
      response_type: 'code',
      scope: OAUTH_SCOPES.GOOGLE,
      access_type: 'offline',
      prompt: 'consent',
      state,
    });

    const authUrl = `${GOOGLE_OAUTH.AUTH_URL}?${params.toString()}`;

    logger.info(`Redirecting to Google OAuth (source: ${source})`);
    res.redirect(authUrl);
  }
);

/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback
 */
export const handleGoogleCallback = async (req: Request, res: Response) => {
  // Parse state to get source (app or web)
  const stateData = parseOAuthState(req.query.state as string);
  const baseUrl = getRedirectUrlForSource(stateData.source);
  
  // 🔧 FIX: Helper to redirect errors - for app source, use deep link with error
  const redirectError = (errorMessage: string) => {
    if (stateData.source === 'app') {
      return res.redirect(`notion-clipper://auth/callback?error=${encodeURIComponent(errorMessage)}`);
    }
    return res.redirect(`${baseUrl}/auth/error?error=${encodeURIComponent(errorMessage)}`);
  };
  
  try {
    const { code, error } = req.query;

    if (error) {
      logger.error('Google OAuth error:', error);
      return redirectError(String(error));
    }

    if (!code || typeof code !== 'string') {
      return redirectError('Authorization code is missing');
    }

    // Exchange code for tokens
    const tokenResponse = await exchangeGoogleCode(code);

    // Get user info
    const profile = await getGoogleUserInfo(tokenResponse.access_token);

    // Create or update user
    const user = await createOrUpdateGoogleUser(profile);

    // Generate JWT tokens
    const tokens = generateAuthTokens(user);

    logger.info(`Google OAuth successful for user: ${user.email} (source: ${stateData.source})`);

    // Build redirect URL based on source
    const redirectUrl = buildAuthSuccessUrl(baseUrl, tokens.accessToken, stateData);
    res.redirect(redirectUrl);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
    logger.error('Google OAuth callback error:', err);
    // 🔧 FIX: Use deep link for app source errors
    if (stateData.source === 'app') {
      return res.redirect(`notion-clipper://auth/callback?error=${encodeURIComponent(errorMessage)}`);
    }
    res.redirect(`${baseUrl}/auth/error?error=${encodeURIComponent(errorMessage)}`);
  }
};

/**
 * GET /api/auth/notion
 * Redirect to Notion OAuth
 * Query params:
 *   - source: 'app' | 'web' (default: 'web')
 *   - redirect: custom redirect URL after auth (optional)
 *   - addToAccount: 'true' if adding workspace to existing account
 *   - userToken: JWT token of logged-in user (for adding workspace)
 */
export const initiateNotionAuth = asyncHandler(
  async (req: Request, res: Response) => {
    const source = req.query.source as string || 'web';
    const customRedirect = req.query.redirect as string || '';
    const addToAccount = req.query.addToAccount as string || '';
    const userToken = req.query.userToken as string || '';
    
    // Encode state with source, optional redirect, and user token for adding workspace
    const state = Buffer.from(JSON.stringify({ 
      source, 
      redirect: customRedirect,
      addToAccount: addToAccount === 'true',
      userToken: addToAccount === 'true' ? userToken : ''
    })).toString('base64');
    
    const params = new URLSearchParams({
      client_id: config.oauth.notion.clientId,
      redirect_uri: config.oauth.notion.redirectUri,
      response_type: 'code',
      owner: 'user',
      state,
    });

    const authUrl = `${NOTION_OAUTH.AUTH_URL}?${params.toString()}`;

    logger.info(`Redirecting to Notion OAuth (source: ${source}, addToAccount: ${addToAccount})`);
    res.redirect(authUrl);
  }
);

/**
 * GET /api/auth/notion/callback
 * Handle Notion OAuth callback
 * Supports two modes:
 * 1. New user signup/login via Notion
 * 2. Adding workspace to existing account (addToAccount=true in state)
 */
export const handleNotionCallback = async (req: Request, res: Response) => {
  // Parse state to get source (app or web)
  const stateData = parseOAuthState(req.query.state as string);
  const baseUrl = getRedirectUrlForSource(stateData.source);
  
  // 🔧 FIX: Helper to redirect errors - for app source, use deep link with error
  const redirectError = (errorMessage: string) => {
    if (stateData.source === 'app') {
      // For desktop app, redirect via deep link with error
      return res.redirect(`notion-clipper://auth/callback?error=${encodeURIComponent(errorMessage)}`);
    }
    return res.redirect(`${baseUrl}/auth/error?error=${encodeURIComponent(errorMessage)}`);
  };
  
  try {
    const { code, error } = req.query;

    if (error) {
      logger.error('Notion OAuth error:', error);
      return redirectError(String(error));
    }

    if (!code || typeof code !== 'string') {
      return redirectError('Authorization code is missing');
    }

    // Exchange code for tokens
    const oauthResponse = await exchangeNotionCode(code);
    const workspaceId = oauthResponse.workspace_id;
    const workspaceName = oauthResponse.workspace_name || 'My Workspace';

    // MODE 2: Adding workspace to existing account
    if (stateData.addToAccount && stateData.userToken) {
      try {
        // Verify the user token
        const decoded = verifyToken(stateData.userToken);
        if (!decoded) {
          throw new AppError('Invalid token', 401);
        }
        const userId = decoded.userId;
        
        // Get user from database
        const user = await db.getUserById(userId);
        if (!user) {
          throw new AppError('User not found', 404);
        }

        // Check workspace availability (anti-abuse)
        const availability = await workspaceService.checkWorkspaceAvailability(workspaceId, userId);
        if (!availability.available) {
          logger.warn(`Anti-abuse: User ${user.email} tried to add workspace ${workspaceId}: ${availability.reason}`);
          return res.redirect(`${baseUrl}/dashboard/settings?error=${encodeURIComponent(availability.reason)}`);
        }

        // Register workspace in history
        await workspaceService.registerWorkspaceConnection(workspaceId, workspaceName, userId, user.email);

        // Save the Notion connection
        await workspaceService.saveNotionConnection(
          userId,
          workspaceId,
          workspaceName,
          oauthResponse.access_token,
          oauthResponse.workspace_icon
        );

        // Log the connection attempt
        await workspaceService.logConnectionAttempt({
          userId,
          workspaceId,
          attemptType: 'connect',
          success: true
        });

        logger.info(`Workspace ${workspaceName} added to account ${user.email}`);

        // 🔧 FIX: If source=app, redirect to app via deep link (not to settings page)
        if (stateData.source === 'app') {
          logger.info(`Redirecting to desktop app after workspace added`);
          // Generate a fresh token for the user
          const tokens = generateAuthTokens(user);
          return res.redirect(`${baseUrl}/auth/success?token=${tokens.accessToken}&source=app`);
        }
        
        // Web flow: redirect back to settings with success message
        return res.redirect(`${baseUrl}/dashboard/settings?workspace_added=true`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add workspace';
        logger.error('Error adding workspace to account:', err);
        
        // 🔧 FIX: If source=app, redirect error via deep link
        if (stateData.source === 'app') {
          return res.redirect(`notion-clipper://auth/callback?error=${encodeURIComponent(errorMessage)}`);
        }
        return res.redirect(`${baseUrl}/dashboard/settings?error=${encodeURIComponent(errorMessage)}`);
      }
    }

    // MODE 1: New user signup/login via Notion
    const notionEmail = oauthResponse.owner?.user?.person?.email;
    logger.info(`Notion OAuth: Email from Notion: ${notionEmail || 'NOT PROVIDED'}`);

    // Check if user already exists with this workspace (returning user)
    const existingConnection = await db.getConnectionByWorkspace(workspaceId);
    if (existingConnection) {
      // Returning user - get their profile and log them in
      const existingUser = await db.getUserById(existingConnection.user_id);
      if (existingUser) {
        logger.info(`Notion OAuth: Returning user ${existingUser.email} for workspace ${workspaceId}`);
        const tokens = generateAuthTokens(existingUser);
        const redirectUrl = buildAuthSuccessUrl(baseUrl, tokens.accessToken, stateData);
        return res.redirect(redirectUrl);
      }
    }

    // New user registration
    if (notionEmail) {
      // Notion provided email - trust it (Notion has verified it)
      // Import createOrUpdateNotionUser for this case
      const { createOrUpdateNotionUser } = await import('../services/auth.service.js');
      
      logger.info(`Notion OAuth: Creating user with Notion-provided email: ${notionEmail}`);
      const user = await createOrUpdateNotionUser(oauthResponse, notionEmail);
      const tokens = generateAuthTokens(user);
      
      logger.info(`Notion OAuth successful for user: ${user.email} (source: ${stateData.source})`);
      const redirectUrl = buildAuthSuccessUrl(baseUrl, tokens.accessToken, stateData);
      return res.redirect(redirectUrl);
    }

    // No email from Notion - need to collect and verify
    logger.info(`Notion OAuth: No email provided, storing pending registration for workspace ${workspaceId}`);
    
    // Encrypt the access token before storing
    const { encryptToken } = await import('../services/crypto.service.js');
    const encryptedToken = await encryptToken(oauthResponse.access_token);
    
    // Store pending registration
    await db.savePendingNotionRegistration({
      workspaceId,
      workspaceName,
      workspaceIcon: oauthResponse.workspace_icon,
      accessToken: encryptedToken,
      ownerName: oauthResponse.owner?.user?.name,
      ownerAvatar: oauthResponse.owner?.user?.avatar_url,
      source: stateData.source,
    });
    
    // Redirect to email input page with workspace ID and source
    const sourceParam = stateData.source === 'app' ? '&source=app' : '';
    logger.info(`Notion OAuth: Redirecting to email input page: ${baseUrl}/auth/email?workspace=${workspaceId}${sourceParam}`);
    return res.redirect(
      `${baseUrl}/auth/email?workspace=${workspaceId}${sourceParam}`
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
    logger.error('Notion OAuth callback error:', err);
    // 🔧 FIX: Use deep link for app source errors (e.g., workspace already used)
    if (stateData.source === 'app') {
      return res.redirect(`notion-clipper://auth/callback?error=${encodeURIComponent(errorMessage)}`);
    }
    res.redirect(`${baseUrl}/auth/error?error=${encodeURIComponent(errorMessage)}`);
  }
};

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  // In JWT-based auth, logout is handled client-side by removing the token
  sendSuccess(res, { message: 'Logged out successfully' });
});

/**
 * POST /api/auth/notion/complete
 * Complete Notion registration with email (for users who didn't have email in OAuth)
 */
export const completeNotionRegistration = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId, email } = req.body;

    if (!workspaceId || !email) {
      throw new AppError('Workspace ID and email are required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Get pending registration
    const pending = await db.getPendingNotionRegistration(workspaceId);
    if (!pending) {
      throw new AppError('Registration expired or not found. Please try again with Notion.', 404);
    }

    // Check if email is already used
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      // User exists - they should login instead
      throw new AppError('An account with this email already exists. Please sign in instead.', 409);
    }

    // Check workspace availability (anti-abuse)
    const workspaceHistory = await db.getWorkspaceHistory(workspaceId);
    if (workspaceHistory && workspaceHistory.first_user_email !== email) {
      throw new AppError(
        'This Notion workspace is already linked to another account.',
        403
      );
    }

    // Update pending registration with email first
    await db.updatePendingNotionEmail(workspaceId, email);

    // Use inviteUserByEmail to create user AND send verification email in one step
    // This creates the user with email_confirmed=false and sends an invite link
    const { data: inviteData, error: inviteError } = await db.getSupabaseClient().auth.admin.inviteUserByEmail(email, {
      redirectTo: `${config.frontendUrl}/auth/verify-notion?workspace=${workspaceId}`,
      data: {
        full_name: pending.workspace_name || pending.owner_name,
        avatar_url: pending.workspace_icon || pending.owner_avatar,
        auth_provider: 'notion',
        pending_workspace_id: workspaceId,
      },
    });

    if (inviteError) {
      logger.error('Failed to invite user:', inviteError);
      if (inviteError.message.includes('already registered') || inviteError.message.includes('already been registered')) {
        throw new AppError('An account with this email already exists. Please sign in instead.', 409);
      }
      throw new AppError(`Failed to send verification email: ${inviteError.message}`, 500);
    }

    if (!inviteData.user) {
      throw new AppError('Failed to create user', 500);
    }

    logger.info(`Notion registration initiated for ${email}, verification email sent`);

    logger.info(`Notion registration initiated for ${email}, verification email sent`);

    sendSuccess(res, {
      message: 'Verification email sent. Please check your inbox.',
      email,
      requiresVerification: true,
    }, 201);
  }
);

/**
 * POST /api/auth/notion/finalize
 * Finalize Notion registration after email verification
 */
export const finalizeNotionRegistration = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.body;

    if (!workspaceId) {
      throw new AppError('Workspace ID is required', 400);
    }

    // Get pending registration
    const pending = await db.getPendingNotionRegistration(workspaceId);
    if (!pending) {
      throw new AppError('Registration expired or not found. Please try again.', 404);
    }

    if (!pending.email) {
      throw new AppError('Email not set for this registration', 400);
    }

    // Verify the user exists and email is confirmed
    const { data: authUsers } = await db.getSupabaseClient().auth.admin.listUsers();
    const authUser = authUsers?.users?.find(u => u.email === pending.email);

    if (!authUser) {
      throw new AppError('User not found. Please register again.', 404);
    }

    // Check if email is verified (Supabase sets email_confirmed_at when verified)
    if (!authUser.email_confirmed_at) {
      throw new AppError('Email not verified yet. Please check your inbox.', 403);
    }

    const userId = authUser.id;

    // Create user profile
    const userData = {
      id: userId,
      email: pending.email,
      full_name: pending.workspace_name || pending.owner_name,
      avatar_url: pending.workspace_icon || pending.owner_avatar,
      auth_provider: 'notion' as const,
    };

    const user = await db.upsertUser(userData);

    // Create default free subscription
    await db.upsertSubscription({
      user_id: userId,
      tier: 'FREE',
      status: 'active',
    });

    // Register workspace in history (anti-abuse)
    await db.registerWorkspaceHistory(
      workspaceId,
      pending.workspace_name || 'My Workspace',
      userId,
      pending.email
    );

    // Save Notion connection (token is already encrypted in pending)
    await db.saveNotionConnection(
      userId,
      workspaceId,
      pending.workspace_name || 'My Workspace',
      pending.access_token, // Already encrypted
      pending.workspace_icon
    );

    // Delete pending registration
    await db.deletePendingNotionRegistration(workspaceId);

    // Generate JWT tokens
    const tokens = generateAuthTokens(user);

    logger.info(`Notion registration finalized for user: ${user.email}`);

    sendSuccess(res, {
      message: 'Registration complete',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
      },
      tokens,
    });
  }
);

/**
 * GET /api/auth/check-workspace/:workspaceId
 * Check if Notion workspace is available
 */
export const checkWorkspace = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const userId = (req as any).user?.userId; // Optional, from auth middleware

    if (!workspaceId) {
      throw new AppError('Workspace ID is required', 400);
    }

    const result = await checkNotionWorkspaceAvailability(workspaceId, userId);

    sendSuccess(res, result);
  }
);

/**
 * Helper: Parse OAuth state parameter
 */
interface OAuthState {
  source: 'app' | 'web';
  redirect?: string;
  addToAccount?: boolean;
  userToken?: string;
}

function parseOAuthState(state: string | undefined): OAuthState {
  if (!state) {
    return { source: 'web' };
  }
  
  try {
    const decoded = Buffer.from(state, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded) as OAuthState;
    return {
      source: parsed.source === 'app' ? 'app' : 'web',
      redirect: parsed.redirect,
      addToAccount: parsed.addToAccount || false,
      userToken: parsed.userToken || '',
    };
  } catch {
    logger.warn('Failed to parse OAuth state, defaulting to web');
    return { source: 'web' };
  }
}

/**
 * Helper: Get redirect URL based on source (app or web)
 */
function getRedirectUrlForSource(_source: 'app' | 'web'): string {
  // Always use frontend URL - for app source, we'll handle deep link in buildAuthSuccessUrl
  return config.frontendUrl || process.env.FRONTEND_URL || 'http://localhost:5173';
}

/**
 * Helper: Build auth success URL with token
 */
function buildAuthSuccessUrl(baseUrl: string, token: string, stateData: OAuthState): string {
  // If custom redirect is specified, use it
  if (stateData.redirect) {
    const separator = stateData.redirect.includes('?') ? '&' : '?';
    return `${stateData.redirect}${separator}token=${token}`;
  }
  
  // For desktop app: redirect to frontend page that will handle deep link
  if (stateData.source === 'app') {
    // The frontend /auth/success page will detect source=app and redirect to deep link
    return `${baseUrl}/auth/success?token=${token}&source=app`;
  }
  
  // Default success page for web
  return `${baseUrl}/auth/success?token=${token}`;
}


