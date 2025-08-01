#!/bin/bash

echo "🚀 Building and Starting InfraMind Services"
echo "=========================================="

# Build all services first
echo "🔨 Building services..."
docker-compose -f docker-compose.dev.yml build

# Start services
echo "🐳 Starting services..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 15

# Check service health
echo "🏥 Checking service health..."
services=("api-gateway" "data-services" "ai-services" "cloud-integrations" "mongodb" "redis")

for service in "${services[@]}"; do
    if docker-compose -f docker-compose.dev.yml ps $service | grep -q "Up"; then
        echo "✅ $service is running"
    else
        echo "❌ $service failed to start"
    fi
done

echo ""
echo "🎉 InfraMind services are ready!"
echo "=========================================="
echo "📊 Services:"
echo "  • API Gateway:     http://localhost:3001"
echo "  • AI Services:     http://localhost:8001"
echo "  • Data Services:   http://localhost:8003"
echo "  • Cloud Integrations: http://localhost:8002"
echo ""
echo "🗄️  Infrastructure:"
echo "  • MongoDB:         localhost:27017"
echo "  • Redis:           localhost:6379"
echo ""
echo "🔧 Test the services:"
echo "  curl http://localhost:3001/health"
echo "  curl http://localhost:8001/health"
echo "  curl http://localhost:8003/health" 