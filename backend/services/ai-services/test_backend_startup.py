#!/usr/bin/env python3
"""
Test script to verify backend startup without requiring API keys
"""

import sys
import os
from pathlib import Path

# Add the src directory to Python path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

def test_backend_startup():
    """Test backend startup without API keys"""
    print("🧪 Testing backend startup...")
    
    try:
        # Set a dummy API key for testing
        os.environ['OPENAI_API_KEY'] = 'test_key_for_startup'
        
        # Test basic imports
        print("✅ Testing basic imports...")
        from main import app
        print("✅ FastAPI app imported successfully")
        
        # Test DevOps Chat Agent creation (without API calls)
        print("✅ Testing DevOps Chat Agent creation...")
        from agents.chat.devops_chat_agent import DevOpsChatAgent
        print("✅ DevOpsChatAgent class imported successfully")
        
        # Test config
        print("✅ Testing configuration...")
        from config.settings import settings, AgentType
        print("✅ Settings loaded successfully")
        
        print("\n🎉 Backend startup test successful!")
        print("📋 Next steps:")
        print("   1. Set OPENAI_API_KEY environment variable")
        print("   2. Run: python run.py")
        print("   3. Access the API at: http://localhost:8000")
        print("   4. View docs at: http://localhost:8000/docs")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = test_backend_startup()
    sys.exit(0 if success else 1) 