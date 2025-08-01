import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

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

// Cloud provider endpoints
app.get('/providers', (req, res) => {
  res.json({
    providers: [
      {
        id: 'aws',
        name: 'Amazon Web Services',
        status: 'connected',
        regions: ['us-east-1', 'us-west-2', 'eu-west-1']
      },
      {
        id: 'azure',
        name: 'Microsoft Azure',
        status: 'connected',
        regions: ['eastus', 'westus2', 'westeurope']
      },
      {
        id: 'gcp',
        name: 'Google Cloud Platform',
        status: 'disconnected',
        regions: ['us-central1', 'europe-west1', 'asia-southeast1']
      }
    ]
  });
});

app.post('/sync/:provider', (req, res) => {
  const { provider } = req.params;
  
  // Mock sync operation
  setTimeout(() => {
    res.json({
      message: `Syncing ${provider} resources...`,
      provider,
      status: 'in_progress',
      estimatedTime: '30 seconds'
    });
  }, 1000);
});

app.get('/resources/:provider', (req, res) => {
  const { provider } = req.params;
  
  // Mock resources data
  const mockResources = {
    aws: [
      { id: 'i-1234567890abcdef0', type: 'ec2', name: 'web-server-1', status: 'running' },
      { id: 'vol-1234567890abcdef0', type: 'ebs', name: 'data-volume-1', status: 'in-use' }
    ],
    azure: [
      { id: '/subscriptions/123/resourceGroups/rg1/providers/Microsoft.Compute/virtualMachines/vm1', type: 'vm', name: 'app-server-1', status: 'running' },
      { id: '/subscriptions/123/resourceGroups/rg1/providers/Microsoft.Storage/storageAccounts/sa1', type: 'storage', name: 'data-storage-1', status: 'available' }
    ],
    gcp: [
      { id: 'projects/my-project/zones/us-central1-a/instances/instance-1', type: 'compute', name: 'gcp-server-1', status: 'running' },
      { id: 'projects/my-project/buckets/bucket-1', type: 'storage', name: 'gcp-bucket-1', status: 'available' }
    ]
  };

  res.json({
    provider,
    resources: mockResources[provider as keyof typeof mockResources] || [],
    total: mockResources[provider as keyof typeof mockResources]?.length || 0
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'inframind-cloud-integrations',
    version: '2.0.0'
  });
});

app.get('/', (req, res) => {
      res.json({ 
      message: 'InfraMind - Cloud Integration Services',
      version: '2.0.0',
      status: 'running',
    endpoints: {
      providers: 'GET /providers',
      sync: 'POST /sync/:provider',
      resources: 'GET /resources/:provider'
    }
  });
});

const PORT = process.env.PORT || 8002;
app.listen(PORT, () => {
  console.log(`☁️ InfraMind Cloud Integrations running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

export { app }; 