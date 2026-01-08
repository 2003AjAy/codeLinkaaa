import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import executeRouter from './routes/execute';
import usersRouter from './routes/users';
import sessionsRouter from './routes/sessions';
import questionsRouter from './routes/questions';
import notesRouter from './routes/notes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Routes
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
  console.log('  Code Execution:');
  console.log('    GET  /api/health     - Check server and Docker status');
  console.log('    POST /api/run        - Execute code');
  console.log('    GET  /api/languages  - List supported languages');
  console.log('  Users:');
  console.log('    GET/POST /api/users  - List/Create users');
  console.log('  Sessions:');
  console.log('    GET/POST /api/sessions - List/Create sessions');
  console.log('  Questions:');
  console.log('    GET/POST /api/questions - Manage questions');
  console.log('  Notes:');
  console.log('    GET/POST /api/notes  - Manage session notes');
});
