# 🚀 InfraMind - AI-Powered Infrastructure Management Platform

## 📁 Project Structure

This project follows a modular, microservices architecture with clear separation between backend services, frontend applications, and infrastructure components.

```
inframind/
├── backend/                    # All backend services
│   ├── services/              # Microservices
│   │   ├── api-gateway/      # API Gateway service (Port 3001)
│   │   ├── ai-services/      # AI/ML services (Port 8001)
│   │   ├── data-services/    # Database & data services (Port 8003)
│   │   ├── cloud-integrations/ # Cloud provider integrations (Port 8002)
│   │   ├── security-services/ # Security & compliance (Port 8004)
│   │   └── real-time-services/ # WebSocket & real-time (Port 8005)
│   ├── shared/               # Shared components
│   │   ├── models/          # Shared data models
│   │   ├── utils/           # Shared utilities
│   │   ├── middleware/      # Shared middleware
│   │   └── config/          # Shared configuration
│   ├── infrastructure/      # Backend infrastructure
│   │   ├── docker/         # Docker configurations
│   │   ├── k8s/           # Kubernetes manifests
│   │   ├── monitoring/     # Monitoring setup
│   │   └── scripts/       # Deployment scripts
│   └── docs/              # Backend documentation
├── frontend/               # All frontend components
│   ├── apps/              # Frontend applications
│   │   ├── dashboard/     # Main dashboard app
│   │   ├── admin/         # Admin panel app (future)
│   │   └── mobile/        # Mobile app (future)
│   ├── shared/            # Shared frontend components
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service clients
│   │   ├── utils/         # Frontend utilities
│   │   └── types/         # TypeScript type definitions
│   ├── infrastructure/    # Frontend infrastructure
│   │   ├── docker/        # Frontend Docker configs
│   │   └── scripts/       # Build & deployment scripts
│   └── docs/             # Frontend documentation
├── infrastructure/        # Global infrastructure
│   ├── docker-compose/   # Docker Compose files
│   ├── k8s/             # Global K8s manifests
│   ├── monitoring/       # Global monitoring
│   └── scripts/         # Global deployment scripts
├── docs/                # Global documentation
├── scripts/             # Global utility scripts
└── README.md           # This file
```

## 🏗️ Architecture Overview

### Backend Services
- **API Gateway**: Central entry point for all API requests
- **AI Services**: 20+ AI agents for infrastructure management
- **Data Services**: Database operations and data management
- **Cloud Integrations**: AWS, Azure, GCP integrations
- **Security Services**: Security scanning and compliance
- **Real-time Services**: WebSocket connections and real-time updates

### Frontend Applications
- **Dashboard**: Main user interface for infrastructure management
- **Admin Panel**: Administrative interface (planned)
- **Mobile App**: Mobile application (planned)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- MongoDB & Redis

### Development Setup

1. **Start Infrastructure Services**:
```bash
cd infrastructure/docker-compose
docker-compose up -d mongodb redis
```

2. **Start Backend Services**:
```bash
cd backend/infrastructure/scripts
./start-dev-local.sh
```

3. **Start Frontend**:
```bash
cd frontend/apps/dashboard
npm install
npm run dev
```

### Production Deployment

1. **Using Docker Compose**:
```bash
cd infrastructure/docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

2. **Using Kubernetes**:
```bash
cd infrastructure/k8s
kubectl apply -f .
```

## 📊 Service Endpoints

| Service | Port | Health Check | Description |
|---------|------|--------------|-------------|
| API Gateway | 3001 | `/health` | Central API entry point |
| AI Services | 8001 | `/health` | AI/ML agents |
| Data Services | 8003 | `/health` | Database operations |
| Cloud Integrations | 8002 | `/health` | Cloud provider APIs |
| Security Services | 8004 | `/health` | Security scanning |
| Real-time Services | 8005 | `/health` | WebSocket connections |

## 🧠 AI Capabilities

### Core AI Agents
- **Cost Optimization Agent**: Cloud cost analysis and optimization
- **Security Analysis Agent**: Vulnerability scanning and threat detection
- **Infrastructure Agent**: Resource provisioning and management
- **DevOps Agent**: CI/CD automation and deployment
- **Compliance Agent**: Regulatory compliance and auditing

### Advanced Features
- Natural language processing for infrastructure queries
- Predictive analytics for cost and performance
- Automated incident response and remediation
- Human-in-the-loop approval workflows
- Multi-cloud resource management

## 🔧 Development Workflow

### Backend Development
1. Services are in `backend/services/`
2. Shared components in `backend/shared/`
3. Infrastructure configs in `backend/infrastructure/`

### Frontend Development
1. Apps are in `frontend/apps/`
2. Shared components in `frontend/shared/`
3. Build scripts in `frontend/infrastructure/`

### Adding New Services
1. Create service directory in `backend/services/`
2. Add Docker configuration
3. Update API Gateway routing
4. Add health checks and monitoring

## 📈 Monitoring & Observability

- **Application Metrics**: Prometheus + Grafana
- **Logging**: Centralized ELK stack
- **Tracing**: Distributed tracing with Jaeger
- **Health Checks**: All services expose `/health` endpoints
- **Performance**: Real-time performance monitoring

## 🔒 Security

- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control (RBAC)
- **API Security**: Rate limiting and request validation
- **Data Protection**: Encryption at rest and in transit
- **Compliance**: GDPR, SOC 2, and industry standards

## 📚 Documentation

- **API Documentation**: Available at `/docs` on each service
- **Architecture**: See `docs/architecture.md`
- **Deployment**: See `docs/deployment.md`
- **Development**: See `docs/development.md`

## 🤝 Contributing

1. Follow the modular structure
2. Add tests for new features
3. Update documentation
4. Follow coding standards
5. Use conventional commits

## 📄 License

MIT License - see LICENSE file for details

---

**InfraMind** - AI-Powered Infrastructure Management Platform 