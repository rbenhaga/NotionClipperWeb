/**
 * Authentication Middleware
 * Validates JWT tokens and attaches user info to request
 */

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AuthenticatedRequest, AuthTokenPayload, UnauthorizedError } from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * Extract token from Authorization header
 */
function extractToken(authHeader?: string): string | null {
  if (!authHeader) return null;

  // Format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Verify JWT token and attach user to request
 */
export async function authenticateToken(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as AuthTokenPayload;

    // Attach user info to request
    req.user = decoded;

    logger.debug(`User authenticated: ${decoded.userId} (${decoded.email})`);

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
}

/**
 * Optional authentication
 * Attaches user if token is valid, but doesn't require it
 */
export async function authenticateOptional(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret) as AuthTokenPayload;
      req.user = decoded;
      logger.debug(`Optional auth: User authenticated: ${decoded.userId}`);
    }

    next();
  } catch (error) {
    // Silently ignore invalid tokens for optional auth
    logger.debug('Optional auth: Invalid token, proceeding without user');
    next();
  }
}

/**
 * Generate JWT token
 */
export function generateToken(payload: Omit<AuthTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Verify token without throwing
 */
export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, config.jwt.secret) as AuthTokenPayload;
  } catch {
    return null;
  }
}
