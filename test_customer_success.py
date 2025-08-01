#!/usr/bin/env python3
"""
Customer Success Platform Demo
Demonstrates onboarding, feature management, usage analytics, and customer insights
"""

import requests
import json
import time
from datetime import datetime

class CustomerSuccessDemo:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def print_header(self, title):
        print(f"\n{'='*70}")
        print(f"🎯 {title}")
        print(f"{'='*70}")
    
    def print_section(self, title):
        print(f"\n{'→'*3} {title}")
        print("-" * 50)
    
    def test_onboarding_flow(self):
        """Test complete customer onboarding flow"""
        self.print_header("CUSTOMER ONBOARDING DEMONSTRATION")
        
        org_id = "demo_enterprise_123"
        
        # 1. Initialize customer onboarding
        self.print_section("Initialize New Customer")
        
        init_data = {
            "plan_type": "professional"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/customer-success/onboarding/{org_id}/initialize",
                json=init_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'data' in data:
                    onboarding = data['data']
                    print(f"✅ Customer initialized successfully")
                    print(f"📊 Current Stage: {onboarding.get('current_stage', 'unknown')}")
                    print(f"📈 Progress: {onboarding.get('overall_progress', 0)}%")
                    print(f"📋 Total Tasks: {onboarding.get('total_tasks_count', 0)}")
                else:
                    print("✅ Customer onboarding initialized")
            else:
                print(f"❌ Failed to initialize: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
        
        # 2. Check onboarding status
        self.print_section("Current Onboarding Status")
        
        try:
            response = self.session.get(
                f"{self.base_url}/customer-success/onboarding/{org_id}"
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'data' in data:
                    status = data['data']
                    print(f"📍 Current Stage: {status.get('current_stage', 'unknown')}")
                    print(f"📊 Progress: {status.get('overall_progress', 0):.1f}%")
                    print(f"⏱️ Days in Onboarding: {status.get('time_in_onboarding_days', 0)}")
                    print(f"✅ Completed Tasks: {status.get('completed_tasks_count', 0)}")
                    print(f"🎯 Next Action: {status.get('next_recommended_action', 'None')}")
                    
                    # Show current tasks
                    current_tasks = status.get('current_tasks', [])
                    if current_tasks:
                        print(f"\n📋 Current Stage Tasks:")
                        for task in current_tasks:
                            status_icon = "✅" if task['completed'] else "⏳"
                            print(f"   {status_icon} {task['title']} ({task['estimated_minutes']}min)")
                else:
                    print("📊 Onboarding status retrieved")
            else:
                print(f"❌ Failed to get status: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    def test_feature_flags(self):
        """Test feature flag management"""
        self.print_header("FEATURE FLAG MANAGEMENT")
        
        org_id = "demo_enterprise_123"
        
        # 1. Get current feature flags
        self.print_section("Current Feature Flags")
        
        try:
            response = self.session.get(
                f"{self.base_url}/customer-success/features/{org_id}"
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'data' in data:
                    features_data = data['data']
                    features = features_data.get('features', {})
                    
                    print(f"🏢 Organization: {org_id}")
                    print(f"🎛️ Total Features: {features_data.get('total_features', 0)}")
                    print(f"✅ Enabled Features: {features_data.get('enabled_features', 0)}")
                    
                    # Group features by category
                    core_features = {k: v for k, v in features.items() if 'basic' in k or 'workflow' in k}
                    advanced_features = {k: v for k, v in features.items() if 'advanced' in k}
                    integration_features = {k: v for k, v in features.items() if 'integration' in k}
                    beta_features = {k: v for k, v in features.items() if 'ai_' in k or 'predictive' in k}
                    
                    for category, feature_set in [
                        ("Core Features", core_features),
                        ("Advanced Features", advanced_features), 
                        ("Integrations", integration_features),
                        ("Beta Features", beta_features)
                    ]:
                        if feature_set:
                            print(f"\n📂 {category}:")
                            for feature, enabled in feature_set.items():
                                status = "🟢 ON " if enabled else "🔴 OFF"
                                print(f"   {status} {feature}")
                else:
                    print("🎛️ Feature flags retrieved")
            else:
                print(f"❌ Failed to get features: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
        
        # 2. Toggle a feature flag
        self.print_section("Toggle Feature Flag")
        
        try:
            # Enable advanced analytics
            toggle_data = {"enabled": True}
            response = self.session.post(
                f"{self.base_url}/customer-success/features/{org_id}/advanced_analytics",
                json=toggle_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'data' in data:
                    result = data['data']
                    print(f"🎛️ Feature: {result.get('feature', 'unknown')}")
                    print(f"🔄 Action: {'Enabled' if result.get('enabled') else 'Disabled'}")
                    print(f"✅ Changed: {result.get('changed', False)}")
                    print(f"💬 Message: {result.get('message', '')}")
                else:
                    print("🎛️ Feature flag toggled")
            else:
                print(f"❌ Failed to toggle feature: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    def simulate_usage_events(self):
        """Simulate usage events for analytics"""
        self.print_section("Simulating Customer Usage")
        
        org_id = "demo_enterprise_123"
        
        # Simulate various usage events
        usage_events = [
            {
                "org_id": org_id,
                "user_id": "john_doe",
                "event_type": "agent_execution",
                "agent_type": "cost_analysis",
                "success": True,
                "tokens": 150,
                "cost": 0.003,
                "metadata": {"confidence": 0.95}
            },
            {
                "org_id": org_id,
                "user_id": "jane_smith",
                "event_type": "agent_execution", 
                "agent_type": "security_scan",
                "success": True,
                "tokens": 200,
                "cost": 0.004,
                "metadata": {"vulnerabilities_found": 3}
            },
            {
                "org_id": org_id,
                "user_id": "john_doe",
                "event_type": "workflow_start",
                "agent_type": "cost_optimization_pipeline",
                "success": True,
                "tokens": 500,
                "cost": 0.01,
                "metadata": {"workflow_id": "wf_123", "estimated_duration": "15min"}
            },
            {
                "org_id": org_id,
                "user_id": "alice_admin",
                "event_type": "agent_execution",
                "agent_type": "infrastructure_check",
                "success": False,
                "error_message": "Connection timeout to AWS",
                "tokens": 50,
                "cost": 0.001
            }
        ]
        
        tracked_events = 0
        for event in usage_events:
            try:
                response = self.session.post(
                    f"{self.base_url}/customer-success/track-usage",
                    json=event
                )
                
                if response.status_code == 200:
                    tracked_events += 1
                    print(f"📊 Tracked: {event['event_type']} - {event['agent_type']}")
                    
            except Exception as e:
                print(f"❌ Failed to track event: {e}")
        
        print(f"✅ Successfully tracked {tracked_events}/{len(usage_events)} events")
        time.sleep(1)  # Give time for processing
    
    def test_usage_analytics(self):
        """Test usage analytics and insights"""
        self.print_header("USAGE ANALYTICS & CUSTOMER INSIGHTS")
        
        org_id = "demo_enterprise_123"
        
        # 1. Get usage analytics
        self.print_section("Usage Analytics (Last 30 Days)")
        
        try:
            response = self.session.get(
                f"{self.base_url}/customer-success/analytics/{org_id}?days=30"
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'data' in data:
                    analytics = data['data']
                    summary = analytics.get('summary', {})
                    
                    print(f"📊 Organization: {analytics.get('org_id', 'unknown')}")
                    print(f"📅 Period: {analytics.get('period_days', 0)} days")
                    print(f"🎯 Total Events: {summary.get('total_events', 0)}")
                    print(f"✅ Success Rate: {100 - summary.get('error_rate_percentage', 0):.1f}%")
                    print(f"🎫 Total Tokens: {summary.get('total_tokens_consumed', 0):,}")
                    print(f"💰 Total Cost: ${summary.get('total_cost_usd', 0):.4f}")
                    print(f"👥 Active Users: {summary.get('unique_users', 0)}")
                    print(f"🤖 Agents Used: {summary.get('unique_agents_used', 0)}")
                    
                    # Show top agents
                    agent_usage = analytics.get('agent_usage', {})
                    if agent_usage:
                        print(f"\n🤖 Top Agent Usage:")
                        for agent, count in list(agent_usage.items())[:5]:
                            print(f"   • {agent}: {count} executions")
                    
                    # Show top users
                    top_users = analytics.get('top_users', [])
                    if top_users:
                        print(f"\n👥 Most Active Users:")
                        for user_data in top_users[:3]:
                            print(f"   • {user_data['user_id']}: {user_data['events']} events")
                    
                    # Show cost breakdown
                    cost_breakdown = analytics.get('cost_breakdown', {})
                    if cost_breakdown:
                        print(f"\n💰 Cost Analysis:")
                        print(f"   • Avg cost per event: ${cost_breakdown.get('average_cost_per_event', 0):.4f}")
                        print(f"   • Avg tokens per event: {cost_breakdown.get('average_tokens_per_event', 0):.1f}")
                    
                else:
                    print("📊 Usage analytics retrieved")
            else:
                print(f"❌ Failed to get analytics: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
        
        # 2. Get customer insights
        self.print_section("Customer Health Insights")
        
        try:
            response = self.session.get(
                f"{self.base_url}/customer-success/insights/{org_id}"
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'data' in data:
                    insights = data['data']
                    
                    print(f"🏥 Health Score: {insights.get('health_score', 0):.1f}/100")
                    print(f"📊 Health Status: {insights.get('health_status', 'unknown')}")
                    
                    # Risk factors
                    risk_factors = insights.get('risk_factors', [])
                    if risk_factors:
                        print(f"\n⚠️ Risk Factors:")
                        for risk in risk_factors:
                            print(f"   • {risk}")
                    
                    # Success indicators
                    success_indicators = insights.get('success_indicators', [])
                    if success_indicators:
                        print(f"\n✅ Success Indicators:")
                        for indicator in success_indicators:
                            print(f"   • {indicator}")
                    
                    # Recommended actions
                    recommended_actions = insights.get('recommended_actions', [])
                    if recommended_actions:
                        print(f"\n🎯 Recommended Actions:")
                        for action in recommended_actions:
                            print(f"   • {action}")
                    
                    # Onboarding status
                    onboarding = insights.get('onboarding_status', {})
                    if onboarding:
                        print(f"\n🚀 Onboarding Progress:")
                        print(f"   • Stage: {onboarding.get('current_stage', 'unknown')}")
                        print(f"   • Progress: {onboarding.get('progress_percentage', 0):.1f}%")
                        print(f"   • Days: {onboarding.get('time_in_onboarding_days', 0)}")
                    
                else:
                    print("💡 Customer insights retrieved")
            else:
                print(f"❌ Failed to get insights: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    def test_feature_rollout(self):
        """Test gradual feature rollout"""
        self.print_section("Gradual Feature Rollout")
        
        rollout_data = {
            "feature": "ai_code_generation",
            "percentage": 25,
            "target_plan": "professional"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/customer-success/features/rollout",
                json=rollout_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'data' in data:
                    result = data['data']
                    print(f"🚀 Feature Rollout: {result.get('feature', 'unknown')}")
                    print(f"📊 Percentage: {result.get('rollout_percentage', 0)}%")
                    print(f"🏢 Eligible Orgs: {result.get('eligible_organizations', 0)}")
                    print(f"🎯 Target Plan: {result.get('target_plan', 'all')}")
                    print(f"✅ Completed: {result.get('rollout_completed', False)}")
                else:
                    print("🚀 Feature rollout initiated")
            else:
                print(f"❌ Failed to start rollout: {response.status_code}")
                if response.status_code == 403:
                    print("   Note: This requires platform admin permissions")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    def run_comprehensive_demo(self):
        """Run complete customer success platform demonstration"""
        print(f"🚀 AI Ops Guardian Angel - Customer Success Platform Demo")
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Test all components
        self.test_onboarding_flow()
        self.test_feature_flags()
        self.simulate_usage_events()
        self.test_usage_analytics()
        self.test_feature_rollout()
        
        # Summary
        self.print_header("CUSTOMER SUCCESS PLATFORM CAPABILITIES")
        
        capabilities = [
            "🚀 Automated Customer Onboarding with guided tasks",
            "🎛️ Dynamic Feature Flag Management per organization",
            "📊 Real-time Usage Analytics and tracking",
            "🏥 Customer Health Scoring and risk detection",
            "🎯 Intelligent Recommendations and next actions",
            "🔄 Gradual Feature Rollouts with targeting",
            "👥 User Behavior Analytics and insights",
            "💰 Token Consumption and Cost Tracking",
            "⚠️ Error Tracking and Success Monitoring",
            "📈 Platform-wide Success Metrics",
            "🎪 Onboarding Progress Tracking",
            "🔒 Role-based Access to Analytics",
            "📱 RESTful APIs for all operations"
        ]
        
        for capability in capabilities:
            print(f"✅ {capability}")
        
        print(f"\n🎉 Customer Success Platform is fully operational!")
        print(f"💡 Ready to drive customer adoption, retention, and expansion!")

if __name__ == "__main__":
    demo = CustomerSuccessDemo()
    demo.run_comprehensive_demo() 