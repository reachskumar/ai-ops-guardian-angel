#!/bin/bash

echo "🚀 AI Ops Guardian Angel - Backend Setup & Startup"
echo "=================================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command_exists python3; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file with default values..."
    cat > .env << 'EOF'
# AI Ops Guardian Angel - Environment Configuration
NODE_ENV=development
ENVIRONMENT=development

# API Settings
API_GATEWAY_PORT=3001
AI_SERVICES_PORT=8001
DATA_SERVICES_PORT=8003
CLOUD_INTEGRATIONS_PORT=8002

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ai_ops_platform
REDIS_URI=redis://localhost:6379

# AI Model Configuration
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
DEFAULT_MODEL=gpt-4

# Authentication & Security
JWT_SECRET=dev-jwt-secret-change-in-production
SECRET_KEY=dev-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# Service URLs
API_GATEWAY_URL=http://localhost:3001
AI_SERVICES_URL=http://localhost:8001
DATA_SERVICES_URL=http://localhost:8003
CLOUD_INTEGRATIONS_URL=http://localhost:8002
EOF
    echo "⚠️  Please update .env file with your actual API keys and configuration"
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."

echo "🔧 Setting up API Gateway..."
cd services/api-gateway
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ../..

echo "🔧 Setting up Data Services..."
cd services/data-services
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ../..

echo "🔧 Setting up Cloud Integrations..."
cd services/cloud-integrations
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ../..

# Setup Python environment for AI Services
echo "🔧 Setting up AI Services (Python)..."
cd services/ai-services

if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "📦 Installing Python dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements-simple.txt
cd ../..

echo ""
echo "✅ Setup completed successfully!"
echo "=================================================="
echo ""
echo "🚀 To start all services, run:"
echo "   ./start-all-services.sh"
echo ""
echo "Or start services individually:"
echo ""
echo "Terminal 1 - API Gateway:"
echo "   cd backend/services/api-gateway && npm run dev"
echo ""
echo "Terminal 2 - Data Services:"
echo "   cd backend/services/data-services && npm run dev"
echo ""
echo "Terminal 3 - Cloud Integrations:"
echo "   cd backend/services/cloud-integrations && npm run dev"
echo ""
echo "Terminal 4 - AI Services:"
echo "   cd backend/services/ai-services && source venv/bin/activate && python start_service.py"
echo ""
echo "🏥 Health checks after starting:"
echo "   • API Gateway:        curl http://localhost:3001/health"
echo "   • AI Services:        curl http://localhost:8001/health"
echo "   • Data Services:      curl http://localhost:8003/health"
echo "   • Cloud Integrations: curl http://localhost:8002/health"
echo ""
echo "📚 API Documentation:"
echo "   • AI Services:        http://localhost:8001/docs"
echo "   • API Gateway:        http://localhost:3001/docs"
echo ""
echo "⚠️  Make sure MongoDB and Redis are running before starting services" 