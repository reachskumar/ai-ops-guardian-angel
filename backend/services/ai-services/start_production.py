#!/usr/bin/env python3
"""
🚀 Production Startup Script
Launch AI Ops Guardian Angel with Simple Authentication
"""

import sys
import os
import subprocess
from pathlib import Path

def main():
    print("🚀 AI Ops Guardian Angel - Production Startup")
    print("🔐 Simple Authentication Version")
    print("="*60)
    
    # Get the current directory
    current_dir = Path(__file__).parent
    src_dir = current_dir / "src"
    
    # Check if src directory exists
    if not src_dir.exists():
        print(f"❌ Source directory not found: {src_dir}")
        sys.exit(1)
    
    # Change to src directory
    os.chdir(src_dir)
    
    # Add src to Python path
    sys.path.insert(0, str(src_dir))
    
    print(f"📁 Working directory: {src_dir}")
    print("🔧 Loading production authentication system...")
    
    try:
        # Import and run the main application
        print("🔐 Initializing simple authentication...")
        print("🤖 Loading AI agents...")
        print("🌐 Starting production server...")
        
        # Import the main application
        from main_simple_auth import app
        import uvicorn
        
        print("")
        print("✅ Production system ready!")
        print("📋 Features enabled:")
        print("   🔐 JWT Authentication")
        print("   👥 User Registration/Login")
        print("   🛡️ Role-based Access Control")
        print("   ⚡ Rate Limiting")
        print("   🔒 Secure API Endpoints")
        print("")
        print("🎯 Demo Credentials:")
        print("   Admin: admin@demo.com / Admin123!")
        print("   User:  user@demo.com / User123!")
        print("")
        print("🌐 Server starting on http://localhost:8001")
        print("📚 API Documentation: http://localhost:8001/docs")
        print("🔐 Authentication: http://localhost:8001/auth/login")
        print("")
        
        # Start the server
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8001,
            log_level="info",
            access_log=True
        )
        
    except Exception as e:
        print(f"❌ Startup error: {e}")
        print("🔍 Check dependencies: pip install -r requirements-simple.txt")
        sys.exit(1)

if __name__ == "__main__":
    main() 