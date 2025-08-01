#!/usr/bin/env python3
"""
Test script for AI service
"""

import os
import sys
from pathlib import Path

# Add the src directory to Python path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

# Set environment variables
os.environ["OPENAI_API_KEY"] = "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"

try:
    from main import app
    print("✅ AI service imports successfully")
    
    # Test a simple endpoint
    import uvicorn
    print("🚀 Starting AI service on port 8001...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=False,
        log_level="info"
    )
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc() 