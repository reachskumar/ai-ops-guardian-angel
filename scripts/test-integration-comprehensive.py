#!/usr/bin/env python3
"""
Comprehensive Backend-Frontend Integration Testing
AI Ops Guardian Angel Platform

This script tests all critical integrations between frontend and backend services.
"""

import asyncio
import aiohttp
import json
import time
import sys
from datetime import datetime
from typing import Dict, List, Any

class IntegrationTester:
    def __init__(self):
        self.base_urls = {
            'frontend': 'http://localhost:8080',  # Main frontend
            'frontend_health': 'http://localhost:8081',  # Health server
            'ai_services': 'http://localhost:8001',
            'data_services': 'http://localhost:8003',  # Updated port
            'cloud_integrations': 'http://localhost:8002',
            'security_services': 'http://localhost:8003',
            'real_time_services': 'http://localhost:8004'
        }
        self.results = []
        self.session = None

    async def setup(self):
        """Initialize HTTP session"""
        self.session = aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10))

    async def cleanup(self):
        """Cleanup resources"""
        if self.session:
            await self.session.close()

    async def test_service_health(self, service_name: str, url: str) -> Dict[str, Any]:
        """Test service health endpoint"""
        try:
            async with self.session.get(f"{url}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        'service': service_name,
                        'status': 'healthy',
                        'response_time': response.headers.get('X-Response-Time', 'N/A'),
                        'data': data
                    }
                else:
                    return {
                        'service': service_name,
                        'status': 'unhealthy',
                        'error': f"HTTP {response.status}"
                    }
        except Exception as e:
            return {
                'service': service_name,
                'status': 'error',
                'error': str(e)
            }

    async def test_ai_chat_integration(self) -> Dict[str, Any]:
        """Test AI Chat functionality"""
        try:
            chat_data = {
                "message": "Hello, can you help me optimize my cloud costs?",
                "user_id": "test_user",
                "session_id": "test_session"
            }
            
            async with self.session.post(
                f"{self.base_urls['ai_services']}/chat",
                json=chat_data
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        'test': 'AI Chat Integration',
                        'status': 'success',
                        'response': data.get('response', 'No response'),
                        'agent_used': data.get('agent_type', 'Unknown')
                    }
                else:
                    return {
                        'test': 'AI Chat Integration',
                        'status': 'failed',
                        'error': f"HTTP {response.status}"
                    }
        except Exception as e:
            return {
                'test': 'AI Chat Integration',
                'status': 'error',
                'error': str(e)
            }

    async def test_agents_endpoint(self) -> Dict[str, Any]:
        """Test AI Agents endpoint"""
        try:
            async with self.session.get(f"{self.base_urls['ai_services']}/agents") as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        'test': 'AI Agents Endpoint',
                        'status': 'success',
                        'agents_count': len(data.get('agents', [])),
                        'agents': data.get('agents', [])
                    }
                else:
                    return {
                        'test': 'AI Agents Endpoint',
                        'status': 'failed',
                        'error': f"HTTP {response.status}"
                    }
        except Exception as e:
            return {
                'test': 'AI Agents Endpoint',
                'status': 'error',
                'error': str(e)
            }

    async def test_frontend_routes(self) -> Dict[str, Any]:
        """Test Frontend Routes"""
        try:
            routes_to_test = [
                '/',
                '/dashboard',
                '/agents',
                '/workflows/langgraph',
                '/workflows/hitl',
                '/plugins',
                '/knowledge',
                '/iac/generator',
                '/security',
                '/analytics'
            ]
            
            successful_routes = []
            failed_routes = []
            
            for route in routes_to_test:
                try:
                    async with self.session.get(f"{self.base_urls['frontend']}{route}") as response:
                        if response.status == 200:
                            successful_routes.append(route)
                        else:
                            failed_routes.append(route)
                except Exception:
                    failed_routes.append(route)
            
            return {
                'test': 'Frontend Routes',
                'status': 'success' if len(failed_routes) == 0 else 'partial',
                'successful_routes': len(successful_routes),
                'failed_routes': len(failed_routes),
                'total_routes': len(routes_to_test)
            }
        except Exception as e:
            return {
                'test': 'Frontend Routes',
                'status': 'error',
                'error': str(e)
            }

    async def test_data_services_auth(self) -> Dict[str, Any]:
        """Test Data Services Authentication"""
        try:
            # Test registration with unique email
            import time
            unique_email = f"test_{int(time.time())}@example.com"
            register_data = {
                "email": unique_email,
                "password": "testpassword123",
                "firstName": "Test",
                "lastName": "User"
            }
            
            async with self.session.post(
                f"{self.base_urls['data_services']}/auth/register",
                json=register_data
            ) as response:
                if response.status == 201:
                    data = await response.json()
                    return {
                        'test': 'Data Services Auth',
                        'status': 'success',
                        'user_id': data.get('user', {}).get('id'),
                        'token_received': 'token' in data
                    }
                else:
                    response_data = await response.json()
                    return {
                        'test': 'Data Services Auth',
                        'status': 'failed',
                        'error': f"HTTP {response.status}: {response_data.get('error', 'Unknown error')}"
                    }
        except Exception as e:
            return {
                'test': 'Data Services Auth',
                'status': 'error',
                'error': str(e)
            }

    async def run_all_tests(self):
        """Run all integration tests"""
        print("🚀 Starting Comprehensive Backend-Frontend Integration Testing")
        print("=" * 60)
        
        await self.setup()
        
        # Test service health
        print("\n📊 Testing Service Health...")
        health_tests = []
        for service_name, url in self.base_urls.items():
            if service_name == 'frontend':
                # Use frontend health server for health check
                result = await self.test_service_health(service_name, self.base_urls['frontend_health'])
            else:
                result = await self.test_service_health(service_name, url)
            health_tests.append(result)
            print(f"  {service_name}: {result['status']}")
        
        # Test core integrations
        print("\n🔗 Testing Core Integrations...")
        integration_tests = [
            await self.test_ai_chat_integration(),
            await self.test_agents_endpoint(),
            await self.test_frontend_routes(),
            await self.test_data_services_auth()
        ]
        
        # Compile results
        all_results = health_tests + integration_tests
        
        # Generate report
        print("\n📋 Integration Test Report")
        print("=" * 60)
        
        successful_tests = [r for r in all_results if r['status'] == 'success']
        failed_tests = [r for r in all_results if r['status'] in ['failed', 'error']]
        partial_tests = [r for r in all_results if r['status'] == 'partial']
        
        print(f"✅ Successful Tests: {len(successful_tests)}")
        print(f"❌ Failed Tests: {len(failed_tests)}")
        print(f"⚠️  Partial Tests: {len(partial_tests)}")
        print(f"📊 Total Tests: {len(all_results)}")
        
        if failed_tests:
            print("\n❌ Failed Tests Details:")
            for test in failed_tests:
                print(f"  - {test.get('test', test.get('service', 'Unknown'))}: {test.get('error', 'Unknown error')}")
        
        if successful_tests:
            print("\n✅ Successful Tests:")
            for test in successful_tests:
                test_name = test.get('test', test.get('service', 'Unknown'))
                print(f"  - {test_name}")
        
        # Overall assessment
        success_rate = len(successful_tests) / len(all_results) * 100
        print(f"\n🎯 Overall Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 90:
            print("🎉 EXCELLENT: Integration testing passed with high success rate!")
        elif success_rate >= 70:
            print("✅ GOOD: Integration testing passed with acceptable success rate.")
        else:
            print("⚠️  NEEDS ATTENTION: Some integrations need to be fixed.")
        
        await self.cleanup()
        return all_results

async def main():
    """Main test runner"""
    tester = IntegrationTester()
    results = await tester.run_all_tests()
    
    # Save results to file
    with open('integration_test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'results': results
        }, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: integration_test_results.json")

if __name__ == "__main__":
    asyncio.run(main()) 