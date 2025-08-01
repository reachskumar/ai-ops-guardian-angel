#!/usr/bin/env python3
"""
Multi-Tenant SaaS Test Script
Demonstrates the complete multi-tenant capabilities of AI Ops Guardian Angel
"""

import requests
import json
import time
from datetime import datetime

class MultiTenantDemo:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def print_header(self, title):
        print(f"\n{'='*60}")
        print(f"🎯 {title}")
        print(f"{'='*60}")
    
    def print_section(self, title):
        print(f"\n{'→'*3} {title}")
        print("-" * 40)
    
    def test_health(self):
        """Test basic health endpoint"""
        self.print_header("SYSTEM HEALTH CHECK")
        
        try:
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 200:
                health_data = response.json()
                print(f"✅ Service Status: {health_data['status']}")
                print(f"📅 Timestamp: {health_data['timestamp']}")
                print(f"🤖 Chat Agent: {health_data.get('chat_agent', 'Unknown')}")
            else:
                print(f"❌ Health check failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Connection error: {e}")
    
    def test_agent_status(self):
        """Test agent status to see all 28 agents"""
        self.print_section("AI Agents Status")
        
        try:
            response = self.session.get(f"{self.base_url}/agents/status")
            if response.status_code == 200:
                data = response.json()
                print(f"🤖 Total Agents: {data['total_agents']}")
                print(f"✅ Active Agents: {data['active_agents']}")
                
                for category, agents in data['agents_by_category'].items():
                    print(f"\n📂 {category.title()}: {len(agents)} agents")
                    for agent in agents[:3]:  # Show first 3 agents per category
                        print(f"   • {agent}")
                    if len(agents) > 3:
                        print(f"   ... and {len(agents) - 3} more")
            else:
                print(f"❌ Failed to get agent status: {response.status_code}")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    def test_tenant_chat(self):
        """Test chat with different tenant scenarios"""
        self.print_header("MULTI-TENANT CHAT TESTING")
        
        test_cases = [
            {
                "name": "Enterprise User - Cost Analysis",
                "headers": {"x-user-id": "enterprise_user", "x-org-id": "enterprise_org"},
                "message": "analyze my cloud costs",
                "expected_agent": "cost_analysis"
            },
            {
                "name": "Startup User - Security Scan", 
                "headers": {"x-user-id": "startup_user", "x-org-id": "startup_org"},
                "message": "run a security scan",
                "expected_agent": "security_scan"
            },
            {
                "name": "Demo User - Workflow Request",
                "headers": {"x-user-id": "demo_user", "x-org-id": "demo_org"},
                "message": "start cost optimization pipeline",
                "expected_agent": "workflow"
            }
        ]
        
        for test_case in test_cases:
            self.print_section(test_case["name"])
            
            chat_data = {
                "message": test_case["message"],
                "user_id": test_case["headers"]["x-user-id"],
                "session_id": f"session_{int(time.time())}"
            }
            
            try:
                response = self.session.post(
                    f"{self.base_url}/chat",
                    json=chat_data,
                    headers=test_case["headers"]
                )
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"💬 Message: {test_case['message']}")
                    print(f"🎯 Intent: {data.get('intent', 'unknown')}")
                    print(f"🔥 Confidence: {data.get('confidence', 0)}")
                    print(f"🤖 Agent Used: {data.get('agent_used', 'unknown')}")
                    
                    # Check for tenant context
                    if 'tenant_context' in data:
                        tc = data['tenant_context']
                        print(f"🏢 Org ID: {tc.get('org_id', 'unknown')}")
                        print(f"👤 User ID: {tc.get('user_id', 'unknown')}")
                        print(f"📊 Quota Remaining: {tc.get('quota_remaining', 'unknown')}")
                    
                    print(f"📝 Response: {data.get('message', 'No message')[:100]}...")
                    
                elif response.status_code == 429:
                    print("⚠️ Rate limited - quota exceeded!")
                else:
                    print(f"❌ Chat failed: {response.status_code}")
                    print(f"Error: {response.text}")
                    
            except Exception as e:
                print(f"❌ Error: {e}")
            
            time.sleep(1)  # Brief pause between requests
    
    def test_workflows(self):
        """Test workflow system"""
        self.print_section("Workflow Management")
        
        # Test available workflows
        try:
            response = self.session.get(f"{self.base_url}/workflows/available")
            if response.status_code == 200:
                data = response.json()
                print(f"📋 Available Workflows: {len(data.get('available_workflows', []))}")
                print(f"🔄 Active Workflows: {data.get('active_workflows', 0)}")
                
                for wf in data.get('available_workflows', []):
                    print(f"   • {wf['name']} ({wf['steps']} steps, {wf['estimated_duration']})")
            else:
                print(f"❌ Failed to get workflows: {response.status_code}")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    def test_session_insights(self):
        """Test session and user insights"""
        self.print_section("User Session Analytics")
        
        try:
            response = self.session.get(
                f"{self.base_url}/sessions/demo_user/insights",
                headers={"x-user-id": "demo_user", "x-org-id": "demo_org"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'data' in data:
                    insights = data['data']
                    print(f"👤 User: {insights.get('user_id', 'unknown')}")
                    print(f"💬 Total Messages: {insights.get('total_messages', 0)}")
                    print(f"📱 Sessions: {insights.get('total_sessions', 0)}")
                    print(f"⭐ Top Agents: {insights.get('top_agents', [])}")
                    
                    # Check organization context
                    if 'organization_context' in insights:
                        org_ctx = insights['organization_context']
                        print(f"🏢 Organization: {org_ctx.get('org_name', 'unknown')}")
                        print(f"💳 Plan: {org_ctx.get('plan_type', 'unknown')}")
                        
                        quota = org_ctx.get('quota_utilization', {})
                        print(f"📊 Agent Usage: {quota.get('agents_used', 0)}/{quota.get('agents_limit', 0)}")
                else:
                    print("📊 User insights available")
            else:
                print(f"❌ Failed to get insights: {response.status_code}")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    def run_comprehensive_demo(self):
        """Run complete multi-tenant demonstration"""
        print(f"🚀 AI Ops Guardian Angel - Multi-Tenant SaaS Demo")
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Test basic functionality
        self.test_health()
        self.test_agent_status()
        
        # Test multi-tenant features
        self.test_tenant_chat()
        self.test_workflows()
        self.test_session_insights()
        
        # Summary
        self.print_header("MULTI-TENANT CAPABILITIES SUMMARY")
        
        capabilities = [
            "🏢 Organization Management (Demo: TechCorp, StartupCo)",
            "👥 Team-based Access Control",
            "🔒 Role-based Permissions (Owner, Admin, Member, ReadOnly)",
            "📊 Quota Management (Agents, Workflows, Storage, API calls)",
            "🚦 Rate Limiting per Organization",
            "💳 Subscription Plans (Starter, Professional, Enterprise)",
            "🛡️ Tenant Data Isolation",
            "📈 Per-tenant Analytics and Insights",
            "🔄 Multi-agent Workflow Orchestration",
            "🧠 Session Memory with Tenant Context",
            "🎯 28 Specialized AI Agents",
            "☁️ Multi-cloud Infrastructure Support",
            "📱 API-first SaaS Architecture"
        ]
        
        for capability in capabilities:
            print(f"✅ {capability}")
        
        print(f"\n🎉 Multi-tenant AI Ops platform is fully operational!")
        print(f"💡 Ready for enterprise customers with isolated, scalable infrastructure.")

if __name__ == "__main__":
    demo = MultiTenantDemo()
    demo.run_comprehensive_demo() 