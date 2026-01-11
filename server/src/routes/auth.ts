import { Router, Request, Response } from 'express';
import passport from '../config/passport';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { generateToken } from '../utils/jwt';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router: Router = Router();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;

// Helper function to fetch user info from Auth0 userinfo endpoint
async function fetchAuth0UserInfo(accessToken: string): Promise<any> {
  try {
    const response = await fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (response.ok) {
      return await response.json();
    }
    console.error('Failed to fetch userinfo:', response.status, response.statusText);
    return null;
  } catch (error) {
    console.error('Error fetching userinfo:', error);
    return null;
  }
}

// Start Auth0 login - role passed as query param
// GET /api/auth/login?role=teacher|interviewer|user
router.get('/login', (req: Request, res: Response, next) => {
  const role = req.query.role as string || 'user';

  // Store role in session for retrieval after callback
  (req.session as any).authRole = role;

  passport.authenticate('auth0', {
    scope: 'openid email profile',
  })(req, res, next);
});

// Auth0 callback
router.get(
  '/callback',
  passport.authenticate('auth0', { failureRedirect: `${CLIENT_URL}?error=auth_failed` }),
  async (req: Request, res: Response) => {
    try {
      const profile = req.user as any;

      // Debug: Log the profile structure to understand what Auth0 returns
      console.log('Auth0 Profile:', JSON.stringify(profile, null, 2));

      // Get role from session (set before login redirect)
      let role: 'teacher' | 'interviewer' | 'user' = 'user';
      const sessionRole = (req.session as any)?.authRole;
      if (sessionRole && ['teacher', 'interviewer', 'user'].includes(sessionRole)) {
        role = sessionRole;
      }
      // Clear the auth role from session
      delete (req.session as any).authRole;

      // Extract user info from Auth0 profile - try multiple possible paths
      let googleId = profile.id || profile.user_id || profile._json?.sub;
      let email =
        profile.emails?.[0]?.value ||
        profile._json?.email ||
        profile.email ||
        profile._json?.nickname ||
        profile.nickname;
      let name = profile.displayName || profile._json?.name || profile._json?.nickname || 'User';
      let avatarUrl = profile.photos?.[0]?.value || profile._json?.picture;

      console.log('Extracted from profile - email:', email, 'googleId:', googleId);

      // If email not found in profile, try fetching from userinfo endpoint
      if (!email && profile.extraParams?.access_token) {
        console.log('Email not in profile, fetching from userinfo endpoint...');
        const userInfo = await fetchAuth0UserInfo(profile.extraParams.access_token);
        console.log('UserInfo response:', JSON.stringify(userInfo, null, 2));

        if (userInfo) {
          email = userInfo.email || email;
          name = userInfo.name || name;
          avatarUrl = userInfo.picture || avatarUrl;
          googleId = userInfo.sub || googleId;
        }
      }

      console.log('Final values - email:', email, 'googleId:', googleId, 'name:', name);

      if (!email) {
        console.error('No email found. Profile keys:', Object.keys(profile));
        console.error('Profile._json keys:', profile._json ? Object.keys(profile._json) : 'no _json');
        return res.redirect(`${CLIENT_URL}?error=no_email`);
      }

      // Check if user exists
      let user = await db
        .select()
        .from(users)
        .where(eq(users.googleId, googleId))
        .limit(1);

      if (user.length === 0) {
        // Create new user
        const newUser = await db
          .insert(users)
          .values({
            email,
            name,
            avatarUrl,
            googleId,
            role,
          })
          .returning();
        user = newUser;
      } else {
        // Update role if different (user can change role on login)
        if (user[0].role !== role) {
          await db
            .update(users)
            .set({ role, updatedAt: new Date() })
            .where(eq(users.id, user[0].id));
          user[0].role = role;
        }
      }

      // Generate JWT token
      const token = generateToken({
        userId: user[0].id,
        email: user[0].email,
        name: user[0].name,
        role: user[0].role as 'teacher' | 'interviewer' | 'user',
      });

      // Set token in HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Redirect based on role
      let redirectUrl = CLIENT_URL;
      if (role === 'teacher') {
        redirectUrl = `${CLIENT_URL}/teaching`;
      } else if (role === 'interviewer') {
        redirectUrl = `${CLIENT_URL}/interview`;
      } else {
        redirectUrl = `${CLIENT_URL}/join`;
      }

      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect(`${CLIENT_URL}?error=server_error`);
    }
  }
);

// Get current user
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, authReq.user!.userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user[0].id,
      email: user[0].email,
      name: user[0].name,
      avatarUrl: user[0].avatarUrl,
      role: user[0].role,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// Check auth status (public endpoint)
router.get('/status', (req: Request, res: Response) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.json({ authenticated: false });
  }

  // Try to verify without failing
  const { verifyToken } = require('../utils/jwt');
  const payload = verifyToken(token);

  if (!payload) {
    return res.json({ authenticated: false });
  }

  res.json({
    authenticated: true,
    user: {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    },
  });
});

export default router;
