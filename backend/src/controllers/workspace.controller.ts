/**
 * Workspace Controller
 * Manages Notion workspace connections with anti-abuse protection
 */

import { Response } from 'express';
import { AuthenticatedRequest, AppError } from '../types/index.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { sendSuccess } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import * as workspaceService from '../services/workspace.service.js';
import { decryptToken } from '../services/crypto.service.js';

/**
 * GET /api/workspace/list
 * Get all workspaces for the current user
 */
export const listWorkspaces = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const userId = req.user.userId;
    
    const workspaces = await workspaceService.getUserWorkspaces(userId);
    
    // Don't expose encrypted tokens
    const safeWorkspaces = workspaces.map(w => ({
      id: w.id,
      workspace_id: w.workspace_id,
      workspace_name: w.workspace_name,
      workspace_icon: w.workspace_icon,
      is_active: w.is_active,
      is_default: w.is_default,
      connection_status: w.connection_status,
      last_used_at: w.last_used_at,
      created_at: w.created_at
    }));

    sendSuccess(res, { workspaces: safeWorkspaces });
  }
);

/**
 * GET /api/workspace/active
 * Get the active (default) workspace with decrypted token
 */
export const getActiveWorkspace = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const userId = req.user.userId;
    
    const workspace = await workspaceService.getActiveWorkspace(userId);
    
    if (!workspace) {
      sendSuccess(res, { workspace: null, message: 'No active workspace' });
      return;
    }

    // Decrypt the token
    let decryptedToken = null;
    if (workspace.access_token_encrypted) {
      try {
        decryptedToken = decryptToken(workspace.access_token_encrypted);
      } catch (err) {
        logger.error('Failed to decrypt workspace token:', err);
      }
    }

    sendSuccess(res, {
      workspace: {
        id: workspace.id,
        workspace_id: workspace.workspace_id,
        workspace_name: workspace.workspace_name,
        workspace_icon: workspace.workspace_icon,
        is_default: workspace.is_default,
        connection_status: workspace.connection_status
      },
      token: decryptedToken
    });
  }
);

/**
 * POST /api/workspace/set-default
 * Set a workspace as the default
 */
export const setDefaultWorkspace = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { workspaceId } = req.body;
    
    if (!workspaceId) {
      throw new AppError('Workspace ID is required', 400);
    }

    const userId = req.user.userId;
    
    // Verify the workspace belongs to this user
    const workspace = await workspaceService.getWorkspaceById(workspaceId, userId);
    if (!workspace) {
      throw new AppError('Workspace not found', 404);
    }

    // Set as default
    await workspaceService.setDefaultWorkspace(userId, workspaceId);
    
    // Update last used
    await workspaceService.updateWorkspaceLastUsed(workspaceId);

    logger.info(`Workspace ${workspace.workspace_name} set as default for user ${userId}`);

    sendSuccess(res, { 
      message: 'Default workspace updated',
      workspace: {
        id: workspace.id,
        workspace_name: workspace.workspace_name
      }
    });
  }
);

/**
 * POST /api/workspace/check-availability
 * Check if a workspace can be connected (anti-abuse)
 */
export const checkWorkspaceAvailability = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { workspaceId } = req.body;
    
    if (!workspaceId) {
      throw new AppError('Workspace ID is required', 400);
    }

    const userId = req.user.userId;
    
    const result = await workspaceService.checkWorkspaceAvailability(workspaceId, userId);
    
    // Log the attempt
    await workspaceService.logConnectionAttempt({
      userId,
      workspaceId,
      attemptType: result.available ? 'connect' : 'blocked',
      success: result.available,
      errorMessage: result.available ? null : result.reason,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    sendSuccess(res, result);
  }
);

/**
 * POST /api/workspace/disconnect
 * Disconnect a workspace (but keep history for anti-abuse)
 */
export const disconnectWorkspace = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { workspaceId } = req.body;
    
    if (!workspaceId) {
      throw new AppError('Workspace ID is required', 400);
    }

    const userId = req.user.userId;
    
    // Verify the workspace belongs to this user
    const workspace = await workspaceService.getWorkspaceByNotionId(workspaceId, userId);
    if (!workspace) {
      throw new AppError('Workspace not found', 404);
    }

    // Mark as disconnected (don't delete - keep for anti-abuse)
    await workspaceService.disconnectWorkspace(workspace.id);
    
    // Update history
    await workspaceService.markWorkspaceDisconnected(workspaceId);
    
    // Log the attempt
    await workspaceService.logConnectionAttempt({
      userId,
      workspaceId,
      attemptType: 'disconnect',
      success: true,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    logger.info(`Workspace ${workspace.workspace_name} disconnected by user ${userId}`);

    sendSuccess(res, { 
      message: 'Workspace disconnected',
      note: 'This workspace remains linked to your account. You can reconnect it anytime.'
    });
  }
);

/**
 * GET /api/workspace/history
 * Get workspace connection history for the user
 */
export const getWorkspaceHistory = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const userId = req.user.userId;
    
    const history = await workspaceService.getWorkspaceHistory(userId);

    sendSuccess(res, { history });
  }
);

/**
 * POST /api/workspace/reconnect
 * Reconnect a previously disconnected workspace
 */
export const reconnectWorkspace = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { workspaceId } = req.body;
    
    if (!workspaceId) {
      throw new AppError('Workspace ID is required', 400);
    }

    const userId = req.user.userId;
    
    // Check if this workspace belongs to this user in history
    const historyEntry = await workspaceService.getWorkspaceHistoryEntry(workspaceId);
    
    if (!historyEntry) {
      throw new AppError('Workspace not found in history', 404);
    }
    
    if (historyEntry.first_user_id !== userId) {
      throw new AppError('This workspace belongs to another account', 403);
    }

    // The user needs to re-authorize via Notion OAuth
    // Return a flag indicating OAuth is needed
    sendSuccess(res, { 
      needsOAuth: true,
      message: 'Please reconnect via Notion OAuth to refresh your access token',
      workspaceId,
      workspaceName: historyEntry.workspace_name
    });
  }
);
