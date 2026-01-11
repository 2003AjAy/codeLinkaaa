import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from './config/passport';
import executeRouter from './routes/execute';
import usersRouter from './routes/users';
import sessionsRouter from './routes/sessions';
import questionsRouter from './routes/questions';
import notesRouter from './routes/notes';
import authRouter from './routes/auth';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true, // Allow cookies
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Session middleware (required for passport OAuth flow)
app.use(session({
  secret: process.env.JWT_SECRET || 'codelinka_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 5 * 60 * 1000, // 5 minutes - just for OAuth flow
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRouter);
app.use('/api', executeRouter);
app.use('/api/users', usersRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/notes', notesRouter);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'CodeLinka Server',
    version: '1.0.0',
    endpoints: {
      auth: {
        login: 'GET /api/auth/login?role=teacher|interviewer|user',
        callback: 'GET /api/auth/callback',
        me: 'GET /api/auth/me',
        logout: 'POST /api/auth/logout',
        status: 'GET /api/auth/status',
      },
      health: 'GET /api/health',
      execute: 'POST /api/run',
      languages: 'GET /api/languages',
      users: {
        list: 'GET /api/users',
        get: 'GET /api/users/:id',
        create: 'POST /api/users',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id',
      },
      sessions: {
        list: 'GET /api/sessions',
        active: 'GET /api/sessions/active',
        get: 'GET /api/sessions/:id',
        create: 'POST /api/sessions',
        update: 'PUT /api/sessions/:id',
        join: 'POST /api/sessions/:id/join',
        leave: 'POST /api/sessions/:id/leave',
        end: 'POST /api/sessions/:id/end',
        delete: 'DELETE /api/sessions/:id',
      },
      questions: {
        bySession: 'GET /api/questions/session/:sessionId',
        get: 'GET /api/questions/:id',
        create: 'POST /api/questions',
        update: 'PUT /api/questions/:id',
        delete: 'DELETE /api/questions/:id',
      },
      notes: {
        bySession: 'GET /api/notes/session/:sessionId',
        byUserInSession: 'GET /api/notes/session/:sessionId/user/:userId',
        save: 'POST /api/notes',
        update: 'PUT /api/notes/:id',
        delete: 'DELETE /api/notes/:id',
      },
    },
  });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    output: '',
    error: 'Internal server error',
    executionTime: 0,
  });
});

app.listen(PORT, () => {
  console.log(`CodeLinka server running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  Auth:');
  console.log('    GET  /api/auth/login?role=  - Start OAuth login');
  console.log('    GET  /api/auth/me           - Get current user');
  console.log('    POST /api/auth/logout       - Logout');
  console.log('  Code Execution:');
  console.log('    GET  /api/health            - Check server status');
  console.log('    POST /api/run               - Execute code');
  console.log('  Sessions, Users, Questions, Notes...');
});
