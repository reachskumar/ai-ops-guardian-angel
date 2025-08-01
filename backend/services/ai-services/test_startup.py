#!/usr/bin/env python3
"""
Simple startup test for AI Services
Tests agent initialization and basic functionality
"""

import asyncio
import sys
import os

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

async def test_agent_imports():
    """Test that all agents can be imported successfully"""
    print("🧪 Testing agent imports...")
    
    try:
        # Test core agents
        from agents.core.cost_optimization_agent import CostOptimizationAgent
        from agents.core.security_analysis_agent import SecurityAnalysisAgent
        from agents.core.infrastructure_agent import InfrastructureAgent
        from agents.core.devops_agent import DevOpsAgent
        print("✅ Core agents imported successfully")
        
        # Test advanced agents
        from agents.advanced.code_generation_agent import CodeGenerationAgent
        from agents.advanced.predictive_agent import PredictiveAgent
        print("✅ Advanced agents imported successfully")
        
        # Test MLOps agents
        from agents.mlops.model_training_agent import ModelTrainingAgent
        from agents.mlops.data_pipeline_agent import DataPipelineAgent
        from agents.mlops.model_monitoring_agent import ModelMonitoringAgent
        print("✅ MLOps agents imported successfully")
        
        # Test DevOps agents
        from agents.advanced_devops.docker_agent import DockerAgent
        from agents.advanced_devops.kubernetes_agent import KubernetesAgent
        print("✅ Advanced DevOps agents imported successfully")
        
        # Test specialized agents
        from agents.specialized_devops.artifact_management_agent import ArtifactManagementAgent
        from agents.specialized_devops.performance_testing_agent import PerformanceTestingAgent
        print("✅ Specialized DevOps agents imported successfully")
        
        return True
        
    except Exception as e:
        print(f"❌ Agent import failed: {e}")
        return False

async def test_chat_agent():
    """Test the DevOps chat agent"""
    print("🧪 Testing DevOps chat agent...")
    
    try:
        from agents.chat.devops_chat_agent import DevOpsChatAgent
        
        chat_agent = DevOpsChatAgent()
        print("✅ DevOps chat agent created successfully")
        return True
        
    except Exception as e:
        print(f"❌ Chat agent test failed: {e}")
        return False

async def test_orchestrator():
    """Test the agent orchestrator"""
    print("🧪 Testing agent orchestrator...")
    
    try:
        from orchestrator.agent_orchestrator import AgentOrchestrator
        
        orchestrator = AgentOrchestrator()
        print("✅ Agent orchestrator created successfully")
        return True
        
    except Exception as e:
        print(f"❌ Orchestrator test failed: {e}")
        return False

async def test_basic_functionality():
    """Test basic agent functionality without starting services"""
    print("🧪 Testing basic agent functionality...")
    
    try:
        from agents.core.cost_optimization_agent import CostOptimizationAgent
        from config.settings import AgentType
        
        # Create a cost optimization agent
        agent = CostOptimizationAgent()
        
        # Check basic properties
        assert agent.agent_type == AgentType.COST_OPTIMIZATION
        assert agent.name is not None
        assert agent.description is not None
        assert agent.id is not None
        
        print("✅ Basic agent functionality test passed")
        return True
        
    except Exception as e:
        print(f"❌ Basic functionality test failed: {e}")
        return False

async def main():
    """Run all tests"""
    print("🚀 Starting AI Services Setup Tests")
    print("=" * 50)
    
    tests = [
        test_agent_imports,
        test_chat_agent,
        test_orchestrator,
        test_basic_functionality
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            result = await test()
            if result:
                passed += 1
            print()
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {e}")
            print()
    
    print("=" * 50)
    print(f"🏁 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! AI Services setup is ready!")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main()) 