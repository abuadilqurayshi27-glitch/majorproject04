import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { videoRouter } from './routes/videoRoutes.js';
import { tutorRouter } from './routes/tutorRoutes.js';
import { recommendRouter } from './routes/recommendRoutes.js';
import { settingsRouter } from './routes/settingsRoutes.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow frontend development server
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes
app.use('/api/video', videoRouter);
app.use('/api/tutor', tutorRouter);
app.use('/api/recommendations', recommendRouter);
app.use('/api/settings', settingsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'StudyMind AI Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err?.message || 'An unexpected error occurred',
  });
});

// Start listening
const server = app.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(`🚀 StudyMind AI Server listening on port ${config.port}`);
  console.log(`📡 Health Check: http://localhost:${config.port}/api/health`);
  console.log(`🤖 Gemini Status: ${config.geminiApiKey ? 'Configured' : 'Using Intelligent Fallback NLP'}`);
  console.log(`===============================================`);
});

export default app;
