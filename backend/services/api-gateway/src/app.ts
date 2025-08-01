import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Core middleware
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Service proxies
app.use('/api/ai', createProxyMiddleware({
  target: 'http://ai-services:8001',
  changeOrigin: true,
  pathRewrite: { '^/api/ai': '' }
}));

app.use('/api/cloud', createProxyMiddleware({
  target: 'http://cloud-integrations:8002',
  changeOrigin: true,
  pathRewrite: { '^/api/cloud': '' }
}));

app.use('/api/data', createProxyMiddleware({
  target: 'http://data-services:8003',
  changeOrigin: true,
  pathRewrite: { '^/api/data': '' }
}));

app.use('/api/security', createProxyMiddleware({
  target: 'http://security-services:8004',
  changeOrigin: true,
  pathRewrite: { '^/api/security': '' }
}));

app.use('/api/realtime', createProxyMiddleware({
  target: 'http://real-time-services:8005',
  changeOrigin: true,
  pathRewrite: { '^/api/realtime': '' }
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
    version: '2.0.0'
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'InfraMind - API Gateway',
    version: '2.0.0',
    status: 'running',
    services: {
      ai: '/api/ai',
      cloud: '/api/cloud', 
      data: '/api/data',
      security: '/api/security',
      realtime: '/api/realtime'
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🌉 InfraMind API Gateway running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
});

export { app };
