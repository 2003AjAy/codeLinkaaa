import express from 'express';
import cors from 'cors';
import executeRouter from './routes/execute';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api', executeRouter);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'CodeLinka Server',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      execute: 'POST /api/run',
      languages: 'GET /api/languages',
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
  console.log('  GET  /api/health    - Check server and Docker status');
  console.log('  POST /api/run       - Execute code');
  console.log('  GET  /api/languages - List supported languages');
});
