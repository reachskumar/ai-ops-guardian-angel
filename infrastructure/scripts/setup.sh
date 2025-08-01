#!/bin/bash

# AI Ops Guardian Angel - Setup Script
# This script sets up the entire development environment

set -e

echo "🛡️ AI Ops Guardian Angel - Setup Script"
echo "======================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. Some features may not work."
else
    echo "✅ Docker version: $(docker --version)"
fi

# Install root dependencies
echo ""
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo ""
echo "🎨 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo ""
echo "⚙️ Installing backend dependencies..."
cd backend
npm install

# Install AI services dependencies
echo "🧠 Installing AI services dependencies..."
cd ai-services
if [ -f "package.json" ]; then
    npm install
else
    echo "📝 Creating AI services package.json..."
    npm init -y
    npm install @langchain/core @langchain/openai langchain langgraph express typescript tsx @types/node
fi
cd ..

# Install cloud integrations dependencies
echo "☁️ Installing cloud integrations dependencies..."
cd cloud-integrations
if [ -f "package.json" ]; then
    npm install
else
    echo "📝 Creating cloud integrations package.json..."
    npm init -y
    npm install aws-sdk @azure/arm-compute @google-cloud/compute express typescript tsx @types/node
fi
cd ..

# Install data services dependencies
echo "🗄️ Installing data services dependencies..."
cd data-services
if [ -f "package.json" ]; then
    npm install
else
    echo "📝 Creating data services package.json..."
    npm init -y
    npm install mongodb mongoose redis express typescript tsx @types/node
fi
cd ..

cd ..

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Creating environment file..."
    cat > .env << 'EOF'
# Core Configuration
NODE_ENV=development
PORT=3000

# AI Services
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Database
MONGODB_URI=mongodb://localhost:27017/ai-ops-platform

# Redis
REDIS_URL=redis://localhost:6379

# Cloud Providers (Optional)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_client_secret
AZURE_TENANT_ID=your_azure_tenant_id
AZURE_SUBSCRIPTION_ID=your_azure_subscription_id

GCP_PROJECT_ID=your_gcp_project_id
GCP_SERVICE_ACCOUNT_KEY=your_gcp_service_account_key

# Frontend URLs
VITE_API_URL=http://localhost:3001
VITE_AI_SERVICE_URL=http://localhost:3002
EOF
    echo "✅ Created .env file. Please edit it with your actual values."
else
    echo "✅ Environment file already exists."
fi

# Create development scripts
echo ""
echo "📋 Creating development scripts..."

# Create start script
cat > scripts/start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting AI Ops Guardian Angel development environment..."
npm run dev
EOF

# Create production build script
cat > scripts/build.sh << 'EOF'
#!/bin/bash
echo "🏗️ Building AI Ops Guardian Angel for production..."
npm run build
EOF

# Create Docker start script
cat > scripts/docker-start.sh << 'EOF'
#!/bin/bash
echo "🐳 Starting AI Ops Guardian Angel with Docker..."
docker-compose up -d
echo "✅ Services started. Frontend: http://localhost:3000"
EOF

# Make scripts executable
chmod +x scripts/*.sh

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your API keys and configuration"
echo "2. Run 'npm run dev' to start the development environment"
echo "3. Or run 'docker-compose up' to start with Docker"
echo ""
echo "🌐 URLs:"
echo "  Frontend:     http://localhost:3000"
echo "  API Gateway:  http://localhost:3001"
echo "  AI Services:  http://localhost:3002"
echo "  Data Services: http://localhost:3003"
echo "  Cloud Services: http://localhost:3004"
echo ""
echo "Happy coding! 🛡️" 