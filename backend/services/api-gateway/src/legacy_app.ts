import express from 'express';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'api-gateway'
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Ops Guardian Angel - API Gateway',
    version: '1.0.0',
    status: 'running'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🌉 API Gateway running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

export { app }; 