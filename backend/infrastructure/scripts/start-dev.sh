#!/bin/bash

echo "🚀 Starting InfraMind Development Environment"
echo "=================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file with default values..."
    cat > .env << EOF
# InfraMind - Development Environment
OPENAI_API_KEY=your-openai-api-key-here
JWT_SECRET=your-jwt-secret-change-in-production
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
EOF
    echo "⚠️  Please update .env file with your actual API keys"
fi

# Create monitoring directory
mkdir -p monitoring

# Create Prometheus config if it doesn't exist
if [ ! -f monitoring/prometheus.yml ]; then
    echo "📊 Creating Prometheus configuration..."
    cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['api-gateway:3001']

  - job_name: 'data-services'
    static_configs:
      - targets: ['data-services:8003']

  - job_name: 'ai-services'
    static_configs:
      - targets: ['ai-services:8001']

  - job_name: 'cloud-integrations'
    static_configs:
      - targets: ['cloud-integrations:8002']

  - job_name: 'security-services'
    static_configs:
      - targets: ['security-services:8004']

  - job_name: 'real-time-services'
    static_configs:
      - targets: ['real-time-services:8005']
EOF
fi

# Start services
echo "🐳 Starting Docker services..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🏥 Checking service health..."
services=("api-gateway" "data-services" "ai-services" "mongodb" "redis")

for service in "${services[@]}"; do
    if docker-compose -f docker-compose.dev.yml ps $service | grep -q "Up"; then
        echo "✅ $service is running"
    else
        echo "❌ $service failed to start"
    fi
done

echo ""
echo "🎉 Development environment is ready!"
echo "=================================================="
echo "📊 Services:"
echo "  • API Gateway:     http://localhost:3001"
echo "  • AI Services:     http://localhost:8001"
echo "  • Data Services:   http://localhost:8003"
echo "  • Cloud Integrations: http://localhost:8002"
echo "  • Security Services: http://localhost:8004"
echo "  • Real-time Services: http://localhost:8005"
echo ""
echo "🗄️  Infrastructure:"
echo "  • MongoDB:         localhost:27017"
echo "  • Redis:           localhost:6379"
echo "  • Prometheus:      http://localhost:9090"
echo "  • Grafana:         http://localhost:3010 (admin/admin)"
echo ""
echo "🔧 Development Commands:"
echo "  • View logs:       docker-compose -f docker-compose.dev.yml logs -f"
echo "  • Stop services:   docker-compose -f docker-compose.dev.yml down"
echo "  • Restart:         docker-compose -f docker-compose.dev.yml restart"
echo ""
echo "📚 Next Steps:"
echo "  1. Update .env file with your API keys"
echo "  2. Start the frontend: cd ../frontend && npm run dev"
echo "  3. Test the API: curl http://localhost:3001/health" 