import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';

// Extend Express Request type
export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authReq = req as AuthRequest;

  // Get token from cookie or Authorization header
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  authReq.user = payload;
  next();
};

// Optional auth - doesn't fail if no token, just sets user if available
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authReq = req as AuthRequest;
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      authReq.user = payload;
    }
  }

  next();
};

// Role-based authorization
export const requireRole = (...roles: Array<'teacher' | 'interviewer' | 'user'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(authReq.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};
