#!/usr/bin/env python3
"""
🔍 Integration Testing Script
Tests the complete AI Ops Guardian Angel system
"""

import requests
import json
import time
import sys
import argparse
from typing import Dict, Any, List

class IntegrationTester:
    """Integration testing for AI Ops Guardian Angel"""
    
    def __init__(self, environment: str = "staging"):
        self.environment = environment
        self.base_urls = {
            "staging": "https://staging.your-domain.com",
            "production": "https://api.your-domain.com"
        }
        self.base_url = self.base_urls.get(environment, "http://localhost:3001")
        self.session = requests.Session()
        self.test_results = []
    
    def test_health_endpoints(self) -> bool:
        """Test all service health endpoints"""
        print("🏥 Testing Health Endpoints...")
        
        services = [
            ("API Gateway", f"{self.base_url}/health"),
            ("AI Services", f"{self.base_url.replace('3001', '8001')}/health"),
            ("Data Services", f"{self.base_url.replace('3001', '8003')}/health"),
        ]
        
        all_healthy = True
        for service_name, url in services:
            try:
                response = self.session.get(url, timeout=10)
                if response.status_code == 200:
                    print(f"✅ {service_name}: Healthy")
                    self.test_results.append({
                        "test": f"{service_name} Health",
                        "status": "PASS",
                        "response_time": response.elapsed.total_seconds()
                    })
                else:
                    print(f"❌ {service_name}: Unhealthy ({response.status_code})")
                    all_healthy = False
                    self.test_results.append({
                        "test": f"{service_name} Health",
                        "status": "FAIL",
                        "error": f"Status {response.status_code}"
                    })
            except Exception as e:
                print(f"❌ {service_name}: Error - {str(e)}")
                all_healthy = False
                self.test_results.append({
                    "test": f"{service_name} Health",
                    "status": "FAIL",
                    "error": str(e)
                })
        
        return all_healthy
    
    def test_authentication(self) -> bool:
        """Test authentication flow"""
        print("\n🔐 Testing Authentication...")
        
        # Test registration
        register_data = {
            "email": f"test-{int(time.time())}@example.com",
            "password": "TestPassword123!",
            "firstName": "Test",
            "lastName": "User"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/api/auth/register", json=register_data)
            if response.status_code == 201:
                print("✅ Registration: Success")
                self.test_results.append({
                    "test": "User Registration",
                    "status": "PASS"
                })
            else:
                print(f"❌ Registration: Failed ({response.status_code})")
                self.test_results.append({
                    "test": "User Registration",
                    "status": "FAIL",
                    "error": f"Status {response.status_code}"
                })
                return False
        except Exception as e:
            print(f"❌ Registration: Error - {str(e)}")
            self.test_results.append({
                "test": "User Registration",
                "status": "FAIL",
                "error": str(e)
            })
            return False
        
        # Test login
        login_data = {
            "email": register_data["email"],
            "password": register_data["password"]
        }
        
        try:
            response = self.session.post(f"{self.base_url}/api/auth/login", json=login_data)
            if response.status_code == 200:
                result = response.json()
                token = result.get("token")
                if token:
                    self.session.headers.update({"Authorization": f"Bearer {token}"})
                    print("✅ Login: Success")
                    self.test_results.append({
                        "test": "User Login",
                        "status": "PASS"
                    })
                    return True
                else:
                    print("❌ Login: No token received")
                    self.test_results.append({
                        "test": "User Login",
                        "status": "FAIL",
                        "error": "No token received"
                    })
                    return False
            else:
                print(f"❌ Login: Failed ({response.status_code})")
                self.test_results.append({
                    "test": "User Login",
                    "status": "FAIL",
                    "error": f"Status {response.status_code}"
                })
                return False
        except Exception as e:
            print(f"❌ Login: Error - {str(e)}")
            self.test_results.append({
                "test": "User Login",
                "status": "FAIL",
                "error": str(e)
            })
            return False
    
    def test_ai_chat(self) -> bool:
        """Test AI chat functionality"""
        print("\n🤖 Testing AI Chat...")
        
        chat_data = {
            "message": "Hello, can you help me optimize my AWS costs?",
            "context": "user is asking about cost optimization"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/api/chat", json=chat_data, timeout=30)
            if response.status_code == 200:
                result = response.json()
                if result.get("response"):
                    print("✅ AI Chat: Success")
                    self.test_results.append({
                        "test": "AI Chat",
                        "status": "PASS",
                        "response_time": response.elapsed.total_seconds()
                    })
                    return True
                else:
                    print("❌ AI Chat: No response received")
                    self.test_results.append({
                        "test": "AI Chat",
                        "status": "FAIL",
                        "error": "No response received"
                    })
                    return False
            else:
                print(f"❌ AI Chat: Failed ({response.status_code})")
                self.test_results.append({
                    "test": "AI Chat",
                    "status": "FAIL",
                    "error": f"Status {response.status_code}"
                })
                return False
        except Exception as e:
            print(f"❌ AI Chat: Error - {str(e)}")
            self.test_results.append({
                "test": "AI Chat",
                "status": "FAIL",
                "error": str(e)
            })
            return False
    
    def test_cloud_integration(self) -> bool:
        """Test cloud provider integration"""
        print("\n☁️ Testing Cloud Integration...")
        
        # Test AWS connectivity
        try:
            response = self.session.get(f"{self.base_url}/api/cloud/aws/status", timeout=10)
            if response.status_code == 200:
                print("✅ AWS Integration: Success")
                self.test_results.append({
                    "test": "AWS Integration",
                    "status": "PASS"
                })
            else:
                print(f"❌ AWS Integration: Failed ({response.status_code})")
                self.test_results.append({
                    "test": "AWS Integration",
                    "status": "FAIL",
                    "error": f"Status {response.status_code}"
                })
                return False
        except Exception as e:
            print(f"❌ AWS Integration: Error - {str(e)}")
            self.test_results.append({
                "test": "AWS Integration",
                "status": "FAIL",
                "error": str(e)
            })
            return False
        
        return True
    
    def test_performance(self) -> bool:
        """Test system performance"""
        print("\n⚡ Testing Performance...")
        
        # Test API response times
        endpoints = [
            ("Health Check", f"{self.base_url}/health"),
            ("API Info", f"{self.base_url}/api/info"),
        ]
        
        performance_ok = True
        for endpoint_name, url in endpoints:
            try:
                start_time = time.time()
                response = self.session.get(url, timeout=5)
                response_time = time.time() - start_time
                
                if response.status_code == 200 and response_time < 2.0:
                    print(f"✅ {endpoint_name}: {response_time:.2f}s")
                    self.test_results.append({
                        "test": f"{endpoint_name} Performance",
                        "status": "PASS",
                        "response_time": response_time
                    })
                else:
                    print(f"❌ {endpoint_name}: {response_time:.2f}s (too slow)")
                    performance_ok = False
                    self.test_results.append({
                        "test": f"{endpoint_name} Performance",
                        "status": "FAIL",
                        "error": f"Response time {response_time:.2f}s"
                    })
            except Exception as e:
                print(f"❌ {endpoint_name}: Error - {str(e)}")
                performance_ok = False
                self.test_results.append({
                    "test": f"{endpoint_name} Performance",
                    "status": "FAIL",
                    "error": str(e)
                })
        
        return performance_ok
    
    def run_all_tests(self) -> bool:
        """Run all integration tests"""
        print(f"🚀 Starting Integration Tests for {self.environment.upper()}")
        print("=" * 50)
        
        tests = [
            self.test_health_endpoints,
            self.test_authentication,
            self.test_ai_chat,
            self.test_cloud_integration,
            self.test_performance
        ]
        
        all_passed = True
        for test in tests:
            try:
                if not test():
                    all_passed = False
            except Exception as e:
                print(f"❌ Test failed with exception: {str(e)}")
                all_passed = False
        
        self.print_summary()
        return all_passed
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 50)
        print("📊 INTEGRATION TEST SUMMARY")
        print("=" * 50)
        
        passed = sum(1 for result in self.test_results if result["status"] == "PASS")
        failed = sum(1 for result in self.test_results if result["status"] == "FAIL")
        total = len(self.test_results)
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/total)*100:.1f}%")
        
        if failed > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if result["status"] == "FAIL":
                    print(f"  - {result['test']}: {result.get('error', 'Unknown error')}")

def main():
    parser = argparse.ArgumentParser(description="Integration Testing for AI Ops Guardian Angel")
    parser.add_argument("--environment", choices=["staging", "production"], default="staging",
                       help="Environment to test")
    parser.add_argument("--output", help="Output file for test results")
    
    args = parser.parse_args()
    
    tester = IntegrationTester(args.environment)
    success = tester.run_all_tests()
    
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(tester.test_results, f, indent=2)
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main() 