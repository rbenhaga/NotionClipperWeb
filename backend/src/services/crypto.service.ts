/**
 * Crypto Service
 * AES-256-GCM encryption/decryption for Notion tokens
 */

import crypto from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * Get encryption key from environment
 * Throws error if not configured
 */
function getEncryptionKey(): string {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('TOKEN_ENCRYPTION_KEY not configured in environment');
  }
  return key;
}

/**
 * Encrypt a token using AES-256-GCM
 * Returns base64-encoded string with IV prepended
 */
export async function encryptToken(token: string): Promise<string> {
  try {
    // Decode base64 encryption key
    const keyBuffer = Buffer.from(getEncryptionKey(), 'base64');

    // Generate random IV (12 bytes for GCM)
    const iv = crypto.randomBytes(12);

    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);

    // Encrypt
    let encrypted = cipher.update(token, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Get auth tag
    const authTag = cipher.getAuthTag();

    // Combine: IV (12 bytes) + encrypted data + auth tag (16 bytes)
    const combined = Buffer.concat([iv, encrypted, authTag]);

    // Return as base64
    return combined.toString('base64');
  } catch (error) {
    logger.error('Encryption failed:', error);
    throw new Error('Failed to encrypt token');
  }
}

/**
 * Decrypt a token using AES-256-GCM
 * Expects base64-encoded string with IV prepended
 */
export async function decryptToken(encryptedToken: string): Promise<string> {
  try {
    // Decode base64 encryption key
    const keyBuffer = Buffer.from(getEncryptionKey(), 'base64');

    // Decode encrypted data
    const combined = Buffer.from(encryptedToken, 'base64');

    // Extract IV (first 12 bytes)
    const iv = combined.subarray(0, 12);

    // Extract auth tag (last 16 bytes)
    const authTag = combined.subarray(combined.length - 16);

    // Extract ciphertext (everything in between)
    const ciphertext = combined.subarray(12, combined.length - 16);

    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    let decrypted = decipher.update(ciphertext);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    logger.error('Decryption failed:', error);
    throw new Error('Failed to decrypt token');
  }
}
