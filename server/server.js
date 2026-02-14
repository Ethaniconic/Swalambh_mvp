import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import { connectDB, disconnectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import triageRoutes from './routes/triage.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// Routes
app.use('/auth', authRoutes);
app.use('/triage', triageRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ detail: 'Invalid JSON' });
  }

  if (err.message && err.message.includes('Only image')) {
    return res.status(415).json({ detail: err.message });
  }

  if (err.message && err.message.includes('File exceeds')) {
    return res.status(413).json({ detail: err.message });
  }

  res.status(err.status || 500).json({
    detail: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ detail: 'Not found' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await disconnectDB();
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`DermSight API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
