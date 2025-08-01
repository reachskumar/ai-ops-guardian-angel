import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/Logger';

export class ErrorHandler {
  handle(error: any, req: Request, res: Response, next: NextFunction) {
    Logger.error('Error occurred', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Handle different types of errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message,
        details: error.details
      });
    }

    if (error.name === 'AuthenticationError') {
      return res.status(401).json({
        error: 'Authentication Error',
        message: error.message
      });
    }

    if (error.name === 'AuthorizationError') {
      return res.status(403).json({
        error: 'Authorization Error',
        message: error.message
      });
    }

    if (error.name === 'RateLimitError') {
      return res.status(429).json({
        error: 'Rate Limit Exceeded',
        message: 'Too many requests, please try again later'
      });
    }

    if (error.name === 'CloudProviderError') {
      return res.status(502).json({
        error: 'Cloud Provider Error',
        message: error.message,
        provider: error.provider
      });
    }

    // Default error response
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    res.status(statusCode).json({
      error: 'Server Error',
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : message,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
  }
}

// Custom error classes
export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class CloudProviderError extends Error {
  constructor(message: string, public provider: string) {
    super(message);
    this.name = 'CloudProviderError';
  }
} 