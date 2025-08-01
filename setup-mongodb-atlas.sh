#!/bin/bash

echo "🍃 MongoDB Atlas Setup Script for AI Ops Guardian Angel"
echo "======================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to prompt for user input
prompt_for_input() {
    local prompt="$1"
    local var_name="$2"
    echo -e "${YELLOW}${prompt}${NC}"
    read -p "> " value
    eval "$var_name='$value'"
}

echo -e "${BLUE}This script will help you configure MongoDB Atlas for your platform.${NC}"
echo -e "${BLUE}Make sure you have already set up your MongoDB Atlas cluster!${NC}"
echo ""

# Collect MongoDB Atlas information
prompt_for_input "Enter your MongoDB Atlas connection string (e.g., mongodb+srv://user:password@cluster.mongodb.net/ai_ops_platform):" MONGODB_URI

# Validate the connection string format
if [[ $MONGODB_URI != mongodb+srv://* ]]; then
    echo -e "${RED}❌ Invalid connection string format. Should start with 'mongodb+srv://'${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Connection string looks valid!${NC}"

# Prompt for optional configurations
prompt_for_input "Enter your OpenAI API key (press Enter to keep existing):" OPENAI_KEY
prompt_for_input "Enter your JWT secret (press Enter to use default):" JWT_SECRET

# Set defaults
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET="ai-ops-jwt-secret-$(date +%s)"
fi

echo ""
echo -e "${BLUE}📁 Creating environment files...${NC}"

# Create .env files for each service
create_env_file() {
    local service_path="$1"
    local env_file="$service_path/.env"
    
    echo -e "${YELLOW}Creating $env_file...${NC}"
    
    # Create directory if it doesn't exist
    mkdir -p "$service_path"
    
    # Create the .env file
    cat > "$env_file" << EOF
# MongoDB Atlas Configuration
MONGODB_URI=$MONGODB_URI

# Security
JWT_SECRET=$JWT_SECRET

# Redis (local for now)
REDIS_URI=redis://localhost:6379

# Environment
ENVIRONMENT=production
DEBUG=false
EOF

    # Add service-specific configurations
    if [[ "$service_path" == *"ai-services"* ]]; then
        if [ ! -z "$OPENAI_KEY" ]; then
            echo "OPENAI_API_KEY=$OPENAI_KEY" >> "$env_file"
        fi
        echo "API_HOST=0.0.0.0" >> "$env_file"
        echo "API_PORT=8001" >> "$env_file"
    fi
    
    if [[ "$service_path" == *"api-gateway"* ]]; then
        echo "FRONTEND_URL=http://localhost:3000" >> "$env_file"
    fi
    
    if [[ "$service_path" == *"cloud-integrations"* ]]; then
        cat >> "$env_file" << EOF

# Cloud Provider Credentials (add your actual values)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1

AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_TENANT_ID=your-azure-tenant-id

GCP_PROJECT_ID=your-gcp-project-id
GCP_SERVICE_ACCOUNT_KEY=your-gcp-service-account-key
EOF
    fi
    
    echo -e "${GREEN}✅ Created $env_file${NC}"
}

# Create .env files for all services
create_env_file "backend/services/ai-services"
create_env_file "backend/services/data-services" 
create_env_file "backend/services/cloud-integrations"
create_env_file "backend/services/api-gateway"

echo ""
echo -e "${BLUE}🔧 Setting up system environment variable...${NC}"

# Add to shell profile
SHELL_PROFILE=""
if [ -f ~/.zshrc ]; then
    SHELL_PROFILE="$HOME/.zshrc"
elif [ -f ~/.bashrc ]; then
    SHELL_PROFILE="$HOME/.bashrc"
elif [ -f ~/.bash_profile ]; then
    SHELL_PROFILE="$HOME/.bash_profile"
fi

if [ ! -z "$SHELL_PROFILE" ]; then
    echo "" >> "$SHELL_PROFILE"
    echo "# AI Ops Guardian Angel - MongoDB Atlas" >> "$SHELL_PROFILE"
    echo "export MONGODB_URI=\"$MONGODB_URI\"" >> "$SHELL_PROFILE"
    echo -e "${GREEN}✅ Added MONGODB_URI to $SHELL_PROFILE${NC}"
    echo -e "${YELLOW}Run 'source $SHELL_PROFILE' or restart your terminal to apply changes${NC}"
fi

echo ""
echo -e "${BLUE}🧪 Testing MongoDB Atlas Connection...${NC}"

# Test connection using Node.js
cat > test_mongodb_connection.js << EOF
const mongoose = require('mongoose');

console.log('🔗 Testing MongoDB Atlas connection...');

mongoose.connect('$MONGODB_URI')
  .then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌍 Host:', mongoose.connection.host);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB Atlas connection failed:', error.message);
    process.exit(1);
  });

// Timeout after 10 seconds
setTimeout(() => {
  console.error('❌ Connection test timed out');
  process.exit(1);
}, 10000);
EOF

# Check if mongoose is available and test connection
if command -v node >/dev/null 2>&1; then
    if npm list mongoose >/dev/null 2>&1 || [ -d "backend/services/data-services/node_modules/mongoose" ]; then
        echo "Testing connection with Node.js..."
        cd backend/services/data-services && node ../../../test_mongodb_connection.js
        cd ../../..
    else
        echo -e "${YELLOW}⚠️  Mongoose not found. Skipping connection test.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Node.js not found. Skipping connection test.${NC}"
fi

# Clean up test file
rm -f test_mongodb_connection.js

echo ""
echo -e "${GREEN}🎉 MongoDB Atlas setup complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. 🔄 Restart your terminal or run: source ~/.zshrc (or ~/.bashrc)"
echo "2. 🚀 Start your services:"
echo "   cd backend/services/ai-services && source venv/bin/activate && python start_service.py"
echo "   cd backend/services/data-services && npm run dev"
echo "3. 🧪 Test your platform: python demo-customer-workflow.py"
echo ""
echo -e "${BLUE}📚 For detailed setup instructions, see: docs/MONGODB_ATLAS_SETUP.md${NC}"
echo ""
echo -e "${YELLOW}🔒 Security reminder:${NC}"
echo "- Never commit .env files to git"
echo "- Use strong passwords for your Atlas cluster"
echo "- Restrict IP access in production"
echo ""
echo -e "${GREEN}Your AI Ops Guardian Angel platform is now Atlas-ready! 🚀${NC}" 