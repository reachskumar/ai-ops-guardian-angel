#!/usr/bin/env python3
"""
Simple startup script for AI Services
Handles Python path setup and module imports correctly
"""

import sys
import os
from pathlib import Path

def setup_python_path():
    """Setup Python path for proper module resolution"""
    # Get the ai-services directory
    ai_services_dir = Path(__file__).parent
    src_dir = ai_services_dir / "src"
    
    # Add src directory to Python path if not already there
    if str(src_dir) not in sys.path:
        sys.path.insert(0, str(src_dir))
    
    return src_dir

def main():
    """Main function to start the AI services"""
    print("🚀 Starting AI Ops Guardian Angel - AI Services")
    
    # Setup paths
    src_dir = setup_python_path()
    print(f"📁 Source directory: {src_dir}")
    
    # Change working directory to src
    os.chdir(src_dir)
    
    try:
        # Import main app
        print("🔧 Loading AI agents and services...")
        from main import app
        
        # Start uvicorn
        import uvicorn
        print("🛡️ 28 AI Agents Ready for Infrastructure Optimization")
        print("💬 DevOps Chat Agent Available at /chat")
        print("🏥 Health check: http://localhost:8001/health")
        print("📚 API Documentation: http://localhost:8001/docs")
        
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8001,
            log_level="info"
        )
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("🔍 Please ensure all dependencies are installed:")
        print("   pip install -r requirements-simple.txt")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error starting AI services: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 