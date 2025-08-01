#!/usr/bin/env python3
"""
AI Ops Guardian Angel - Backend Startup Script
Runs the FastAPI server with proper module imports
"""

import sys
import os
from pathlib import Path

def main():
    """Main startup function"""
    
    # Add the src directory to Python path for module resolution
    src_path = Path(__file__).parent / "src"
    
    print("🚀 Starting InfraMind AI Services...")
    print(f"📁 Source path: {src_path}")
    print("🔧 Loading AI agents and services...")
    
    # Change to src directory and run as module
    os.chdir(src_path)
    
    # Use uvicorn directly to run the main:app 
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    try:
        main()
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("🔍 Checking if all dependencies are installed...")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error starting AI service: {e}")
        sys.exit(1) 