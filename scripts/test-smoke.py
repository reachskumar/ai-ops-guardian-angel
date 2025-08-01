#!/usr/bin/env python3
"""
🚀 Smoke Testing Script
Quick validation for production deployment
"""

import requests
import json
import time
import sys
import argparse
from typing import Dict, Any

class SmokeTester:
    """Smoke testing for production deployment"""
    
    def __init__(self, environment: str = "production"):
        self.environment = environment
        self.base_urls = {
            "production": "https://api.your-domain.com",
            "staging": "https://staging.your-domain.com"
        }
        self.base_url = self.base_urls.get(environment, "http://localhost:3001")
        self.session = requests.Session()
        self.results = []
    
    def test_critical_endpoints(self) -> bool:
        """Test critical endpoints for basic functionality"""
        print("🔥 Testing Critical Endpoints...")
        
        endpoints = [
            ("Health Check", f"{self.base_url}/health"),
            ("API Info", f"{self.base_url}/api/info"),
            ("Frontend", self.base_url.replace("api.", "").replace(":3001", "")),
        ]
        
        all_ok = True
        for name, url in endpoints:
            try:
                start_time = time.time()
                response = self.session.get(url, timeout=10)
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    print(f"✅ {name}: {response_time:.2f}s")
                    self.results.append({
                        "test": f"{name}",
                        "status": "PASS",
                        "response_time": response_time
                    })
                else:
                    print(f"❌ {name}: {response.status_code}")
                    all_ok = False
                    self.results.append({
                        "test": f"{name}",
                        "status": "FAIL",
                        "error": f"Status {response.status_code}"
                    })
            except Exception as e:
                print(f"❌ {name}: Error - {str(e)}")
                all_ok = False
                self.results.append({
                    "test": f"{name}",
                    "status": "FAIL",
                    "error": str(e)
                })
        
        return all_ok
    
    def test_ssl_certificates(self) -> bool:
        """Test SSL certificate validity"""
        print("\n🔒 Testing SSL Certificates...")
        
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=10)
            if response.url.startswith("https://"):
                print("✅ SSL: Valid certificate")
                self.results.append({
                    "test": "SSL Certificate",
                    "status": "PASS"
                })
                return True
            else:
                print("❌ SSL: Not using HTTPS")
                self.results.append({
                    "test": "SSL Certificate",
                    "status": "FAIL",
                    "error": "Not using HTTPS"
                })
                return False
        except Exception as e:
            print(f"❌ SSL: Error - {str(e)}")
            self.results.append({
                "test": "SSL Certificate",
                "status": "FAIL",
                "error": str(e)
            })
            return False
    
    def test_response_times(self) -> bool:
        """Test response times are within acceptable limits"""
        print("\n⚡ Testing Response Times...")
        
        endpoints = [
            ("Health Check", f"{self.base_url}/health"),
            ("API Info", f"{self.base_url}/api/info"),
        ]
        
        performance_ok = True
        for name, url in endpoints:
            try:
                start_time = time.time()
                response = self.session.get(url, timeout=5)
                response_time = time.time() - start_time
                
                if response_time < 1.0:
                    print(f"✅ {name}: {response_time:.2f}s (fast)")
                    self.results.append({
                        "test": f"{name} Performance",
                        "status": "PASS",
                        "response_time": response_time
                    })
                elif response_time < 3.0:
                    print(f"⚠️ {name}: {response_time:.2f}s (acceptable)")
                    self.results.append({
                        "test": f"{name} Performance",
                        "status": "PASS",
                        "response_time": response_time
                    })
                else:
                    print(f"❌ {name}: {response_time:.2f}s (too slow)")
                    performance_ok = False
                    self.results.append({
                        "test": f"{name} Performance",
                        "status": "FAIL",
                        "error": f"Response time {response_time:.2f}s"
                    })
            except Exception as e:
                print(f"❌ {name}: Error - {str(e)}")
                performance_ok = False
                self.results.append({
                    "test": f"{name} Performance",
                    "status": "FAIL",
                    "error": str(e)
                })
        
        return performance_ok
    
    def test_basic_functionality(self) -> bool:
        """Test basic application functionality"""
        print("\n🔧 Testing Basic Functionality...")
        
        # Test API version endpoint
        try:
            response = self.session.get(f"{self.base_url}/api/info", timeout=5)
            if response.status_code == 200:
                data = response.json()
                if "version" in data:
                    print(f"✅ API Version: {data['version']}")
                    self.results.append({
                        "test": "API Version",
                        "status": "PASS",
                        "version": data.get("version")
                    })
                    return True
                else:
                    print("❌ API Version: No version info")
                    self.results.append({
                        "test": "API Version",
                        "status": "FAIL",
                        "error": "No version info"
                    })
                    return False
            else:
                print(f"❌ API Version: {response.status_code}")
                self.results.append({
                    "test": "API Version",
                    "status": "FAIL",
                    "error": f"Status {response.status_code}"
                })
                return False
        except Exception as e:
            print(f"❌ API Version: Error - {str(e)}")
            self.results.append({
                "test": "API Version",
                "status": "FAIL",
                "error": str(e)
            })
            return False
    
    def run_smoke_tests(self) -> bool:
        """Run all smoke tests"""
        print(f"🚀 Starting Smoke Tests for {self.environment.upper()}")
        print("=" * 40)
        
        tests = [
            self.test_critical_endpoints,
            self.test_ssl_certificates,
            self.test_response_times,
            self.test_basic_functionality
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
        print("\n" + "=" * 40)
        print("📊 SMOKE TEST SUMMARY")
        print("=" * 40)
        
        passed = sum(1 for result in self.results if result["status"] == "PASS")
        failed = sum(1 for result in self.results if result["status"] == "FAIL")
        total = len(self.results)
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/total)*100:.1f}%")
        
        if failed > 0:
            print("\n❌ Failed Tests:")
            for result in self.results:
                if result["status"] == "FAIL":
                    print(f"  - {result['test']}: {result.get('error', 'Unknown error')}")
        
        if passed == total:
            print("\n🎉 All smoke tests passed! Production deployment is healthy.")
        else:
            print("\n⚠️ Some smoke tests failed. Please investigate before proceeding.")

def main():
    parser = argparse.ArgumentParser(description="Smoke Testing for AI Ops Guardian Angel")
    parser.add_argument("--environment", choices=["staging", "production"], default="production",
                       help="Environment to test")
    parser.add_argument("--output", help="Output file for test results")
    
    args = parser.parse_args()
    
    tester = SmokeTester(args.environment)
    success = tester.run_all_tests()
    
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(tester.results, f, indent=2)
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main() 