import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { SecurityService } from './services/SecurityService';
import { VulnerabilityScanner } from './services/VulnerabilityScanner';
import { ComplianceChecker } from './services/ComplianceChecker';
import { ThreatDetector } from './services/ThreatDetector';
import { ErrorHandler } from './middleware/ErrorHandler';
import { AuthMiddleware } from './middleware/AuthMiddleware';
import { Logger } from './utils/Logger';

const app = express();
const PORT = process.env.SECURITY_SERVICES_PORT || 8004;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many security scan requests from this IP, please try again later.',
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
const securityService = new SecurityService();
const vulnerabilityScanner = new VulnerabilityScanner();
const complianceChecker = new ComplianceChecker();
const threatDetector = new ThreatDetector();
const errorHandler = new ErrorHandler();
const authMiddleware = new AuthMiddleware();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'security-services',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Protected routes
app.use('/api', authMiddleware.authenticate);

// Security Overview
app.get('/api/security/overview', async (req, res, next) => {
  try {
    const overview = await securityService.getSecurityOverview();
    res.json(overview);
  } catch (error) {
    next(error);
  }
});

// Vulnerability Scanning
app.post('/api/security/vulnerability-scan', async (req, res, next) => {
  try {
    const { target, scanType, options } = req.body;
    const scanResult = await vulnerabilityScanner.scan(target, scanType, options);
    res.json(scanResult);
  } catch (error) {
    next(error);
  }
});

app.get('/api/security/vulnerabilities', async (req, res, next) => {
  try {
    const { severity, status, limit } = req.query;
    const vulnerabilities = await vulnerabilityScanner.getVulnerabilities({
      severity: severity as string,
      status: status as string,
      limit: parseInt(limit as string) || 50
    });
    res.json(vulnerabilities);
  } catch (error) {
    next(error);
  }
});

app.put('/api/security/vulnerabilities/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const result = await vulnerabilityScanner.updateVulnerabilityStatus(id, status, notes);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Compliance Checking
app.post('/api/security/compliance-check', async (req, res, next) => {
  try {
    const { standard, scope, options } = req.body;
    const complianceResult = await complianceChecker.checkCompliance(standard, scope, options);
    res.json(complianceResult);
  } catch (error) {
    next(error);
  }
});

app.get('/api/security/compliance/standards', async (req, res, next) => {
  try {
    const standards = await complianceChecker.getSupportedStandards();
    res.json(standards);
  } catch (error) {
    next(error);
  }
});

app.get('/api/security/compliance/reports', async (req, res, next) => {
  try {
    const { standard, dateRange } = req.query;
    const reports = await complianceChecker.getComplianceReports({
      standard: standard as string,
      dateRange: dateRange as string
    });
    res.json(reports);
  } catch (error) {
    next(error);
  }
});

// Threat Detection
app.post('/api/security/threat-detection', async (req, res, next) => {
  try {
    const { data, threatType, options } = req.body;
    const threatResult = await threatDetector.detectThreats(data, threatType, options);
    res.json(threatResult);
  } catch (error) {
    next(error);
  }
});

app.get('/api/security/threats', async (req, res, next) => {
  try {
    const { severity, status, timeRange } = req.query;
    const threats = await threatDetector.getThreats({
      severity: severity as string,
      status: status as string,
      timeRange: timeRange as string
    });
    res.json(threats);
  } catch (error) {
    next(error);
  }
});

app.post('/api/security/threats/:id/respond', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;
    const result = await threatDetector.respondToThreat(id, action, notes);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Security Monitoring
app.get('/api/security/monitoring/alerts', async (req, res, next) => {
  try {
    const { severity, status, limit } = req.query;
    const alerts = await securityService.getSecurityAlerts({
      severity: severity as string,
      status: status as string,
      limit: parseInt(limit as string) || 20
    });
    res.json(alerts);
  } catch (error) {
    next(error);
  }
});

app.post('/api/security/monitoring/alerts/:id/acknowledge', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const result = await securityService.acknowledgeAlert(id, notes);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Security Hardening
app.post('/api/security/hardening/recommendations', async (req, res, next) => {
  try {
    const { resourceType, environment, compliance } = req.body;
    const recommendations = await securityService.getHardeningRecommendations(
      resourceType, environment, compliance
    );
    res.json(recommendations);
  } catch (error) {
    next(error);
  }
});

app.post('/api/security/hardening/apply', async (req, res, next) => {
  try {
    const { resourceId, recommendations, dryRun } = req.body;
    const result = await securityService.applyHardeningRecommendations(
      resourceId, recommendations, dryRun
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Security Reports
app.get('/api/security/reports/summary', async (req, res, next) => {
  try {
    const { dateRange, format } = req.query;
    const report = await securityService.generateSecurityReport({
      dateRange: dateRange as string,
      format: format as string || 'json'
    });
    res.json(report);
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
  Logger.info(`🔒 Security Services running on port ${PORT}`);
  Logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
});

export default app; 