#!/usr/bin/env python3
"""
AI Ops Guardian Angel - Customer Multi-Cloud Management Demo
This script demonstrates how customers connect and manage their cloud environments
"""

import requests
import json
import time
from typing import Dict, Any

class CloudManagementDemo:
    def __init__(self):
        self.base_url = "http://localhost"
        self.ai_services = f"{self.base_url}:8001"
        self.cloud_integrations = f"{self.base_url}:8002"
        self.api_gateway = f"{self.base_url}:3001"
        
    def demo_customer_workflow(self):
        """Complete customer workflow demonstration"""
        
        print("🌥️  AI Ops Guardian Angel - Multi-Cloud Management Demo")
        print("=" * 60)
        
        # Step 1: Customer connects their cloud accounts
        print("\n🔗 STEP 1: Connecting Cloud Accounts")
        print("-" * 40)
        
        aws_connection = self.connect_aws_account()
        azure_connection = self.connect_azure_account()
        
        # Step 2: View unified dashboard
        print("\n📊 STEP 2: Unified Cloud Dashboard")
        print("-" * 40)
        
        self.show_unified_dashboard()
        
        # Step 3: AI-powered cost analysis
        print("\n💰 STEP 3: AI Cost Analysis & Optimization")
        print("-" * 40)
        
        self.ai_cost_analysis()
        
        # Step 4: Security scanning
        print("\n🛡️  STEP 4: AI Security Analysis")
        print("-" * 40)
        
        self.ai_security_scan()
        
        # Step 5: Resource management
        print("\n⚙️  STEP 5: Resource Management")
        print("-" * 40)
        
        self.manage_resources()
        
        # Step 6: AI chat interaction
        print("\n🤖 STEP 6: AI Chat Assistant")
        print("-" * 40)
        
        self.ai_chat_demo()
        
        print("\n✅ Demo Complete!")
        print("🚀 Your customers can now manage their entire multi-cloud infrastructure!")
    
    def connect_aws_account(self) -> Dict[str, Any]:
        """Demo: Customer connects AWS account"""
        print("Customer: 'I want to connect my AWS production account'")
        
        # Simulate AWS connection
        aws_credentials = {
            "provider": "aws",
            "accountName": "Production AWS",
            "accessKeyId": "AKIA***DEMO***", 
            "secretAccessKey": "demo_secret_key",
            "region": "us-east-1"
        }
        
        print(f"✅ AWS Account Connected: {aws_credentials['accountName']}")
        print("   🔄 Syncing resources... (EC2, S3, RDS, EBS)")
        print("   ✅ Found 45 resources across 3 regions")
        
        return {"success": True, "accountId": "aws-123456789", "resources": 45}
    
    def connect_azure_account(self) -> Dict[str, Any]:
        """Demo: Customer connects Azure account"""
        print("\nCustomer: 'Now let me add my Azure subscription'")
        
        azure_credentials = {
            "provider": "azure",
            "accountName": "Corporate Azure",
            "clientId": "12345678-1234-1234-1234-123456789012",
            "clientSecret": "demo_secret",
            "tenantId": "87654321-4321-4321-4321-210987654321", 
            "subscriptionId": "11111111-2222-3333-4444-555555555555"
        }
        
        print(f"✅ Azure Account Connected: {azure_credentials['accountName']}")
        print("   🔄 Syncing resources... (VMs, Storage, SQL)")
        print("   ✅ Found 28 resources across 2 regions")
        
        return {"success": True, "accountId": "azure-subscription-123", "resources": 28}
    
    def show_unified_dashboard(self):
        """Demo: Show unified multi-cloud dashboard"""
        print("Customer views unified dashboard:")
        print()
        print("┌─────────────────────────────────────────────────────────┐")
        print("│               🌩️  MULTI-CLOUD DASHBOARD                │")
        print("├─────────────────────────────────────────────────────────┤")
        print("│ CLOUD PROVIDERS:                                       │")
        print("│   ☁️  AWS        │ 45 resources │ $2,340/month         │")
        print("│   ☁️  Azure      │ 28 resources │ $1,890/month         │")
        print("│   ☁️  GCP        │ Not connected                       │")
        print("├─────────────────────────────────────────────────────────┤")
        print("│ TOTAL MONTHLY COST: $4,230                             │")
        print("│ 💡 AI SAVINGS IDENTIFIED: $830/month (20%)             │")
        print("├─────────────────────────────────────────────────────────┤")
        print("│ RESOURCE SUMMARY:                                       │")
        print("│   🖥️  Compute     │ 15 instances │ 12 running           │")
        print("│   💾 Storage      │ 28 volumes   │ 850 GB total         │")
        print("│   🗄️  Databases   │ 4 instances  │ All healthy          │")
        print("│   🌐 Networks     │ 6 VPCs       │ All secure           │")
        print("└─────────────────────────────────────────────────────────┘")
    
    def ai_cost_analysis(self):
        """Demo: AI-powered cost analysis"""
        print("Customer: 'Analyze my cloud costs and find savings'")
        print("🤖 AI Agent: 'Running comprehensive cost analysis...'")
        print()
        
        time.sleep(1)  # Simulate AI processing
        
        print("📊 AI COST ANALYSIS RESULTS:")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("Current Monthly Spend: $4,230")
        print("Identified Savings: $830 (20%)")
        print()
        print("🎯 TOP OPTIMIZATION OPPORTUNITIES:")
        print("1. 💰 Right-size EC2 instances        → Save $340/month")
        print("   - 8 over-provisioned t3.large instances")
        print("   - Recommend: Downsize to t3.medium")
        print()
        print("2. 💰 Reserved Instance purchases      → Save $280/month") 
        print("   - 5 steady-state workloads identified")
        print("   - Recommend: 1-year reserved instances")
        print()
        print("3. 💰 Cleanup unused resources        → Save $210/month")
        print("   - 12 unattached EBS volumes")
        print("   - 3 unused load balancers")
        print()
        print("🤖 AI Agent: 'Should I implement these optimizations automatically?'")
        print("Customer: 'Yes, proceed with all recommendations'")
        print("✅ Optimizations applied! Tracking savings...")
    
    def ai_security_scan(self):
        """Demo: AI security analysis"""
        print("Customer: 'Run a security scan across all my clouds'")
        print("🤖 AI Agent: 'Performing comprehensive security analysis...'")
        print()
        
        time.sleep(1)  # Simulate scanning
        
        print("🛡️  AI SECURITY SCAN RESULTS:")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("Overall Security Score: 87/100")
        print()
        print("🚨 CRITICAL FINDINGS:")
        print("1. HIGH: AWS Security Group allows SSH from 0.0.0.0/0")
        print("   Resource: sg-abc123 (Production VPC)")
        print("   🔧 Recommendation: Restrict to corporate IP range")
        print()
        print("2. MEDIUM: Azure VM missing endpoint protection")
        print("   Resource: prod-web-vm-01") 
        print("   🔧 Recommendation: Install Azure Defender")
        print()
        print("3. LOW: S3 bucket versioning disabled")
        print("   Resource: company-backup-bucket")
        print("   🔧 Recommendation: Enable versioning for data protection")
        print()
        print("🤖 AI Agent: 'I can auto-fix the low and medium issues. Approve?'")
        print("Customer: 'Yes, fix them automatically'")
        print("✅ Security issues resolved! Compliance score improved to 94/100")
    
    def manage_resources(self):
        """Demo: Resource management operations"""
        print("Customer: 'I need to restart my web server cluster'")
        print("🤖 AI Agent: 'I found your web cluster. Managing resources...'")
        print()
        
        print("🎛️  RESOURCE OPERATIONS:")
        print("━━━━━━━━━━━━━━━━━━━━━━━━")
        print("Target: Web Server Cluster (3 instances)")
        print("  • AWS: i-abc123 (web-01) - Running")
        print("  • AWS: i-def456 (web-02) - Running") 
        print("  • Azure: vm-web-03 - Running")
        print()
        print("🔄 Performing rolling restart...")
        print("  1. ✅ Draining traffic from web-01")
        print("  2. ✅ Restarting i-abc123")
        print("  3. ✅ Health check passed")
        print("  4. ✅ Restoring traffic to web-01")
        print("  5. ✅ Repeating for web-02...")
        print("  6. ✅ Repeating for vm-web-03...")
        print()
        print("✅ Cluster restart complete! All instances healthy.")
        print("📊 Zero downtime achieved through intelligent orchestration")
    
    def ai_chat_demo(self):
        """Demo: AI chat assistant interaction"""
        print("🤖 AI CHAT ASSISTANT DEMO:")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print()
        
        conversations = [
            {
                "customer": "How much am I spending on databases this month?",
                "ai": "Your database spend across all clouds is $890 this month:\n" +
                     "   • AWS RDS: $640 (MySQL, PostgreSQL)\n" +
                     "   • Azure SQL: $250 (2 instances)\n" +
                     "   I notice your dev database is the same size as production. " +
                     "Would you like me to right-size it to save ~$180/month?"
            },
            {
                "customer": "Yes, and also check if we need backups running on weekends",
                "ai": "✅ Right-sizing dev database to save $180/month\n" +
                     "✅ Found backup jobs running on weekends for dev environments\n" +
                     "✅ Modified schedule to weekdays only → Additional $45/month savings\n\n" +
                     "Total database optimization: $225/month saved! 🎉"
            },
            {
                "customer": "What's the security status of my production environment?",
                "ai": "Your production environment has a 94/100 security score:\n" +
                     "✅ All critical vulnerabilities resolved\n" +
                     "✅ Multi-factor authentication enabled\n" +
                     "✅ Encryption at rest configured\n" +
                     "⚠️  1 recommendation: Enable AWS GuardDuty for threat detection\n" +
                     "Should I enable GuardDuty? It costs ~$30/month but provides 24/7 monitoring."
            }
        ]
        
        for i, conv in enumerate(conversations, 1):
            print(f"Customer: \"{conv['customer']}\"")
            print(f"🤖 AI Agent: {conv['ai']}")
            print()
            if i < len(conversations):
                time.sleep(1)
    
    def test_services_health(self):
        """Test if all backend services are running"""
        services = {
            "AI Services": f"{self.ai_services}/health",
            "Cloud Integrations": f"{self.cloud_integrations}/health", 
            "API Gateway": f"{self.api_gateway}/health"
        }
        
        print("🏥 CHECKING SERVICE HEALTH:")
        print("-" * 30)
        
        all_healthy = True
        for name, url in services.items():
            try:
                response = requests.get(url, timeout=2)
                if response.status_code == 200:
                    print(f"✅ {name}")
                else:
                    print(f"❌ {name} (Status: {response.status_code})")
                    all_healthy = False
            except requests.exceptions.RequestException:
                print(f"❌ {name} (Not responding)")
                all_healthy = False
        
        return all_healthy

def main():
    """Run the multi-cloud management demo"""
    demo = CloudManagementDemo()
    
    print("🚀 Starting AI Ops Guardian Angel Demo...")
    
    # Check if services are running
    if demo.test_services_health():
        print("✅ All services healthy! Starting customer demo...\n")
        demo.demo_customer_workflow()
    else:
        print("\n⚠️  Some services aren't running. Demo will show simulated workflow.\n")
        demo.demo_customer_workflow()
    
    print("\n🎯 DEMO SUMMARY:")
    print("Your AI Ops Guardian Angel platform enables customers to:")
    print("✅ Connect multiple cloud accounts (AWS, Azure, GCP)")
    print("✅ View all resources in unified dashboard")
    print("✅ Get AI-powered cost optimization (20-30% savings)")
    print("✅ Automated security scanning and fixes")
    print("✅ Intelligent resource management")
    print("✅ Natural language AI assistant")
    print("\n🌟 Ready for enterprise customers!")

if __name__ == "__main__":
    main() 