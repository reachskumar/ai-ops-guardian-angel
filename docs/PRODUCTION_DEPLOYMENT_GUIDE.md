# 🚀 Production Deployment Guide
## AI Ops Guardian Angel - Complete Production Setup

This guide provides step-by-step instructions for deploying the AI Ops Guardian Angel platform to production.

---

## 📋 **Prerequisites**

### **Required Tools**
- [ ] **kubectl** (v1.24+) - Kubernetes CLI
- [ ] **Docker** (v20.10+) - Container runtime
- [ ] **Git** - Version control
- [ ] **Python 3.11+** - For testing scripts

### **Required Accounts**
- [ ] **GitHub Account** - For container registry
- [ ] **Kubernetes Cluster** - Production K8s cluster
- [ ] **Domain Name** - For SSL certificates
- [ ] **Cloud Provider Accounts** - AWS/Azure/GCP for integrations

### **Required Secrets**
- [ ] **MongoDB Atlas** - Production database
- [ ] **Redis** - Production cache
- [ ] **OpenAI API Key** - AI model access
- [ ] **Cloud Provider Credentials** - AWS/Azure/GCP access

---

## 🏗️ **Step 1: Environment Setup**

### **1.1 Clone and Setup Repository**
```bash
git clone https://github.com/your-org/ai-ops-guardian-angel.git
cd ai-ops-guardian-angel
```

### **1.2 Configure Production Environment**
```bash
# Copy production environment template
cp production.env.example .env.production

# Edit with your production values
nano .env.production
```

**Required Environment Variables:**
```bash
# Database
MONGODB_URI=mongodb+srv://[USERNAME]:[PASSWORD]@[CLUSTER].mongodb.net/ai_ops_platform
REDIS_URI=redis://[REDIS_HOST]:6379

# AI Models
OPENAI_API_KEY=[YOUR_OPENAI_API_KEY]
ANTHROPIC_API_KEY=[YOUR_ANTHROPIC_API_KEY]

# Security
JWT_SECRET=[YOUR_32_CHARACTER_JWT_SECRET]
SECRET_KEY=[YOUR_32_CHARACTER_SECRET_KEY]

# Domain Configuration
FRONTEND_URL=https://your-domain.com
API_GATEWAY_URL=https://api.your-domain.com

# Cloud Provider Credentials
AWS_ACCESS_KEY_ID=[YOUR_AWS_ACCESS_KEY]
AWS_SECRET_ACCESS_KEY=[YOUR_AWS_SECRET_KEY]
AZURE_CLIENT_ID=[YOUR_AZURE_CLIENT_ID]
AZURE_CLIENT_SECRET=[YOUR_AZURE_CLIENT_SECRET]
GCP_SERVICE_ACCOUNT_KEY=[YOUR_GCP_SERVICE_ACCOUNT_KEY]
```

---

## 🔧 **Step 2: Kubernetes Setup**

### **2.1 Configure kubectl**
```bash
# Set your Kubernetes context
kubectl config use-context your-production-cluster

# Verify connection
kubectl cluster-info
```

### **2.2 Setup Secrets**
```bash
# Create base64 encoded secrets
echo -n "your-mongodb-uri" | base64
echo -n "your-jwt-secret" | base64
echo -n "your-openai-key" | base64

# Update secrets.yaml with encoded values
nano infrastructure/k8s/production/secrets.yaml
```

### **2.3 Install Required Operators**
```bash
# Install cert-manager for SSL certificates
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.0/deploy/static/provider/cloud/deploy.yaml
```

---

## 🐳 **Step 3: Build and Push Images**

### **3.1 Login to Container Registry**
```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin
```

### **3.2 Build Images**
```bash
# Build all images
./scripts/deploy-production.sh
```

**Or build individually:**
```bash
# API Gateway
docker build -f infrastructure/docker/api-gateway.Dockerfile \
  -t ghcr.io/your-org/ai-ops-guardian-angel/api-gateway:latest \
  backend/services/api-gateway/

# AI Services
docker build -f infrastructure/docker/ai-services.Dockerfile \
  -t ghcr.io/your-org/ai-ops-guardian-angel/ai-services:latest \
  backend/services/ai-services/

# Frontend
docker build -f infrastructure/docker/frontend.Dockerfile \
  -t ghcr.io/your-org/ai-ops-guardian-angel/frontend:latest \
  frontend/
```

