#!/bin/bash

# InfraMind AI Ops Guardian Angel - Frontend Startup Script

echo "🚀 Starting InfraMind Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# API Endpoints
VITE_API_BASE_URL=http://localhost:8001
VITE_API_GATEWAY_URL=http://localhost:3001
VITE_CLOUD_INTEGRATIONS_URL=http://localhost:8002
VITE_DATA_SERVICES_URL=http://localhost:8003

# Application Settings
VITE_APP_NAME=InfraMind AI Ops Guardian Angel
VITE_APP_VERSION=1.0.0
EOF
    echo "✅ .env file created"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
fi

# Check if backend services are running
echo "🔍 Checking backend services..."

# Check AI Services
if curl -s http://localhost:8001/health > /dev/null; then
    echo "✅ AI Services (port 8001) - Running"
else
    echo "⚠️  AI Services (port 8001) - Not running"
fi

# Check API Gateway
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ API Gateway (port 3001) - Running"
else
    echo "⚠️  API Gateway (port 3001) - Not running"
fi

# Check Cloud Integrations
if curl -s http://localhost:8002/health > /dev/null; then
    echo "✅ Cloud Integrations (port 8002) - Running"
else
    echo "⚠️  Cloud Integrations (port 8002) - Not running"
fi

# Check Data Services
if curl -s http://localhost:8003/health > /dev/null; then
    echo "✅ Data Services (port 8003) - Running"
else
    echo "⚠️  Data Services (port 8003) - Not running"
fi

echo ""
echo "🌐 Starting development server..."
echo "📱 Frontend will be available at: http://localhost:5173"
echo "📚 API Documentation: http://localhost:8001/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm run dev 