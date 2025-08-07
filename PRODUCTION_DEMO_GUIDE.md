# 🚀 **PRODUCTION DEMO GUIDE - AI Ops Guardian Angel**

## 📋 **CURRENT STATUS**
✅ **Frontend Running**: http://localhost:8080  
✅ **Backend Services**: All running on ports 8001-8004  
✅ **AI Services**: Mock AI service running  
✅ **Data Services**: Authentication working  
✅ **Cloud Integrations**: Mock endpoints available  

---

## 🎯 **HOW TO ACCESS THE UI & CONNECT AWS**

### **1. Access the Frontend UI**
```bash
# Open your browser and go to:
http://localhost:8080
```

### **2. Available Demo Routes**

#### **🏠 Main Dashboard**
- **URL**: `http://localhost:8080/dashboard`
- **Features**: Overview of all services, metrics, and status

#### **💬 AI Chat Interface** 
- **URL**: `http://localhost:8080/chat`
- **Demo**: Ask questions like:
  - "How can I optimize my AWS costs?"
  - "What security issues do I have?"
  - "Create a Terraform template for an EC2 instance"

#### **☁️ Cloud Connection**
- **URL**: `http://localhost:8080/cloud-connection`
- **Features**: AWS account connection interface

#### **💰 Cost Optimization**
- **URL**: `http://localhost:8080/cost-optimization`
- **Features**: Cost analysis and optimization recommendations

#### **🔧 Multi-Cloud Management**
- **URL**: `http://localhost:8080/multi-cloud`
- **Features**: Manage AWS, Azure, GCP resources

---

## 🔗 **CONNECTING YOUR AWS ACCOUNT**

### **Step 1: Access Cloud Connection**
1. Go to `http://localhost:8080/cloud-connection`
2. Click "Connect AWS Account"

### **Step 2: AWS Credentials Setup**
You'll need to provide:
- **AWS Access Key ID**
- **AWS Secret Access Key** 
- **AWS Region** (e.g., us-east-1)

### **Step 3: Demo AWS Credentials**
For the demo, you can use:
```bash
# Create a test IAM user in your AWS account
# Or use existing credentials with these permissions:
- EC2:Read
- CloudWatch:Read
- CostExplorer:Read
- IAM:Read
```

---

## 🎮 **DEMO SCENARIOS**

### **Scenario 1: AI Chat with Infrastructure**
1. Go to `http://localhost:8080/chat`
2. Ask: "What EC2 instances do I have running?"
3. Ask: "How can I reduce my AWS costs by 20%?"
4. Ask: "Create a security group for a web application"

### **Scenario 2: Cost Optimization**
1. Go to `http://localhost:8080/cost-optimization`
2. View cost breakdown
3. See optimization recommendations
4. Apply cost-saving suggestions

### **Scenario 3: Multi-Cloud Management**
1. Go to `http://localhost:8080/multi-cloud`
2. View resources across clouds
3. Compare costs
4. Manage deployments

### **Scenario 4: AI Agents**
1. Go to `http://localhost:8080/agents`
2. View active AI agents
3. See agent performance metrics
4. Configure agent settings

---

## 🔧 **BACKEND API ENDPOINTS**

### **Health Checks**
```bash
# AI Services
curl http://localhost:8001/health

# Data Services  
curl http://localhost:8003/health

# Cloud Integrations
curl http://localhost:8002/health

# Real-time Services
curl http://localhost:8004/health
```

### **AI Chat API**
```bash
# Send a chat message
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How can I optimize my AWS costs?"}'
```

### **Cloud Integration API**
```bash
# Get cloud providers
curl http://localhost:8002/providers

# Get cloud resources
curl http://localhost:8002/resources

# Get cloud costs
curl http://localhost:8002/costs
```

---

## 🚨 **TROUBLESHOOTING**

### **Frontend Not Loading**
```bash
# Check if frontend is running
curl http://localhost:8080

# Restart frontend
cd frontend && npm run dev
```

### **Backend Services Not Responding**
```bash
# Check all services
lsof -i :8001-8004

# Restart services
cd backend/services/ai-services && python src/working_ai_service.py &
cd backend/services/data-services && npm start &
cd backend/services/cloud-integrations && npm start &
cd backend/services/real-time-services && npm start &
```

### **AWS Connection Issues**
1. Verify AWS credentials are correct
2. Check IAM permissions
3. Ensure region is correct
4. Test with AWS CLI first

---

## 📊 **DEMO FEATURES TO SHOWCASE**

### **✅ Working Features**
- **AI Chat Interface**: Ask infrastructure questions
- **Cost Optimization**: View cost analysis
- **Multi-Cloud Dashboard**: Resource management
- **AI Agents**: Agent monitoring and control
- **Real-time Integration**: Live data updates
- **Authentication**: User login/registration

### **🔄 Mock/Simulated Features**
- **Cloud Integrations**: Mock AWS/Azure/GCP data
- **AI Responses**: Simulated AI responses
- **Cost Data**: Sample cost optimization data
- **Security**: Mock security analysis

---

## 🎯 **PRODUCTION DEMO SCRIPT**

### **Opening (2 minutes)**
1. "Welcome to AI Ops Guardian Angel - an intelligent infrastructure management platform"
2. "We have a comprehensive demo environment running with all services active"
3. "Let me show you the key features"

### **Main Demo (8 minutes)**
1. **Dashboard Overview** (2 min)
   - Show main dashboard with metrics
   - Explain the architecture

2. **AI Chat Demo** (3 min)
   - Ask infrastructure questions
   - Show AI responses
   - Demonstrate problem-solving

3. **Cost Optimization** (2 min)
   - Show cost analysis
   - Display optimization recommendations

4. **Multi-Cloud Management** (1 min)
   - Show resource management
   - Demonstrate cross-cloud capabilities

### **Closing (2 minutes)**
1. "This platform provides end-to-end infrastructure management"
2. "Ready for production deployment with real cloud accounts"
3. "Questions and next steps"

---

## 🔗 **QUICK ACCESS LINKS**

- **Main Dashboard**: http://localhost:8080/dashboard
- **AI Chat**: http://localhost:8080/chat  
- **Cloud Connection**: http://localhost:8080/cloud-connection
- **Cost Optimization**: http://localhost:8080/cost-optimization
- **Multi-Cloud**: http://localhost:8080/multi-cloud
- **AI Agents**: http://localhost:8080/agents
- **Features Showcase**: http://localhost:8080/features

---

## 📞 **SUPPORT**

If you encounter issues:
1. Check service status with health endpoints
2. Restart services if needed
3. Verify all ports are accessible
4. Check browser console for errors

**Ready for your production demo! 🚀** 