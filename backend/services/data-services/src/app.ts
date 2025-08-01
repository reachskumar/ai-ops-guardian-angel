import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { CloudAccount } from './models/CloudAccount';
import { AuthService } from './services/AuthService';

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

// Initialize services
const authService = new AuthService();

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://InfraMind:dXrAIXfp9cU51zgy@cluster0.zdqyeaq.mongodb.net/ai_ops_platform?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('❌ MongoDB Atlas connection error:', error);
  });

// Authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Auth routes
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      organization: '507f1f77bcf86cd799439011' // Default organization ID
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.user._id,
        email: result.user.email,
        profile: result.user.profile
      },
      token: result.token
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.login(email, password);

    return res.json({
      message: 'Login successful',
      user: {
        id: result.user._id,
        email: result.user.email,
        profile: result.user.profile,
        preferences: result.user.preferences
      },
      token: result.token
    });
  } catch (error: any) {
    return res.status(401).json({ error: error.message });
  }
});

// Protected routes
app.get('/users/profile', authenticateToken, async (req: any, res) => {
  try {
    const user = await authService.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        preferences: user.preferences,
        cloudAccounts: user.cloudAccounts
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/users/profile', authenticateToken, async (req: any, res) => {
  try {
    const { firstName, lastName, avatar } = req.body;
    const user = await authService.updateUserProfile(req.user.userId, {
      firstName,
      lastName,
      avatar
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'inframind-data-services',
    version: '2.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/', (req, res) => {
      res.json({ 
      message: 'InfraMind - Data Services',
      version: '2.0.0',
      status: 'running',
    endpoints: {
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/login'
      },
      users: {
        profile: 'GET /users/profile',
        updateProfile: 'PUT /users/profile'
      }
    }
  });
});

const PORT = process.env.PORT || 8003;
app.listen(PORT, () => {
  console.log(`🗄️ InfraMind Data Services running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

export { app }; 