### **3.3 Push Images**
```bash
# Push all images
docker push ghcr.io/your-org/ai-ops-guardian-angel/api-gateway:latest
docker push ghcr.io/your-org/ai-ops-guardian-angel/ai-services:latest
docker push ghcr.io/your-org/ai-ops-guardian-angel/frontend:latest
```

---

## 🚀 **Step 4: Deploy to Production**

### **4.1 Deploy Core Services**
```bash
# Create namespace
kubectl create namespace ai-ops-production

# Apply secrets and config
kubectl apply -f infrastructure/k8s/production/secrets.yaml
kubectl apply -f infrastructure/k8s/production/configmap.yaml

# Deploy services
kubectl apply -f infrastructure/k8s/production/api-gateway.yaml
kubectl apply -f infrastructure/k8s/production/ai-services.yaml
kubectl apply -f infrastructure/k8s/production/frontend.yaml
```

### **4.2 Setup Ingress and SSL**
```bash
# Apply ingress configuration
kubectl apply -f infrastructure/k8s/production/ingress.yaml

# Verify SSL certificate creation
kubectl get certificates -n ai-ops-production
```

### **4.3 Verify Deployment**
```bash
# Check deployment status
kubectl get pods -n ai-ops-production

# Check services
kubectl get services -n ai-ops-production

# Check ingress
kubectl get ingress -n ai-ops-production
```

---

## 🧪 **Step 5: Testing and Validation**

### **5.1 Run Smoke Tests**
```bash
# Run automated smoke tests
python scripts/test-smoke.py --environment production

# Or run integration tests
python scripts/test-integration.py --environment production
```

### **5.2 Manual Testing**
```bash
# Test health endpoints
curl https://api.your-domain.com/health
curl https://your-domain.com/

# Test authentication
curl -X POST https://api.your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### **5.3 Performance Testing**
```bash
# Test response times
ab -n 100 -c 10 https://api.your-domain.com/health

# Load testing
k6 run scripts/load-test.js
```

---

## 📊 **Step 6: Monitoring Setup**

### **6.1 Deploy Monitoring Stack**
```bash
# Apply Prometheus and Grafana
kubectl apply -f infrastructure/k8s/monitoring/ -n ai-ops-production

# Verify monitoring pods
kubectl get pods -n ai-ops-production | grep monitoring
```

### **6.2 Configure Alerts**
```bash
# Apply alert rules
kubectl apply -f infrastructure/k8s/monitoring/alerts/

# Verify alert manager
kubectl get pods -n ai-ops-production | grep alertmanager
```

### **6.3 Setup Logging**
```bash
# Deploy ELK stack (optional)
kubectl apply -f infrastructure/k8s/logging/ -n ai-ops-production
```

---

## 🔒 **Step 7: Security Hardening**

### **7.1 Network Policies**
```bash
# Apply network policies
kubectl apply -f infrastructure/k8s/security/network-policies.yaml

# Verify policies
kubectl get networkpolicies -n ai-ops-production
```

### **7.2 Pod Security Standards**
```bash
# Apply pod security standards
kubectl apply -f infrastructure/k8s/security/pod-security.yaml
```

### **7.3 Security Scanning**
```bash
# Run security scan
trivy k8s --report summary cluster

# Scan container images
trivy image ghcr.io/your-org/ai-ops-guardian-angel/api-gateway:latest
```

---

## 💾 **Step 8: Backup and Recovery**

### **8.1 Setup Automated Backups**
```bash
# Deploy backup jobs
kubectl apply -f infrastructure/k8s/backup/ -n ai-ops-production

# Verify backup jobs
kubectl get cronjobs -n ai-ops-production
```

### **8.2 Test Recovery**
```bash
# Test database restore
kubectl apply -f infrastructure/k8s/backup/restore-test.yaml

# Verify restore
kubectl logs -n ai-ops-production job/restore-test
```

---

## 🔄 **Step 9: CI/CD Pipeline**

### **9.1 Setup GitHub Actions**
```bash
# The CI/CD pipeline is already configured in .github/workflows/ci-cd.yml
# Just ensure your repository has the required secrets:

