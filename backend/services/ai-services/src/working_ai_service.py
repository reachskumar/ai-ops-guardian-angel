#!/usr/bin/env python3
"""
Simple AI Service for Testing Integration
"""

import json
import time
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading

class SimpleAIHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            response = {
                "status": "healthy",
                "service": "ai-services",
                "timestamp": datetime.now().isoformat(),
                "version": "2.0.0"
            }
            self.wfile.write(json.dumps(response).encode())
            
        elif parsed_path.path == '/agents':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            response = {
                "agents": [
                    {
                        "id": "cost_optimization",
                        "name": "Cost Optimization Agent",
                        "description": "Helps optimize cloud costs and identify savings opportunities",
                        "status": "active"
                    },
                    {
                        "id": "security",
                        "name": "Security Analysis Agent", 
                        "description": "Analyzes security posture and identifies vulnerabilities",
                        "status": "active"
                    },
                    {
                        "id": "infrastructure",
                        "name": "Infrastructure Agent",
                        "description": "Manages and optimizes infrastructure resources",
                        "status": "active"
                    },
                    {
                        "id": "general",
                        "name": "General Assistant",
                        "description": "General AI assistant for cloud operations",
                        "status": "active"
                    }
                ]
            }
            self.wfile.write(json.dumps(response).encode())
            
        elif parsed_path.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            response = {
                "message": "AI Services API",
                "version": "2.0.0",
                "status": "running",
                "endpoints": {
                    "health": "/health",
                    "chat": "/chat",
                    "agents": "/agents"
                }
            }
            self.wfile.write(json.dumps(response).encode())
            
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Not found"}).encode())

    def do_POST(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/chat':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                request_data = json.loads(post_data.decode('utf-8'))
                message = request_data.get('message', 'Hello')
                agent_type = request_data.get('agent_type', 'general')
                
                # Mock AI responses
                mock_responses = {
                    "cost_optimization": {
                        "response": "I can help you optimize your cloud costs! Based on your current usage, I recommend: 1) Right-sizing EC2 instances, 2) Using Reserved Instances for predictable workloads, 3) Implementing auto-scaling policies. Would you like me to analyze your specific resources?",
                        "confidence": 0.95
                    },
                    "security": {
                        "response": "I've detected several security concerns in your infrastructure: 1) Unencrypted S3 buckets, 2) Missing IAM policies, 3) Open security groups. I recommend immediate action on these items. Would you like me to provide specific remediation steps?",
                        "confidence": 0.92
                    },
                    "infrastructure": {
                        "response": "Your infrastructure analysis shows: 1) 15 EC2 instances running, 2) 3 RDS databases, 3) 8 S3 buckets. I can help you optimize resource allocation and improve performance. What specific area would you like to focus on?",
                        "confidence": 0.88
                    },
                    "general": {
                        "response": "Hello! I'm your AI assistant for cloud operations. I can help with cost optimization, security analysis, infrastructure management, and more. How can I assist you today?",
                        "confidence": 0.85
                    }
                }
                
                if agent_type in mock_responses:
                    mock_data = mock_responses[agent_type]
                else:
                    mock_data = mock_responses["general"]
                
                response = {
                    "response": mock_data["response"],
                    "agent_type": agent_type,
                    "timestamp": datetime.now().isoformat(),
                    "confidence": mock_data["confidence"]
                }
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Not found"}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_server():
    server_address = ('', 8001)
    httpd = HTTPServer(server_address, SimpleAIHandler)
    print("🤖 AI Services running on port 8001")
    print("🏥 Health check: http://localhost:8001/health")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server() 