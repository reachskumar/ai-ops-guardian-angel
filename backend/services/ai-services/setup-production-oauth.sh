#!/bin/bash

echo "🚀 InfraMind Production OAuth Setup"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo "This script will guide you through setting up production OAuth credentials for InfraMind."
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating one..."
    touch .env
fi

echo ""
echo "📋 Prerequisites:"
echo "1. Google Cloud Console access"
echo "2. GitHub account with developer access"
echo "3. Domain name for production (optional)"
echo ""

read -p "Do you want to proceed with OAuth setup? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "🔐 Google OAuth Setup"
echo "====================="
echo ""

print_info "Follow these steps to set up Google OAuth:"
echo "1. Go to https://console.cloud.google.com/"
echo "2. Create a new project or select existing one"
echo "3. Enable Google+ API"
echo "4. Go to APIs & Services → OAuth consent screen"
echo "5. Configure consent screen (External user type)"
echo "6. Go to APIs & Services → Credentials"
echo "7. Create OAuth 2.0 Client ID (Web application)"
echo "8. Add authorized redirect URIs:"
echo "   - http://localhost:8080/auth/callback"
echo "   - http://localhost:3000/auth/callback"
echo "   - https://your-domain.com/auth/callback (production)"
echo ""

read -p "Have you completed Google OAuth setup? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    read -p "Enter your Google Client ID: " google_client_id
    read -p "Enter your Google Client Secret: " google_client_secret
    
    # Update .env file
    sed -i.bak '/GOOGLE_CLIENT_ID=/d' .env
    sed -i.bak '/GOOGLE_CLIENT_SECRET=/d' .env
    echo "GOOGLE_CLIENT_ID=$google_client_id" >> .env
    echo "GOOGLE_CLIENT_SECRET=$google_client_secret" >> .env
    
    print_status "Google OAuth credentials saved to .env"
else
    print_warning "Skipping Google OAuth setup"
fi

echo ""
echo "🐙 GitHub OAuth Setup"
echo "===================="
echo ""

print_info "Follow these steps to set up GitHub OAuth:"
echo "1. Go to https://github.com/settings/developers"
echo "2. Click 'OAuth Apps' → 'New OAuth App'"
echo "3. Fill in the form:"
echo "   - Application name: InfraMind"
echo "   - Homepage URL: http://localhost:8080 (dev) / https://your-domain.com (prod)"
echo "   - Authorization callback URL: http://localhost:8080/auth/callback"
echo "4. Copy Client ID and generate Client Secret"
echo ""

read -p "Have you completed GitHub OAuth setup? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    read -p "Enter your GitHub Client ID: " github_client_id
    read -p "Enter your GitHub Client Secret: " github_client_secret
    
    # Update .env file
    sed -i.bak '/GITHUB_CLIENT_ID=/d' .env
    sed -i.bak '/GITHUB_CLIENT_SECRET=/d' .env
    echo "GITHUB_CLIENT_ID=$github_client_id" >> .env
    echo "GITHUB_CLIENT_SECRET=$github_client_secret" >> .env
    
    print_status "GitHub OAuth credentials saved to .env"
else
    print_warning "Skipping GitHub OAuth setup"
fi

echo ""
echo "🔧 Environment Configuration"
echo "==========================="
echo ""

# Set redirect URI
read -p "Enter your OAuth redirect URI (default: http://localhost:8080/auth/callback): " redirect_uri
redirect_uri=${redirect_uri:-"http://localhost:8080/auth/callback"}

# Update .env file
sed -i.bak '/OAUTH_REDIRECT_URI=/d' .env
echo "OAUTH_REDIRECT_URI=$redirect_uri" >> .env

print_status "OAuth redirect URI configured"

echo ""
echo "🧪 Testing Configuration"
echo "======================="
echo ""

print_info "Testing OAuth endpoints..."

# Test Google OAuth
if [ ! -z "$google_client_id" ]; then
    echo "Testing Google OAuth endpoint..."
    curl -s "http://localhost:8001/auth/oauth/google?redirect_uri=$redirect_uri" > /dev/null
    if [ $? -eq 0 ]; then
        print_status "Google OAuth endpoint is working"
    else
        print_error "Google OAuth endpoint test failed"
    fi
fi

# Test GitHub OAuth
if [ ! -z "$github_client_id" ]; then
    echo "Testing GitHub OAuth endpoint..."
    curl -s "http://localhost:8001/auth/oauth/github?redirect_uri=$redirect_uri" > /dev/null
    if [ $? -eq 0 ]; then
        print_status "GitHub OAuth endpoint is working"
    else
        print_error "GitHub OAuth endpoint test failed"
    fi
fi

echo ""
echo "🔒 Security Recommendations"
echo "=========================="
echo ""

print_info "Security best practices:"
echo "1. Use HTTPS in production"
echo "2. Rotate OAuth secrets regularly"
echo "3. Monitor OAuth usage"
echo "4. Implement rate limiting"
echo "5. Log OAuth events for security"
echo "6. Use environment variables for secrets"
echo "7. Validate redirect URIs server-side"
echo ""

echo "📋 Next Steps"
echo "============="
echo ""

print_info "To complete the setup:"
echo "1. Restart the AI services:"
echo "   cd backend/services/ai-services && python start_service.py"
echo ""
echo "2. Test OAuth flow in the frontend:"
echo "   - Go to http://localhost:8080/auth"
echo "   - Click Google or GitHub login buttons"
echo "   - Complete the OAuth flow"
echo ""
echo "3. Monitor logs for any errors"
echo "4. Update production domain in allowed redirect URIs"
echo ""

print_status "OAuth setup completed!"
echo ""
echo "For detailed documentation, see:"
echo "- docs/GOOGLE_OAUTH_SETUP.md"
echo "- docs/GITHUB_OAUTH_SETUP.md"
echo "" 