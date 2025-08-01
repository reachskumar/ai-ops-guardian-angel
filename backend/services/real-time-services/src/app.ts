import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { RealTimeService } from './services/RealTimeService';
import { WebSocketManager } from './services/WebSocketManager';
import { NotificationService } from './services/NotificationService';
import { MonitoringService } from './services/MonitoringService';
import { ErrorHandler } from './middleware/ErrorHandler';
import { AuthMiddleware } from './middleware/AuthMiddleware';
import { Logger } from './utils/Logger';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.REAL_TIME_SERVICES_PORT || 8005;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many real-time requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  Logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Initialize services
const realTimeService = new RealTimeService();
const webSocketManager = new WebSocketManager(io);
const notificationService = new NotificationService();
const monitoringService = new MonitoringService();
const errorHandler = new ErrorHandler();
const authMiddleware = new AuthMiddleware();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'real-time-services',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    connections: io.engine.clientsCount
  });
});

// Protected routes
app.use('/api', authMiddleware.authenticate);

// Real-time connections
app.get('/api/realtime/connections', async (req, res, next) => {
  try {
    const connections = await webSocketManager.getActiveConnections();
    res.json(connections);
  } catch (error) {
    next(error);
  }
});

app.post('/api/realtime/broadcast', async (req, res, next) => {
  try {
    const { event, data, target } = req.body;
    const result = await webSocketManager.broadcast(event, data, target);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Notifications
app.post('/api/notifications/send', async (req, res, next) => {
  try {
    const { type, message, recipients, priority } = req.body;
    const result = await notificationService.sendNotification(type, message, recipients, priority);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.get('/api/notifications', async (req, res, next) => {
  try {
    const { status, type, limit } = req.query;
    const notifications = await notificationService.getNotifications({
      status: status as string,
      type: type as string,
      limit: parseInt(limit as string) || 50
    });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

app.put('/api/notifications/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await notificationService.updateNotificationStatus(id, status);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Live Monitoring
app.get('/api/monitoring/live', async (req, res, next) => {
  try {
    const { resourceType, metrics } = req.query;
    const liveData = await monitoringService.getLiveMetrics({
      resourceType: resourceType as string,
      metrics: (metrics as string)?.split(',') || []
    });
    res.json(liveData);
  } catch (error) {
    next(error);
  }
});

app.post('/api/monitoring/alerts', async (req, res, next) => {
  try {
    const { condition, threshold, action } = req.body;
    const alert = await monitoringService.createAlert(condition, threshold, action);
    res.json(alert);
  } catch (error) {
    next(error);
  }
});

app.get('/api/monitoring/alerts', async (req, res, next) => {
  try {
    const { status, severity, limit } = req.query;
    const alerts = await monitoringService.getAlerts({
      status: status as string,
      severity: severity as string,
      limit: parseInt(limit as string) || 20
    });
    res.json(alerts);
  } catch (error) {
    next(error);
  }
});

// Real-time Events
app.post('/api/events/emit', async (req, res, next) => {
  try {
    const { event, data, target } = req.body;
    const result = await realTimeService.emitEvent(event, data, target);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.get('/api/events/history', async (req, res, next) => {
  try {
    const { eventType, timeRange, limit } = req.query;
    const events = await realTimeService.getEventHistory({
      eventType: eventType as string,
      timeRange: timeRange as string,
      limit: parseInt(limit as string) || 100
    });
    res.json(events);
  } catch (error) {
    next(error);
  }
});

// WebSocket event handlers
io.on('connection', (socket) => {
  Logger.info('Client connected', { socketId: socket.id });

  // Authentication
  socket.on('authenticate', async (data) => {
    try {
      const { token } = data;
      const user = await authMiddleware.authenticateSocket(token);
      socket.user = user;
      socket.emit('authenticated', { success: true });
      Logger.info('Socket authenticated', { socketId: socket.id, userId: user.id });
    } catch (error) {
      socket.emit('authenticated', { success: false, error: error.message });
      Logger.error('Socket authentication failed', { socketId: socket.id, error: error.message });
    }
  });

  // Join room
  socket.on('join', (data) => {
    const { room } = data;
    socket.join(room);
    socket.emit('joined', { room });
    Logger.info('Client joined room', { socketId: socket.id, room });
  });

  // Leave room
  socket.on('leave', (data) => {
    const { room } = data;
    socket.leave(room);
    socket.emit('left', { room });
    Logger.info('Client left room', { socketId: socket.id, room });
  });

  // Subscribe to monitoring
  socket.on('subscribe-monitoring', (data) => {
    const { resourceId, metrics } = data;
    monitoringService.subscribeToMetrics(socket, resourceId, metrics);
    socket.emit('subscribed-monitoring', { resourceId, metrics });
  });

  // Unsubscribe from monitoring
  socket.on('unsubscribe-monitoring', (data) => {
    const { resourceId } = data;
    monitoringService.unsubscribeFromMetrics(socket, resourceId);
    socket.emit('unsubscribed-monitoring', { resourceId });
  });

  // Disconnect
  socket.on('disconnect', () => {
    Logger.info('Client disconnected', { socketId: socket.id });
    monitoringService.handleDisconnect(socket);
  });
});

// Error handling middleware
app.use(errorHandler.handle);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

server.listen(PORT, () => {
  Logger.info(`⚡ Real-time Services running on port ${PORT}`);
  Logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
  Logger.info(`🔌 WebSocket endpoint: ws://localhost:${PORT}`);
});

export default app; 