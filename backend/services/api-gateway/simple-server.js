const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'AI Ops Guardian Angel - API Gateway',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🌉 API Gateway running on port ${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});
