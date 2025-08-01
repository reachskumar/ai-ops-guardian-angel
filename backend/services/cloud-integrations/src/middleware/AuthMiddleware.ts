import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError } from './ErrorHandler';
import { Logger } from '../utils/Logger';

export class AuthMiddleware {
  authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        throw new AuthenticationError('No authorization header provided');
      }

      const token = authHeader.replace('Bearer ', '');
      
      if (!token) {
        throw new AuthenticationError('No token provided');
      }

      const secret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, secret) as any;
      
      // Add user info to request
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        organization: decoded.organization
      };

      Logger.info('Authentication successful', {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        url: req.url,
        method: req.method
      });

      next();
    } catch (error) {
      Logger.error('Authentication failed', {
        error: error.message,
        url: req.url,
        method: req.method,
        ip: req.ip
      });

      if (error.name === 'JsonWebTokenError') {
        throw new AuthenticationError('Invalid token');
      }

      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Token expired');
      }

      throw new AuthenticationError('Authentication failed');
    }
  }

  requireRole(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new AuthenticationError('User not authenticated');
        }

        if (!roles.includes(req.user.role)) {
          throw new AuthenticationError('Insufficient permissions');
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  requireOrganization() {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new AuthenticationError('User not authenticated');
        }

        if (!req.user.organization) {
          throw new AuthenticationError('User not associated with an organization');
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }
} 