import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { CloudIntegrationsService } from './services/CloudIntegrationsService';
import { ErrorHandler } from './middleware/ErrorHandler';
import { AuthMiddleware } from './middleware/AuthMiddleware';
import { Logger } from './utils/Logger';

const app = express();
const PORT = process.env.CLOUD_INTEGRATIONS_PORT || 8002;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
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
const cloudIntegrationsService = new CloudIntegrationsService();
const errorHandler = new ErrorHandler();
const authMiddleware = new AuthMiddleware();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'cloud-integrations',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Protected routes
app.use('/api', authMiddleware.authenticate);

// AWS Integration
app.post('/api/aws/connect', async (req, res, next) => {
  try {
    const { accessKeyId, secretAccessKey, region } = req.body;
    const result = await cloudIntegrationsService.connectAWS(accessKeyId, secretAccessKey, region);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.get('/api/aws/resources', async (req, res, next) => {
  try {
    const resources = await cloudIntegrationsService.getAWSResources();
    res.json(resources);
  } catch (error) {
    next(error);
  }
});

app.get('/api/aws/costs', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const costs = await cloudIntegrationsService.getAWSCosts(startDate as string, endDate as string);
    res.json(costs);
  } catch (error) {
    next(error);
  }
});

// Azure Integration
app.post('/api/azure/connect', async (req, res, next) => {
  try {
    const { clientId, clientSecret, tenantId, subscriptionId } = req.body;
    const result = await cloudIntegrationsService.connectAzure(clientId, clientSecret, tenantId, subscriptionId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.get('/api/azure/resources', async (req, res, next) => {
  try {
    const resources = await cloudIntegrationsService.getAzureResources();
    res.json(resources);
  } catch (error) {
    next(error);
  }
});

app.get('/api/azure/costs', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const costs = await cloudIntegrationsService.getAzureCosts(startDate as string, endDate as string);
    res.json(costs);
  } catch (error) {
    next(error);
  }
});

// GCP Integration
app.post('/api/gcp/connect', async (req, res, next) => {
  try {
    const { projectId, keyFile } = req.body;
    const result = await cloudIntegrationsService.connectGCP(projectId, keyFile);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.get('/api/gcp/resources', async (req, res, next) => {
  try {
    const resources = await cloudIntegrationsService.getGCPResources();
    res.json(resources);
  } catch (error) {
    next(error);
  }
});

app.get('/api/gcp/costs', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const costs = await cloudIntegrationsService.getGCPCosts(startDate as string, endDate as string);
    res.json(costs);
  } catch (error) {
    next(error);
  }
});

// Multi-cloud operations
app.get('/api/multi-cloud/resources', async (req, res, next) => {
  try {
    const resources = await cloudIntegrationsService.getAllCloudResources();
    res.json(resources);
  } catch (error) {
    next(error);
  }
});

app.get('/api/multi-cloud/costs', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const costs = await cloudIntegrationsService.getAllCloudCosts(startDate as string, endDate as string);
    res.json(costs);
  } catch (error) {
    next(error);
  }
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

app.listen(PORT, () => {
  Logger.info(`🌐 Cloud Integrations Service running on port ${PORT}`);
  Logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
});

export default app; 