import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 8081; // Different port to avoid conflicts

app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ai-ops-frontend',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    routes: [
      '/dashboard',
      '/agents',
      '/workflows/langgraph',
      '/workflows/hitl',
      '/plugins',
      '/knowledge',
      '/iac/generator',
      '/security',
      '/analytics'
    ]
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'InfraMind Frontend Health Server',
    version: '2.0.0',
    status: 'running'
  });
});

app.listen(PORT, () => {
  console.log(`🏥 Frontend Health Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
}); 