#!/usr/bin/env python3
"""
Simple test script to verify core imports work correctly
"""

import sys
from pathlib import Path

# Add the src directory to Python path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

def test_core_imports():
    """Test core imports without importing all agents"""
    print("🧪 Testing core imports...")
    
    try:
        # Test basic imports
        print("✅ Testing basic imports...")
        from main import app
        print("✅ main.py imported successfully")
        
        # Test agent base class
        print("✅ Testing agent base class...")
        from agents.base_agent import BaseAgent
        print("✅ BaseAgent imported successfully")
        
        # Test config
        print("✅ Testing config...")
        from config.settings import settings, AgentType
        print("✅ Settings imported successfully")
        
        # Test utils
        print("✅ Testing utils...")
        from utils.logging import get_logger
        from utils.metrics import AgentMetrics
        print("✅ Utils imported successfully")
        
        # Test DevOps Chat Agent (the main one we need)
        print("✅ Testing DevOps Chat Agent...")
        from agents.chat.devops_chat_agent import DevOpsChatAgent
        print("✅ DevOpsChatAgent imported successfully")
        
        print("\n🎉 Core imports successful! Backend is ready to run.")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = test_core_imports()
    sys.exit(0 if success else 1) 