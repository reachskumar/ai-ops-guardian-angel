# 🍃 MongoDB Atlas Setup Guide

## Overview
This guide will help you migrate from local MongoDB to **MongoDB Atlas** (cloud) for your AI Ops Guardian Angel platform.

## 🚀 **Step 1: Create MongoDB Atlas Account**

### 1.1 Sign up for MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Verify your email address

### 1.2 Create a New Cluster
1. Click **"Build a Database"**
2. Choose **M0 Sandbox** (Free tier) for development
3. Select your preferred **Cloud Provider & Region**
4. Name your cluster: `ai-ops-cluster`
5. Click **"Create Cluster"**

### 1.3 Configure Database Access
1. Go to **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `ai-ops-user`
5. Password: Generate a strong password (save it!)
6. Grant **"Atlas Admin"** privileges for development
7. Click **"Add User"**

### 1.4 Configure Network Access
1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. For production, add your specific IP addresses
5. Click **"Confirm"**

## 🔗 **Step 2: Get Your Connection String**

### 2.1 Get MongoDB Atlas URI
1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** and version **4.1 or later**
5. Copy the connection string that looks like:
```
mongodb+srv://ai-ops-user:<password>@ai-ops-cluster.xyz.mongodb.net/?retryWrites=true&w=majority
```

### 2.2 Customize Your Connection String
Replace `<password>` and add your database name:
```
mongodb+srv://ai-ops-user:YOUR_ACTUAL_PASSWORD@ai-ops-cluster.xyz.mongodb.net/ai_ops_platform?retryWrites=true&w=majority
```

## ⚙️ **Step 3: Update Your Platform Configuration**

### 3.1 Create Environment Variables
Create these files with your actual Atlas connection string:

**File: `backend/services/ai-services/.env`**
```bash
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://ai-ops-user:YOUR_PASSWORD@ai-ops-cluster.xyz.mongodb.net/ai_ops_platform?retryWrites=true&w=majority

# Your existing OpenAI key
OPENAI_API_KEY=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

# Other configuration
REDIS_URI=redis://localhost:6379
ENVIRONMENT=production
```

**File: `backend/services/data-services/.env`**
```bash
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://ai-ops-user:YOUR_PASSWORD@ai-ops-cluster.xyz.mongodb.net/ai_ops_platform?retryWrites=true&w=majority

# Security
JWT_SECRET=your-jwt-secret-key-change-this
REDIS_URI=redis://localhost:6379
```

**File: `backend/services/cloud-integrations/.env`**
```bash
# MongoDB Atlas Configuration  
MONGODB_URI=mongodb+srv://ai-ops-user:YOUR_PASSWORD@ai-ops-cluster.xyz.mongodb.net/ai_ops_platform?retryWrites=true&w=majority

# Your cloud provider credentials
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AZURE_CLIENT_ID=your-azure-client-id
# ... other credentials
```

**File: `backend/services/api-gateway/.env`**
```bash
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://ai-ops-user:YOUR_PASSWORD@ai-ops-cluster.xyz.mongodb.net/ai_ops_platform?retryWrites=true&w=majority

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3.2 Update System Environment (Optional)
You can also set the system environment variable:
```bash
export MONGODB_URI="mongodb+srv://ai-ops-user:YOUR_PASSWORD@ai-ops-cluster.xyz.mongodb.net/ai_ops_platform?retryWrites=true&w=majority"
```

## 🐳 **Step 4: Update Docker Configuration (Optional)**

If you're using Docker and want to remove local MongoDB:

### 4.1 Update docker-compose.yml
Comment out or remove the MongoDB service:

```yaml
# Remove or comment out local MongoDB
# mongodb:
#   image: mongo:7
#   ports: ["27017:27017"]
#   environment:
#     MONGO_INITDB_ROOT_USERNAME: admin
#     MONGO_INITDB_ROOT_PASSWORD: password
#   volumes: ["mongodb_data:/data/db"]

