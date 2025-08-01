#!/bin/bash

# 🚀 AI Ops Guardian Angel - Production Deployment Script
# This script handles the complete production deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="ai-ops-guardian-angel"
NAMESPACE="ai-ops-production"
REGISTRY="ghcr.io"
IMAGE_TAG=$(git rev-parse --short HEAD)

# Functions
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

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "README.md" ]; then
        log_error "Please run this script from the project root directory."
        exit 1
    fi
    
    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        log_warning ".env.production not found. Please create it from production.env.example"
        log_info "Creating .env.production from template..."
        cp production.env.example .env.production
        log_warning "Please edit .env.production with your actual production values"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

build_images() {
    log_info "Building Docker images..."
    
    # Build API Gateway
    log_info "Building API Gateway..."
    docker build -f infrastructure/docker/api-gateway.Dockerfile \
        -t ${REGISTRY}/${PROJECT_NAME}/api-gateway:${IMAGE_TAG} \
        backend/services/api-gateway/
    
    # Build AI Services
    log_info "Building AI Services..."
    docker build -f infrastructure/docker/ai-services.Dockerfile \
        -t ${REGISTRY}/${PROJECT_NAME}/ai-services:${IMAGE_TAG} \
        backend/services/ai-services/
    
    # Build Frontend
    log_info "Building Frontend..."
    docker build -f infrastructure/docker/frontend.Dockerfile \
        -t ${REGISTRY}/${PROJECT_NAME}/frontend:${IMAGE_TAG} \
        frontend/
    
    log_success "All images built successfully"
}

push_images() {
    log_info "Pushing Docker images to registry..."
    
    # Login to registry (if needed)
    if [ -n "$GITHUB_TOKEN" ]; then
        echo "$GITHUB_TOKEN" | docker login ${REGISTRY} -u $GITHUB_USERNAME --password-stdin
    fi
    
    # Push images
    docker push ${REGISTRY}/${PROJECT_NAME}/api-gateway:${IMAGE_TAG}
    docker push ${REGISTRY}/${PROJECT_NAME}/ai-services:${IMAGE_TAG}
    docker push ${REGISTRY}/${PROJECT_NAME}/frontend:${IMAGE_TAG}
    
    log_success "All images pushed successfully"
}

update_k8s_manifests() {
    log_info "Updating Kubernetes manifests with new image tags..."
    
    # Update image tags in all manifests
    find infrastructure/k8s/production/ -name "*.yaml" -exec sed -i "s|IMAGE_TAG|${IMAGE_TAG}|g" {} \;
    
    log_success "Kubernetes manifests updated"
}

deploy_to_k8s() {
    log_info "Deploying to Kubernetes..."
    
    # Create namespace if it doesn't exist
    kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply secrets first
    log_info "Applying secrets..."
    kubectl apply -f infrastructure/k8s/production/secrets.yaml
    
    # Apply configmap
    log_info "Applying configmap..."
    kubectl apply -f infrastructure/k8s/production/configmap.yaml
    
    # Apply deployments
    log_info "Applying deployments..."
    kubectl apply -f infrastructure/k8s/production/api-gateway.yaml
    kubectl apply -f infrastructure/k8s/production/ai-services.yaml
    kubectl apply -f infrastructure/k8s/production/frontend.yaml
    
    # Apply ingress
    log_info "Applying ingress..."
    kubectl apply -f infrastructure/k8s/production/ingress.yaml
    
    log_success "Kubernetes deployment completed"
}

wait_for_deployment() {
    log_info "Waiting for deployments to be ready..."
    
    # Wait for API Gateway
    kubectl rollout status deployment/api-gateway -n ${NAMESPACE} --timeout=300s
    
    # Wait for AI Services
    kubectl rollout status deployment/ai-services -n ${NAMESPACE} --timeout=300s
    
    # Wait for Frontend
    kubectl rollout status deployment/frontend -n ${NAMESPACE} --timeout=300s
    
    log_success "All deployments are ready"
}

run_smoke_tests() {
    log_info "Running smoke tests..."
    
    # Wait a bit for services to be fully ready
    sleep 30
    
    # Run smoke tests
    python scripts/test-smoke.py --environment production --output smoke-test-results.json
    
    if [ $? -eq 0 ]; then
        log_success "Smoke tests passed"
    else
        log_error "Smoke tests failed"
        exit 1
    fi
}

setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Apply Prometheus and Grafana
    kubectl apply -f infrastructure/k8s/monitoring/ --namespace ${NAMESPACE}
    
    log_success "Monitoring setup completed"
}

setup_backup() {
    log_info "Setting up backup configuration..."
    
    # Create backup job
    kubectl apply -f infrastructure/k8s/backup/ --namespace ${NAMESPACE}
    
    log_success "Backup configuration completed"
}

notify_deployment() {
    log_info "Sending deployment notification..."
    
    # Send notification to Slack (if configured)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"✅ Production deployment successful! Version: ${IMAGE_TAG}\"}" \
            $SLACK_WEBHOOK_URL
    fi
    
    log_success "Deployment notification sent"
}

rollback() {
    log_warning "Rolling back deployment..."
    
    # Rollback to previous version
    kubectl rollout undo deployment/api-gateway -n ${NAMESPACE}
    kubectl rollout undo deployment/ai-services -n ${NAMESPACE}
    kubectl rollout undo deployment/frontend -n ${NAMESPACE}
    
    log_success "Rollback completed"
}

main() {
    echo "🚀 AI Ops Guardian Angel - Production Deployment"
    echo "================================================"
    echo "Project: ${PROJECT_NAME}"
    echo "Namespace: ${NAMESPACE}"
    echo "Image Tag: ${IMAGE_TAG}"
    echo "Registry: ${REGISTRY}"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Build and push images
    build_images
    push_images
    
    # Update and deploy to Kubernetes
    update_k8s_manifests
    deploy_to_k8s
    
    # Wait for deployment
    wait_for_deployment
    
    # Run smoke tests
    run_smoke_tests
    
    # Setup monitoring and backup
    setup_monitoring
    setup_backup
    
    # Send notification
    notify_deployment
    
    echo ""
    log_success "🎉 Production deployment completed successfully!"
    echo ""
    echo "📊 Deployment Summary:"
    echo "  - Version: ${IMAGE_TAG}"
    echo "  - Namespace: ${NAMESPACE}"
    echo "  - Services: API Gateway, AI Services, Frontend"
    echo "  - Monitoring: Prometheus + Grafana"
    echo "  - Backup: Configured"
    echo ""
    echo "🔗 Access URLs:"
    echo "  - Frontend: https://your-domain.com"
    echo "  - API: https://api.your-domain.com"
    echo "  - Monitoring: https://grafana.your-domain.com"
    echo ""
}

# Handle script arguments
case "${1:-}" in
    "rollback")
        rollback
        ;;
    "test")
        run_smoke_tests
        ;;
    "monitoring")
        setup_monitoring
        ;;
    "backup")
        setup_backup
        ;;
    *)
        main
        ;;
esac 