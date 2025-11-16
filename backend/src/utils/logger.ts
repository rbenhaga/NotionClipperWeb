/**
 * Winston Logger Configuration
 * Provides structured logging with file and console transports
 */

import winston from 'winston';
import { config } from '../config/index.js';

const { combine, timestamp, printf, colorize, errors } = winston.format;

/**
 * Custom log format
 */
const customFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let log = `${timestamp} [${level}]: ${message}`;

  // Add stack trace for errors
  if (stack) {
    log += `\n${stack}`;
  }

  // Add metadata if present
  if (Object.keys(metadata).length > 0) {
    log += `\n${JSON.stringify(metadata, null, 2)}`;
  }

  return log;
});

/**
 * Create Winston logger instance
 */
export const logger = winston.createLogger({
  level: config.logging.level,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
  ),
  transports: [
    // Console transport (colored in development)
    new winston.transports.Console({
      format: combine(
        colorize(),
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
      ),
    }),

    // File transport for all logs
    new winston.transports.File({
      filename: config.logging.file,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Separate file for errors
    new winston.transports.File({
      filename: config.logging.file.replace('.log', '-error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

/**
 * Log HTTP requests
 */
export function logRequest(method: string, url: string, statusCode: number, duration: number) {
  logger.info(`${method} ${url} - ${statusCode} - ${duration}ms`);
}

/**
 * Log errors with context
 */
export function logError(error: Error, context?: Record<string, any>) {
  logger.error(error.message, {
    stack: error.stack,
    name: error.name,
    ...context,
  });
}

/**
 * Stream for Morgan (HTTP logger)
 */
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
