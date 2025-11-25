/**
 * @file logger.ts
 * @description Production-ready logging utility with structured logging
 * @author AI Assistant
 * @updated 2024-11-25
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// Allow any type for context, including unknown and error objects
type LogContext = Record<string, unknown> | unknown;

const isDevelopment = process.env.NODE_ENV !== 'production';

const getColor = (level: LogLevel): string => {
  switch (level) {
    case 'debug':
      return '\x1b[36m'; // Cyan
    case 'info':
      return '\x1b[32m'; // Green
    case 'warn':
      return '\x1b[33m'; // Yellow
    case 'error':
      return '\x1b[31m'; // Red
  }
};

const resetColor = '\x1b[0m';

const log = (level: LogLevel, message: string, context?: LogContext): void => {
  const timestamp = new Date().toISOString();

  // In production, output structured JSON for log aggregation
  if (!isDevelopment) {
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(context && { context }),
    };
    console.log(JSON.stringify(logEntry));
    return;
  }

  // In development, use colored console output
  const color = getColor(level);
  const prefix = `${color}[${timestamp}] [${level.toUpperCase()}]${resetColor}`;

  switch (level) {
    case 'error':
      console.error(prefix, message, context || '');
      break;
    case 'warn':
      console.warn(prefix, message, context || '');
      break;
    case 'debug':
      console.log(prefix, message, context || '');
      break;
    default:
      console.log(prefix, message, context || '');
  }
};

export const logger = {
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
  debug: (message: string, context?: LogContext) => log('debug', message, context),

  /**
   * Log HTTP request
   */
  request: (method: string, path: string, context?: LogContext) => {
    log('info', `${method} ${path}`, context);
  },

  /**
   * Log HTTP response
   */
  response: (method: string, path: string, status: number, duration: number) => {
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    log(level, `${method} ${path} ${status} ${duration}ms`);
  },

  /**
   * Log database query (only in development)
   */
  query: (query: string, duration: number, context?: LogContext) => {
    if (isDevelopment) {
      log('debug', `Query executed in ${duration}ms`, { query, ...context });
    }
  },
};

