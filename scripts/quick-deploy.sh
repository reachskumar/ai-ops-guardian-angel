#!/bin/bash

# 🚀 AI Ops Guardian Angel - Quick Production Deployment
# This script automates the entire production deployment process

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running in CI/CD
if [ "$CI" = "true" ]; then
    log_info "Running in CI/CD mode"
    SKIP_PROMPTS=true
else
    SKIP_PROMPTS=false
fi

# Configuration
PROJECT_NAME="ai-ops-guardian-angel"
NAMESPACE="ai-ops-production"
REGISTRY="ghcr.io"
IMAGE_TAG=$(git rev-parse --short HEAD)

echo "🚀 AI Ops Guardian Angel - Quick Production Deployment"
echo "======================================================"
echo "Project: ${PROJECT_NAME}"
echo "Namespace: ${NAMESPACE}"
echo "Image Tag: ${IMAGE_TAG}"
echo "Registry: ${REGISTRY}"
echo ""

# Step 1: Environment Setup
log_info "Step 1: Environment Setup"

if [ ! -f ".env.production" ]; then
    log_warning ".env.production not found"
    if [ "$SKIP_PROMPTS" = "false" ]; then
        read -p "Create .env.production from template? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cp production.env.example .env.production
            log_warning "Please edit .env.production with your production values"
            log_info "You can run this script again after configuring .env.production"
            exit 1
        else
            exit 1
        fi
    else
        cp production.env.example .env.production
        log_warning "Created .env.production from template - please configure it"
        exit 1
    fi
fi

# Step 2: Prerequisites Check
log_info "Step 2: Checking Prerequisites"

# Check kubectl
if ! command -v kubectl &> /dev/null; then
    log_error "kubectl is not installed"
    exit 1
fi

# Check docker
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed"
    exit 1
fi

# Check git
if ! command -v git &> /dev/null; then
    log_error "Git is not installed"
    exit 1
fi

log_success "Prerequisites check passed"

# Step 3: Build and Push Images
log_info "Step 3: Building and Pushing Images"

# Build images
log_info "Building Docker images..."
docker build -f infrastructure/docker/api-gateway.Dockerfile \
    -t ${REGISTRY}/${PROJECT_NAME}/api-gateway:${IMAGE_TAG} \
    backend/services/api-gateway/

docker build -f infrastructure/docker/ai-services.Dockerfile \
    -t ${REGISTRY}/${PROJECT_NAME}/ai-services:${IMAGE_TAG} \
    backend/services/ai-services/

docker build -f infrastructure/docker/frontend.Dockerfile \
    -t ${REGISTRY}/${PROJECT_NAME}/frontend:${IMAGE_TAG} \
    frontend/

log_success "Images built successfully"

# Push images (if not in CI/CD, ask for confirmation)
if [ "$SKIP_PROMPTS" = "false" ]; then
    read -p "Push images to registry? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Pushing images..."
        docker push ${REGISTRY}/${PROJECT_NAME}/api-gateway:${IMAGE_TAG}
        docker push ${REGISTRY}/${PROJECT_NAME}/ai-services:${IMAGE_TAG}
        docker push ${REGISTRY}/${PROJECT_NAME}/frontend:${IMAGE_TAG}
        log_success "Images pushed successfully"
    else
        log_warning "Skipping image push"
    fi
else
    log_info "Pushing images..."
    docker push ${REGISTRY}/${PROJECT_NAME}/api-gateway:${IMAGE_TAG}
    docker push ${REGISTRY}/${PROJECT_NAME}/ai-services:${IMAGE_TAG}
    docker push ${REGISTRY}/${PROJECT_NAME}/frontend:${IMAGE_TAG}
    log_success "Images pushed successfully"
fi

# Step 4: Deploy to Kubernetes
log_info "Step 4: Deploying to Kubernetes"

# Create namespace
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

# Update image tags in manifests
find infrastructure/k8s/production/ -name "*.yaml" -exec sed -i "s|IMAGE_TAG|${IMAGE_TAG}|g" {} \;

# Apply secrets and config
kubectl apply -f infrastructure/k8s/production/secrets.yaml
kubectl apply -f infrastructure/k8s/production/configmap.yaml

# Deploy services
kubectl apply -f infrastructure/k8s/production/api-gateway.yaml
kubectl apply -f infrastructure/k8s/production/ai-services.yaml
kubectl apply -f infrastructure/k8s/production/frontend.yaml

# Apply ingress
kubectl apply -f infrastructure/k8s/production/ingress.yaml

log_success "Kubernetes deployment completed"

# Step 5: Wait for Deployment
log_info "Step 5: Waiting for Deployment"

# Wait for deployments to be ready
kubectl rollout status deployment/api-gateway -n ${NAMESPACE} --timeout=300s
kubectl rollout status deployment/ai-services -n ${NAMESPACE} --timeout=300s
kubectl rollout status deployment/frontend -n ${NAMESPACE} --timeout=300s

log_success "All deployments are ready"

# Step 6: Run Tests
log_info "Step 6: Running Tests"

# Wait for services to be fully ready
sleep 30

# Run smoke tests
if command -v python3 &> /dev/null; then
    log_info "Running smoke tests..."
    python3 scripts/test-smoke.py --environment production || {
        log_error "Smoke tests failed"
        exit 1
    }
    log_success "Smoke tests passed"
else
    log_warning "Python not found, skipping tests"
fi

# Step 7: Show Status
log_info "Step 7: Deployment Status"

echo ""
echo "📊 Deployment Summary:"
echo "  - Version: ${IMAGE_TAG}"
echo "  - Namespace: ${NAMESPACE}"
echo "  - Services: API Gateway, AI Services, Frontend"
echo ""

echo "🔍 Checking deployment status..."
kubectl get pods -n ${NAMESPACE}
echo ""

echo "🔗 Services:"
kubectl get services -n ${NAMESPACE}
echo ""

echo "🌐 Ingress:"
kubectl get ingress -n ${NAMESPACE}
echo ""

# Step 8: Final Instructions
log_success "🎉 Deployment completed successfully!"

echo ""
echo "📋 Next Steps:"
echo "1. Configure your domain DNS to point to your Kubernetes cluster"
echo "2. Update the ingress configuration with your actual domain"
echo "3. Set up SSL certificates (cert-manager should handle this automatically)"
echo "4. Configure monitoring and alerting"
echo "5. Set up backup and disaster recovery"
echo ""

echo "🔗 Access URLs (after DNS configuration):"
echo "  - Frontend: https://your-domain.com"
echo "  - API: https://api.your-domain.com"
echo ""

echo "📞 Support:"
echo "  - Documentation: Check the docs folder"
echo "  - Issues: Create GitHub issues"
echo "  - Rollback: ./scripts/deploy-production.sh rollback"
echo ""

log_success "Production deployment completed! 🚀" 