import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 8004;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000
});
app.use(limiter);

// Core middleware
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'real-time-services',
    version: '2.0.0',
    websocket_enabled: true,
    notifications: ['system', 'security', 'cost']
  });
});

// Mock notifications endpoint
app.get('/notifications', (req, res) => {
  res.json({
    notifications: [
      {
        id: 'notif-001',
        type: 'security',
        title: 'Security Alert',
        message: 'Unauthorized access attempt detected',
        severity: 'high',
        timestamp: new Date().toISOString()
      },
      {
        id: 'notif-002',
        type: 'cost',
        title: 'Cost Optimization',
        message: 'Potential cost savings identified',
        severity: 'medium',
        timestamp: new Date().toISOString()
      },
      {
        id: 'notif-003',
        type: 'system',
        title: 'System Update',
        message: 'New AI agent deployed successfully',
        severity: 'low',
        timestamp: new Date().toISOString()
      }
    ]
  });
});

// Mock events endpoint
app.get('/events', (req, res) => {
  res.json({
    events: [
      {
        id: 'event-001',
        type: 'deployment',
        service: 'ai-services',
        status: 'completed',
        timestamp: new Date().toISOString()
      },
      {
        id: 'event-002',
        type: 'monitoring',
        service: 'cloud-integrations',
        status: 'active',
        timestamp: new Date().toISOString()
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`⚡ Real-time Services running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
}); 