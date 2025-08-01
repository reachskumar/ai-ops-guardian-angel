#!/bin/bash

echo "🚀 Starting InfraMind Development Mode (Local)"
echo "=============================================="

# Check if required tools are installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

# Start MongoDB and Redis with Docker (if not running)
echo "🗄️ Starting infrastructure services..."
cd ../../../infrastructure/docker-compose
docker-compose up -d mongodb redis

# Wait for infrastructure to be ready
echo "⏳ Waiting for infrastructure..."
sleep 5

# Install dependencies for each service
echo "📦 Installing dependencies..."

# API Gateway
echo "🔧 Setting up API Gateway..."
cd ../../services/api-gateway
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ../../infrastructure/scripts

# Data Services
echo "🔧 Setting up Data Services..."
cd ../../services/data-services
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ../../infrastructure/scripts

# Cloud Integrations
echo "🔧 Setting up Cloud Integrations..."
cd ../../services/cloud-integrations
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ../../infrastructure/scripts

# AI Services
echo "🔧 Setting up AI Services..."
cd ../../services/ai-services
if [ ! -f "venv/bin/activate" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements-simple.txt
cd ../../infrastructure/scripts

echo ""
echo "🎉 Dependencies installed!"
echo "=============================================="
echo "📊 Start services in separate terminals:"
echo ""
echo "Terminal 1 - API Gateway:"
echo "  cd backend/services/api-gateway && npm run dev"
echo ""
echo "Terminal 2 - Data Services:"
echo "  cd backend/services/data-services && npm run dev"
echo ""
echo "Terminal 3 - Cloud Integrations:"
echo "  cd backend/services/cloud-integrations && npm run dev"
echo ""
echo "Terminal 4 - AI Services:"
echo "  cd backend/services/ai-services && source venv/bin/activate && python run.py"
echo ""
echo "🗄️ Infrastructure:"
echo "  • MongoDB: localhost:27017"
echo "  • Redis:   localhost:6379"
echo ""
echo "🔧 Test endpoints:"
echo "  curl http://localhost:3001/health"
echo "  curl http://localhost:8003/health"
echo "  curl http://localhost:8002/health"
echo "  curl http://localhost:8001/health" 