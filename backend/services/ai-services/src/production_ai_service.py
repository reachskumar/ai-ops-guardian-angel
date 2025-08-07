#!/usr/bin/env python3
"""
Production AI Service - Real Agent Integration
Executes actual AWS actions using the AI agents
"""

import http.server
import socketserver
import json
import boto3
import asyncio
import os
from datetime import datetime
from urllib.parse import urlparse
from dotenv import load_dotenv
import sys
import traceback

# Add the src directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

# Import our agents and tools
from tools.cloud.aws_manager import AWSManager
from agents.core.devops_agent import DevOpsAgent
from agents.core.infrastructure_agent import InfrastructureAgent
from agents.core.cost_optimization_agent import CostOptimizationAgent

class ProductionAIService(http.server.BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Initialize AWS manager with credentials from environment
        self.aws_manager = None
        self.devops_agent = None
        self.infrastructure_agent = None
        self.cost_agent = None
        
        try:
            # Initialize AWS manager
            self.aws_manager = AWSManager(
                aws_access_key=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                region=os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
            )
            
            # Initialize agents
            self.devops_agent = DevOpsAgent()
            self.infrastructure_agent = InfrastructureAgent()
            self.cost_agent = CostOptimizationAgent()
            
            print("✅ All agents and AWS manager initialized successfully")
            
        except Exception as e:
            print(f"❌ Error initializing agents: {e}")
            traceback.print_exc()
        
        super().__init__(*args, **kwargs)
    
    def log_message(self, format, *args):
        """Custom logging"""
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'status': 'healthy', 
                'timestamp': datetime.now().isoformat(),
                'agents_loaded': bool(self.devops_agent and self.infrastructure_agent and self.cost_agent),
                'aws_connected': bool(self.aws_manager and self.aws_manager.connected)
            }).encode())
            return
        
        elif parsed_path.path == '/aws/ec2':
            try:
                instances = asyncio.run(self.aws_manager.list_ec2_instances())
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'instances': instances}).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
            return
        
        elif parsed_path.path == '/aws/s3':
            try:
                buckets = asyncio.run(self.aws_manager.list_s3_buckets())
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'buckets': buckets}).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
            return
        
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())
    
    def do_POST(self):
        """Handle POST requests with real agent execution"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/chat':
            try:
                # Read request body
                content_length = int(self.headers.get('Content-Length', 0))
                if content_length > 0:
                    post_data = self.rfile.read(content_length)
                    request_data = json.loads(post_data.decode('utf-8'))
                else:
                    request_data = {}
                
                message = request_data.get('message', '').lower()
                context = request_data.get('context', 'infrastructure_management')
                user_id = request_data.get('user_id', 'anonymous')
                
                # Execute real actions based on message
                ai_response = await self._execute_agent_action(message, context, user_id)
                
                # Send response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
                self.end_headers()
                
                response_data = {
                    "response": ai_response,
                    "timestamp": datetime.now().isoformat(),
                    "context": context,
                    "user_id": user_id,
                    "action_executed": True
                }
                self.wfile.write(json.dumps(response_data).encode())
                
            except Exception as e:
                print(f"Error in chat endpoint: {e}")
                traceback.print_exc()
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": f"AI service error: {str(e)}"}).encode())
        
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())
    
    async def _execute_agent_action(self, message: str, context: str, user_id: str) -> str:
        """Execute real actions using AI agents"""
        
        # EC2 Instance Creation
        if any(keyword in message for keyword in ['create ec2', 'provision ec2', 'new instance', 'launch instance']):
            try:
                print(f"🚀 Executing EC2 provisioning for user {user_id}")
                
                # Get current instances for context
                current_instances = await self.aws_manager.list_ec2_instances()
                
                # Create instance configuration
                instance_config = {
                    'name': f'AI-Ops-Instance-{datetime.now().strftime("%Y%m%d-%H%M%S")}',
                    'instance_type': 't3.micro',  # Default to free tier
                    'ami_id': 'ami-0c02fb55956c7d316',  # Amazon Linux 2
                    'environment': 'development',
                    'key_name': None,  # Will use default
                    'security_groups': [],
                    'subnet_id': None  # Will use default
                }
                
                # Execute provisioning
                result = await self.aws_manager.provision_instance(instance_config)
                
                if result['success']:
                    instance_id = result['instance_id']
                    return f"✅ Successfully created EC2 instance {instance_id}! The instance is now being launched. You can monitor it in the AWS console. Instance details: {json.dumps(result['instance'], indent=2)}"
                else:
                    return f"❌ Failed to create EC2 instance: {result.get('error', 'Unknown error')}"
                    
            except Exception as e:
                return f"❌ Error creating EC2 instance: {str(e)}"
        
        # List EC2 Instances
        elif any(keyword in message for keyword in ['list ec2', 'show instances', 'ec2 instances', 'my instances']):
            try:
                instances = await self.aws_manager.list_ec2_instances()
                if instances:
                    instance_list = "\n".join([f"- {inst['name']} ({inst['id']}) - {inst['state']} - {inst['type']}" for inst in instances])
                    return f"📋 Your EC2 instances:\n{instance_list}"
                else:
                    return "📋 You have no EC2 instances running. Would you like me to create one for you?"
            except Exception as e:
                return f"❌ Error listing EC2 instances: {str(e)}"
        
        # List S3 Buckets
        elif any(keyword in message for keyword in ['list s3', 'show buckets', 's3 buckets', 'my buckets']):
            try:
                buckets = await self.aws_manager.list_s3_buckets()
                if buckets:
                    bucket_list = "\n".join([f"- {bucket['name']} (Created: {bucket['creation_date']})" for bucket in buckets])
                    return f"📦 Your S3 buckets:\n{bucket_list}"
                else:
                    return "📦 You have no S3 buckets. Would you like me to create one for you?"
            except Exception as e:
                return f"❌ Error listing S3 buckets: {str(e)}"
        
        # Cost Analysis
        elif any(keyword in message for keyword in ['cost', 'spending', 'billing', 'expenses']):
            try:
                cost_data = await self.aws_manager.get_cost_analysis(days=30)
                return f"💰 Cost Analysis (Last 30 days):\nTotal Cost: ${cost_data['total_cost']:.2f}\nDaily Average: ${cost_data['cost_per_day']:.2f}\nPotential Monthly Savings: ${cost_data['potential_monthly_savings']:.2f}"
            except Exception as e:
                return f"❌ Error getting cost analysis: {str(e)}"
        
        # Security Analysis
        elif any(keyword in message for keyword in ['security', 'vulnerabilities', 'security groups']):
            try:
                findings = await self.aws_manager.get_security_findings()
                if findings:
                    findings_list = "\n".join([f"- {finding['type']}: {finding['description']} (Severity: {finding['severity']})" for finding in findings])
                    return f"🔒 Security Findings:\n{findings_list}"
                else:
                    return "🔒 No security issues found. Your infrastructure looks secure!"
            except Exception as e:
                return f"❌ Error getting security findings: {str(e)}"
        
        # Default response
        else:
            return "Hello! I can help you manage your AWS infrastructure. Try asking me to:\n- Create a new EC2 instance\n- List your EC2 instances\n- Show your S3 buckets\n- Analyze your costs\n- Check security findings"
    
    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

def run_server():
    """Start the production server"""
    print("🚀 Starting Production AI Service with Real Agent Integration...")
    print("📊 Health check: http://localhost:8001/health")
    print("💬 Chat endpoint: http://localhost:8001/chat")
    print("☁️  AWS EC2: http://localhost:8001/aws/ec2")
    print("☁️  AWS S3: http://localhost:8001/aws/s3")
    print("🤖 Agents: DevOps, Infrastructure, Cost Optimization")
    
    with socketserver.TCPServer(('', 8001), ProductionAIService) as httpd:
        print("✅ Production service running at http://localhost:8001")
        httpd.serve_forever()

if __name__ == "__main__":
    run_server() 