# Update service dependencies - remove 'mongodb' from depends_on
ai-services:
  environment:
    - MONGODB_URI=mongodb+srv://ai-ops-user:YOUR_PASSWORD@ai-ops-cluster.xyz.mongodb.net/ai_ops_platform?retryWrites=true&w=majority
  # depends_on: ["redis"]  # Remove mongodb dependency
```

## 🧪 **Step 5: Test Your Connection**

### 5.1 Test AI Services
```bash
cd backend/services/ai-services
source venv/bin/activate
python start_service.py
```

Look for:
```
✅ Connected to MongoDB Atlas
🛡️ 28 AI Agents Ready for Infrastructure Optimization
```

### 5.2 Test Data Services
```bash
cd backend/services/data-services
npm run dev
```

Look for:
```
✅ Connected to MongoDB Atlas
🗄️ InfraMind Data Services running on port 8003
```

### 5.3 Test Full Platform
```bash
# Run your existing startup process
python demo-customer-workflow.py
```

Should show all services healthy!

## 🔒 **Step 6: Security Best Practices**

### 6.1 Database Security
- ✅ Use strong passwords for database users
- ✅ Enable IP Access List (whitelist specific IPs)
- ✅ Use database-specific users instead of admin
- ✅ Enable MongoDB's built-in authentication

### 6.2 Connection String Security
- ✅ Never commit connection strings to git
- ✅ Use environment variables
- ✅ Consider using MongoDB's Connection String URI format
- ✅ Enable TLS/SSL (included by default in Atlas)

### 6.3 Production Recommendations
- ✅ Use M2+ clusters for production (M0 is dev only)
- ✅ Enable backup and point-in-time recovery
- ✅ Set up monitoring and alerts
- ✅ Use private networking (VPC peering) when possible

## 📊 **Step 7: Monitor Your Atlas Cluster**

### 7.1 Atlas Dashboard
- **Performance Advisor** - Query optimization suggestions
- **Real-time Metrics** - Monitor CPU, memory, connections
- **Profiler** - Analyze slow operations
- **Alerts** - Set up notifications for issues

### 7.2 Useful Atlas Features
- **Data Explorer** - Browse your collections
- **Aggregation Builder** - Visual query builder
- **Charts** - Create dashboards for your data
- **Full-Text Search** - Enhanced search capabilities

## 🎯 **Step 8: Verify Your Migration**

### 8.1 Check Your Data
1. Go to Atlas Dashboard → "Browse Collections"
2. You should see your `ai_ops_platform` database
3. Verify collections are being created by your services

### 8.2 Test Multi-Cloud Features
```bash
# Test the demo workflow
python demo-customer-workflow.py
```

Should show:
```
✅ AI Services
✅ Cloud Integrations  
✅ Data Services
✅ API Gateway
✅ All services healthy! Starting customer demo...
```

## 🚨 **Troubleshooting**

### Common Issues:

**Connection Timeout:**
- Check your IP is whitelisted in Network Access
- Verify your username/password
- Ensure cluster is running (not paused)

**Authentication Failed:**
- Double-check username and password
- Verify database user has correct permissions
- Check connection string format

**DNS Resolution:**
- Atlas requires internet connection
- Check if your network blocks MongoDB ports
- Try connecting from different network

## 🎉 **Success!**

Your AI Ops Guardian Angel platform is now running on **MongoDB Atlas**! 

### Benefits You Now Have:
- ✅ **Global Availability** - 99.995% uptime SLA
- ✅ **Automatic Scaling** - Handles traffic spikes
- ✅ **Built-in Security** - Enterprise-grade protection
- ✅ **Automated Backups** - Point-in-time recovery
- ✅ **Performance Insights** - Query optimization
- ✅ **No Infrastructure Management** - Focus on your app

### Next Steps:
1. Set up monitoring alerts in Atlas
2. Configure backup retention policies
3. Consider upgrading to M2+ for production
4. Set up staging/production environment separation

Your multi-cloud AI platform is now enterprise-ready! 🚀 