# Required GitHub Secrets:
# - KUBE_CONFIG_PRODUCTION (base64 encoded kubeconfig)
# - OPENAI_API_KEY
# - ANTHROPIC_API_KEY
# - SLACK_WEBHOOK_URL
```

### **9.2 Test Pipeline**
```bash
# Push to main branch to trigger production deployment
git push origin main

# Monitor deployment in GitHub Actions
# Check: https://github.com/your-org/ai-ops-guardian-angel/actions
```

---

## 📈 **Step 10: Performance Optimization**

### **10.1 Resource Optimization**
```bash
# Monitor resource usage
kubectl top pods -n ai-ops-production

# Adjust resource limits if needed
kubectl edit deployment api-gateway -n ai-ops-production
```

### **10.2 Scaling Configuration**
```bash
# Setup horizontal pod autoscaling
kubectl apply -f infrastructure/k8s/scaling/hpa.yaml

# Verify HPA
kubectl get hpa -n ai-ops-production
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Pods Not Starting**
```bash
# Check pod status
kubectl describe pod <pod-name> -n ai-ops-production

# Check logs
kubectl logs <pod-name> -n ai-ops-production
```

#### **SSL Certificate Issues**
```bash
# Check certificate status
kubectl describe certificate ai-ops-tls -n ai-ops-production

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager
```

#### **Database Connection Issues**
```bash
# Test database connectivity
kubectl exec -it deployment/api-gateway -n ai-ops-production -- \
  curl -X GET http://localhost:3001/health
```

#### **Performance Issues**
```bash
# Check resource usage
kubectl top nodes
kubectl top pods -n ai-ops-production

# Check ingress logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

---

## 📞 **Support and Maintenance**

### **Monitoring URLs**
- **Grafana Dashboard**: https://grafana.your-domain.com
- **Prometheus**: https://prometheus.your-domain.com
- **Kibana** (if using ELK): https://kibana.your-domain.com

### **Alert Channels**
- **Slack**: #ai-ops-alerts
- **Email**: alerts@your-domain.com
- **PagerDuty**: AI Ops Guardian Angel

### **Documentation**
- **API Documentation**: https://api.your-domain.com/docs
- **User Guide**: https://docs.your-domain.com
- **Admin Guide**: https://admin.your-domain.com

---

## ✅ **Deployment Checklist**

### **Pre-Deployment**
- [ ] Environment variables configured
- [ ] Secrets properly encoded
- [ ] Domain DNS configured
- [ ] SSL certificates ready
- [ ] Container images built and pushed
- [ ] Kubernetes cluster accessible

### **Deployment**
- [ ] Namespace created
- [ ] Secrets applied
- [ ] ConfigMaps applied
- [ ] Deployments applied
- [ ] Services created
- [ ] Ingress configured
- [ ] SSL certificates issued

### **Post-Deployment**
- [ ] Health checks passing
- [ ] Smoke tests successful
- [ ] Performance tests passed
- [ ] Security scan clean
- [ ] Monitoring configured
- [ ] Alerts working
- [ ] Backup jobs running
- [ ] Documentation updated

### **Go-Live**
- [ ] DNS propagated
- [ ] SSL certificates valid
- [ ] All services responding
- [ ] User acceptance testing passed
- [ ] Team notified
- [ ] Support team ready

---

## 🎉 **Success!**

Your AI Ops Guardian Angel platform is now deployed to production! 

**Access URLs:**
- **Frontend**: https://your-domain.com
- **API**: https://api.your-domain.com
- **Documentation**: https://docs.your-domain.com
- **Monitoring**: https://grafana.your-domain.com

**Next Steps:**
1. **User Onboarding** - Train your team on the new platform
2. **Performance Monitoring** - Watch for any performance issues
3. **Security Auditing** - Regular security assessments
4. **Feature Development** - Continue building new features
5. **Scaling** - Monitor usage and scale as needed

---

**Need Help?**
- **Documentation**: Check the docs folder
- **Issues**: Create GitHub issues
- **Support**: Contact the development team
- **Emergency**: Use the rollback script: `./scripts/deploy-production.sh rollback` 