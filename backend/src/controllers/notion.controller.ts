/**
 * Notion Controllers
 * Handles Notion-specific operations (tokens, connections, workspace lookups)
 */

import { Request, Response } from 'express';
import { db } from '../config/database.js';
import { encryptToken, decryptToken } from '../services/crypto.service.js';
import { logger } from '../utils/logger.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { AppError } from '../types/index.js';

/**
 * POST /api/notion/get-token
 * Get and decrypt Notion access token for a user
 */
export const getNotionToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.body;

    if (!userId) {
      throw new AppError('userId is required', 400);
    }

    logger.info(`Getting Notion token for user: ${userId}`);

    // Verify user exists
    const user = await db.getUserById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get active notion connection
    const connection = await db.getNotionConnection(userId);

    if (!connection) {
      throw new AppError('No Notion connection found for this user', 404);
    }

    if (!connection.is_active) {
      throw new AppError('Notion connection is inactive', 403);
    }

    // Decrypt the token
    const decryptedToken = await decryptToken(connection.access_token_encrypted);

    logger.info(`✅ Token retrieved for user: ${userId}`);

    sendSuccess(res, {
      success: true,
      token: decryptedToken,
      workspaceName: connection.workspace_name,
      workspaceIcon: connection.workspace_icon,
    });
  }
);

/**
 * POST /api/notion/save-connection
 * Encrypt and save Notion connection
 */
export const saveNotionConnection = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      userId,
      workspaceId,
      workspaceName,
      workspaceIcon,
      accessToken,
      isActive = true,
    } = req.body;

    if (!userId || !workspaceId || !accessToken) {
      throw new AppError('userId, workspaceId, and accessToken are required', 400);
    }

    logger.info(`Saving Notion connection for user: ${userId}, workspace: ${workspaceId}`);

    // Encrypt the access token
    const encryptedToken = await encryptToken(accessToken);

    logger.info('Token encrypted successfully');

    // Save to database
    const connection = await db.saveNotionConnection(
      userId,
      workspaceId,
      workspaceName,
      encryptedToken,
      workspaceIcon,
      isActive
    );

    logger.info('✅ Notion connection saved successfully');

    // Return connection info with original (unencrypted) token
    // so client can use it immediately
    sendSuccess(res, {
      success: true,
      connection: {
        id: connection.id,
        userId: connection.user_id,
        workspaceId: connection.workspace_id,
        workspaceName: connection.workspace_name,
        workspaceIcon: connection.workspace_icon,
        accessToken: accessToken, // Return original token (not encrypted)
        isActive: connection.is_active,
      },
    });
  }
);

/**
 * POST /api/notion/get-user-by-workspace
 * Find user by Notion workspace ID
 * Used for auto-reconnection (avoid asking for email again)
 */
export const getUserByWorkspace = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.body;

    if (!workspaceId) {
      throw new AppError('workspaceId is required', 400);
    }

    logger.info(`Searching for workspace: ${workspaceId}`);

    // Find active connection for this workspace
    const connection = await db.getConnectionByWorkspace(workspaceId);

    if (!connection) {
      logger.info(`No active connection found for workspace: ${workspaceId}`);
      sendSuccess(res, { user: null });
      return;
    }

    logger.info(`Found connection for user: ${connection.user_id}`);

    // Get user profile
    const user = await db.getUserById(connection.user_id);

    if (!user) {
      logger.info(`User profile not found for userId: ${connection.user_id}`);
      sendSuccess(res, { user: null });
      return;
    }

    logger.info(`✅ User found: ${user.email}`);

    sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        auth_provider: user.auth_provider,
      },
    });
  }
);
