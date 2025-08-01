#!/usr/bin/env python3
"""
Test script to verify all imports work correctly
"""

import sys
from pathlib import Path

# Add the src directory to Python path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

def test_imports():
    """Test all critical imports"""
    print("🧪 Testing imports...")
    
    try:
        # Test basic imports
        print("✅ Testing basic imports...")
        from main import app
        print("✅ main.py imported successfully")
        
        # Test agent imports
        print("✅ Testing agent imports...")
        from agents.base_agent import BaseAgent
        print("✅ BaseAgent imported successfully")
        
        from agents.chat.devops_chat_agent import DevOpsChatAgent
        print("✅ DevOpsChatAgent imported successfully")
        
        # Test config imports
        print("✅ Testing config imports...")
        from config.settings import settings, AgentType
        print("✅ Settings imported successfully")
        
        # Test orchestrator imports
        print("✅ Testing orchestrator imports...")
        from orchestrator.agent_orchestrator import AgentOrchestrator
        print("✅ AgentOrchestrator imported successfully")
        
        # Test utils imports
        print("✅ Testing utils imports...")
        from utils.logging import get_logger
        from utils.metrics import AgentMetrics
        print("✅ Utils imported successfully")
        
        print("\n🎉 All imports successful! Backend is ready to run.")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = test_imports()
    sys.exit(0 if success else 1) 