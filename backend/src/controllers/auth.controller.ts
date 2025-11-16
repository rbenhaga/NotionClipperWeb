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
  createOrUpdateNotionUser,
  generateAuthTokens,
  createEmailUser,
  validateEmailUser,
} from '../services/auth.service.js';
import { logger } from '../utils/logger.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { AppError } from '../types/index.js';

/**
 * GET /api/auth/google
 * Redirect to Google OAuth
 */
export const initiateGoogleAuth = asyncHandler(
  async (_req: Request, res: Response) => {
    const params = new URLSearchParams({
      client_id: config.oauth.google.clientId,
      redirect_uri: config.oauth.google.redirectUri,
      response_type: 'code',
      scope: OAUTH_SCOPES.GOOGLE,
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrl = `${GOOGLE_OAUTH.AUTH_URL}?${params.toString()}`;

    logger.info('Redirecting to Google OAuth');
    res.redirect(authUrl);
  }
);

/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback
 */
export const handleGoogleCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const { code, error } = req.query;

    if (error) {
      logger.error('Google OAuth error:', error);
      return res.redirect(`${getRedirectUrl()}/auth/error?error=${error}`);
    }

    if (!code || typeof code !== 'string') {
      throw new AppError('Authorization code is missing', 400);
    }

    // Exchange code for tokens
    const tokenResponse = await exchangeGoogleCode(code);

    // Get user info
    const profile = await getGoogleUserInfo(tokenResponse.access_token);

    // Create or update user
    const user = await createOrUpdateGoogleUser(profile);

    // Generate JWT tokens
    const tokens = generateAuthTokens(user);

    logger.info(`Google OAuth successful for user: ${user.email}`);

    // Redirect to frontend with token
    const redirectUrl = `${getRedirectUrl()}/auth/success?token=${tokens.accessToken}`;
    res.redirect(redirectUrl);
  }
);

/**
 * GET /api/auth/notion
 * Redirect to Notion OAuth
 */
export const initiateNotionAuth = asyncHandler(
  async (_req: Request, res: Response) => {
    const params = new URLSearchParams({
      client_id: config.oauth.notion.clientId,
      redirect_uri: config.oauth.notion.redirectUri,
      response_type: 'code',
      owner: 'user',
    });

    const authUrl = `${NOTION_OAUTH.AUTH_URL}?${params.toString()}`;

    logger.info('Redirecting to Notion OAuth');
    res.redirect(authUrl);
  }
);

/**
 * GET /api/auth/notion/callback
 * Handle Notion OAuth callback
 */
export const handleNotionCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const { code, error } = req.query;

    if (error) {
      logger.error('Notion OAuth error:', error);
      return res.redirect(`${getRedirectUrl()}/auth/error?error=${error}`);
    }

    if (!code || typeof code !== 'string') {
      throw new AppError('Authorization code is missing', 400);
    }

    // Exchange code for tokens
    const oauthResponse = await exchangeNotionCode(code);

    // Extract email (might need to ask user if not available)
    const email = oauthResponse.owner?.user?.person?.email;

    if (!email) {
      // Redirect to email input page
      return res.redirect(
        `${getRedirectUrl()}/auth/email?workspace=${oauthResponse.workspace_id}`
      );
    }

    // Create or update user
    const user = await createOrUpdateNotionUser(oauthResponse, email);

    // Generate JWT tokens
    const tokens = generateAuthTokens(user);

    logger.info(`Notion OAuth successful for user: ${user.email}`);

    // Redirect to frontend with token
    const redirectUrl = `${getRedirectUrl()}/auth/success?token=${tokens.accessToken}`;
    res.redirect(redirectUrl);
  }
);

/**
 * POST /api/auth/signup
 * Email/password signup
 */
export const signup = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters', 400);
    }

    // Create user with email/password
    const user = await createEmailUser(email, password, fullName);

    // Generate JWT tokens
    const tokens = generateAuthTokens(user);

    logger.info(`Email signup successful for user: ${user.email}`);

    sendSuccess(res, {
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
      },
      tokens,
    }, 201);
  }
);

/**
 * POST /api/auth/login
 * Email/password login
 */
export const login = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Validate credentials
    const user = await validateEmailUser(email, password);

    // Generate JWT tokens
    const tokens = generateAuthTokens(user);

    logger.info(`Email login successful for user: ${user.email}`);

    sendSuccess(res, {
      message: 'Login successful',
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
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
export const logout = asyncHandler(
  async (_req: Request, res: Response) => {
    // In JWT-based auth, logout is handled client-side by removing the token
    // This endpoint exists for completeness and future enhancements

    sendSuccess(res, { message: 'Logged out successfully' });
  }
);

/**
 * Helper: Get redirect URL based on environment
 */
function getRedirectUrl(): string {
  // Use FRONTEND_URL from config (defaults to http://localhost:5173 in dev)
  return config.frontendUrl || process.env.FRONTEND_URL || 'http://localhost:5173';
}
