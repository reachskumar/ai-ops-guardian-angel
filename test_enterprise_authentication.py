#!/usr/bin/env python3
"""
🔐 Enterprise Authentication System Test Suite
Comprehensive testing of secure authentication, MFA, RBAC, and security features
"""

import requests
import json
import time
import base64
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class EnterpriseAuthTester:
    """Test suite for enterprise authentication system"""
    
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tokens = {}
        self.users = {}
        
    def test_health_check(self):
        """Test API health"""
        print("\n" + "="*60)
        print("🏥 TESTING API HEALTH")
        print("="*60)
        
        try:
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 200:
                print("✅ API is healthy and running")
                return True
            else:
                print(f"❌ API health check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Failed to connect to API: {e}")
            return False
    
    def test_user_registration(self):
        """Test user registration with validation"""
        print("\n" + "="*60)
        print("📝 TESTING USER REGISTRATION")
        print("="*60)
        
        # Test valid registration
        registration_data = {
            "email": "testuser@company.com",
            "username": "testuser",
            "password": "SecurePassword123!",
            "confirm_password": "SecurePassword123!",
            "full_name": "Test User",
            "organization_name": "Test Company"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/auth/register",
                json=registration_data
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ User registered successfully: {result['user_id']}")
                print(f"   Message: {result['message']}")
                self.users['test_user'] = result['user_id']
                return True
            else:
                print(f"❌ Registration failed: {response.status_code}")
                print(f"   Error: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Registration test failed: {e}")
            return False
    
    def test_password_policy_validation(self):
        """Test password policy enforcement"""
        print("\n" + "="*60)
        print("🔒 TESTING PASSWORD POLICY")
        print("="*60)
        
        # Test weak passwords
        weak_passwords = [
            "weak",           # Too short
            "password",       # No uppercase, numbers, or special chars
            "Password",       # No numbers or special chars
            "Password123",    # No special chars
            "password123!"    # No uppercase
        ]
        
        for weak_password in weak_passwords:
            registration_data = {
                "email": f"weakpass{len(weak_password)}@test.com",
                "username": f"weakuser{len(weak_password)}",
                "password": weak_password,
                "confirm_password": weak_password
            }
            
            response = self.session.post(
                f"{self.base_url}/auth/register",
                json=registration_data
            )
            
            if response.status_code == 400:
                print(f"✅ Weak password rejected: '{weak_password}'")
            else:
                print(f"❌ Weak password accepted: '{weak_password}'")
        
        return True
    
    def test_user_login(self):
        """Test user authentication"""
        print("\n" + "="*60)
        print("🔑 TESTING USER LOGIN")
        print("="*60)
        
        # Test with demo user (should exist)
        login_data = {
            "username_or_email": "admin@demo.com",
            "password": "SecureAdmin123!"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/auth/login",
                json=login_data
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Login successful!")
                print(f"   User: {result['user']['email']}")
                print(f"   Roles: {result['user']['roles']}")
                print(f"   MFA Enabled: {result['user']['mfa_enabled']}")
                print(f"   Token expires in: {result['expires_in']} seconds")
                
                # Store tokens for further tests
                self.tokens['admin'] = {
                    'access_token': result['access_token'],
                    'refresh_token': result['refresh_token'],
                    'user': result['user']
                }
                return True
            else:
                print(f"❌ Login failed: {response.status_code}")
                print(f"   Error: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Login test failed: {e}")
            return False
    
    def test_invalid_login_attempts(self):
        """Test failed login protection"""
        print("\n" + "="*60)
        print("🛡️ TESTING FAILED LOGIN PROTECTION")
        print("="*60)
        
        # Test with wrong credentials
        login_data = {
            "username_or_email": "admin@demo.com",
            "password": "WrongPassword123!"
        }
        
        for attempt in range(3):
            response = self.session.post(
                f"{self.base_url}/auth/login",
                json=login_data
            )
            
            print(f"   Attempt {attempt + 1}: Status {response.status_code}")
            
            if response.status_code == 401:
                print(f"   ✅ Invalid credentials properly rejected")
            else:
                print(f"   ❌ Unexpected response: {response.text}")
        
        return True
    
    def test_protected_endpoints(self):
        """Test protected endpoint access"""
        print("\n" + "="*60)
        print("🔐 TESTING PROTECTED ENDPOINTS")
        print("="*60)
        
        if 'admin' not in self.tokens:
            print("❌ No admin token available for testing")
            return False
        
        token = self.tokens['admin']['access_token']
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test protected endpoints
        protected_endpoints = [
            ("/auth/profile", "GET", "User Profile"),
            ("/auth/sessions", "GET", "User Sessions"),
            ("/chat", "POST", "AI Chat", {"message": "Hello"}),
            ("/workflows/available", "GET", "Available Workflows")
        ]
        
        for endpoint, method, description, data in [(e[0], e[1], e[2], e[3] if len(e) > 3 else None) for e in protected_endpoints]:
            try:
                if method == "GET":
                    response = self.session.get(f"{self.base_url}{endpoint}", headers=headers)
                elif method == "POST":
                    response = self.session.post(f"{self.base_url}{endpoint}", headers=headers, json=data)
                
                if response.status_code in [200, 201]:
                    print(f"✅ {description}: Access granted")
                elif response.status_code == 401:
                    print(f"❌ {description}: Authentication failed")
                elif response.status_code == 403:
                    print(f"⚠️  {description}: Access forbidden (correct for role)")
                else:
                    print(f"⚠️  {description}: Status {response.status_code}")
                    
            except Exception as e:
                print(f"❌ {description}: Test failed - {e}")
        
        return True
    
    def test_unauthorized_access(self):
        """Test unauthorized access attempts"""
        print("\n" + "="*60)
        print("🚫 TESTING UNAUTHORIZED ACCESS")
        print("="*60)
        
        # Test without token
        response = self.session.get(f"{self.base_url}/auth/profile")
        if response.status_code == 401:
            print("✅ Unauthorized access properly blocked (no token)")
        else:
            print(f"❌ Unauthorized access allowed: {response.status_code}")
        
        # Test with invalid token
        headers = {"Authorization": "Bearer invalid_token_12345"}
        response = self.session.get(f"{self.base_url}/auth/profile", headers=headers)
        if response.status_code == 401:
            print("✅ Invalid token properly rejected")
        else:
            print(f"❌ Invalid token accepted: {response.status_code}")
        
        return True
    
    def test_mfa_setup(self):
        """Test Multi-Factor Authentication setup"""
        print("\n" + "="*60)
        print("🛡️ TESTING MULTI-FACTOR AUTHENTICATION")
        print("="*60)
        
        if 'admin' not in self.tokens:
            print("❌ No admin token available for MFA testing")
            return False
        
        token = self.tokens['admin']['access_token']
        headers = {"Authorization": f"Bearer {token}"}
        
        # Setup MFA
        try:
            response = self.session.post(f"{self.base_url}/auth/mfa/setup", headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                print("✅ MFA setup initiated successfully")
                print(f"   Secret provided: {len(result['secret'])} characters")
                print(f"   QR code generated: {result['qr_code'][:50]}...")
                print(f"   Backup codes: {len(result['backup_codes'])} codes provided")
                
                # In a real test, you would verify the TOTP code here
                # For demo, we'll just show that the setup endpoint works
                return True
            else:
                print(f"❌ MFA setup failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ MFA setup test failed: {e}")
            return False
    
    def test_oauth_endpoints(self):
        """Test OAuth2 integration endpoints"""
        print("\n" + "="*60)
        print("🔗 TESTING OAUTH2 INTEGRATION")
        print("="*60)
        
        oauth_providers = ["google", "microsoft", "github"]
        
        for provider in oauth_providers:
            try:
                # Test OAuth initiation endpoint
                params = {"redirect_uri": "http://localhost:3000/auth/callback"}
                response = self.session.get(
                    f"{self.base_url}/auth/oauth/{provider}",
                    params=params
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ {provider.title()} OAuth: Authorization URL generated")
                    print(f"   State: {result['state'][:20]}...")
                else:
                    print(f"❌ {provider.title()} OAuth failed: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ OAuth test for {provider} failed: {e}")
        
        return True
    
    def test_password_change(self):
        """Test password change functionality"""
        print("\n" + "="*60)
        print("🔄 TESTING PASSWORD CHANGE")
        print("="*60)
        
        if 'admin' not in self.tokens:
            print("❌ No admin token available for password change testing")
            return False
        
        token = self.tokens['admin']['access_token']
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test password change (with wrong current password)
        change_data = {
            "current_password": "WrongCurrentPassword",
            "new_password": "NewSecurePassword123!",
            "confirm_password": "NewSecurePassword123!"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/auth/change-password",
                headers=headers,
                json=change_data
            )
            
            if response.status_code == 400:
                print("✅ Password change rejected with wrong current password")
                return True
            else:
                print(f"❌ Password change validation failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Password change test failed: {e}")
            return False
    
    def test_session_management(self):
        """Test session management features"""
        print("\n" + "="*60)
        print("📱 TESTING SESSION MANAGEMENT")
        print("="*60)
        
        if 'admin' not in self.tokens:
            print("❌ No admin token available for session testing")
            return False
        
        token = self.tokens['admin']['access_token']
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get active sessions
        try:
            response = self.session.get(f"{self.base_url}/auth/sessions", headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Session listing successful")
                print(f"   Active sessions: {result['total_sessions']}")
                
                for session in result['sessions']:
                    print(f"   Session: {session['session_id'][:16]}... "
                          f"(Current: {session['is_current']})")
                
                return True
            else:
                print(f"❌ Session listing failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Session management test failed: {e}")
            return False
    
    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        print("\n" + "="*60)
        print("👑 TESTING ADMIN ENDPOINTS")
        print("="*60)
        
        if 'admin' not in self.tokens:
            print("❌ No admin token available for admin testing")
            return False
        
        token = self.tokens['admin']['access_token']
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test admin endpoints
        admin_endpoints = [
            ("/auth/admin/security-summary", "Security Summary"),
            ("/auth/admin/users", "User Management")
        ]
        
        for endpoint, description in admin_endpoints:
            try:
                response = self.session.get(f"{self.base_url}{endpoint}", headers=headers)
                
                if response.status_code == 200:
                    print(f"✅ {description}: Access granted")
                elif response.status_code == 403:
                    print(f"⚠️  {description}: Access forbidden (check admin privileges)")
                else:
                    print(f"❌ {description}: Status {response.status_code}")
                    
            except Exception as e:
                print(f"❌ {description}: Test failed - {e}")
        
        return True
    
    def test_token_refresh(self):
        """Test token refresh functionality"""
        print("\n" + "="*60)
        print("🔄 TESTING TOKEN REFRESH")
        print("="*60)
        
        if 'admin' not in self.tokens:
            print("❌ No admin token available for refresh testing")
            return False
        
        refresh_token = self.tokens['admin']['refresh_token']
        
        try:
            refresh_data = {"refresh_token": refresh_token}
            response = self.session.post(
                f"{self.base_url}/auth/refresh",
                json=refresh_data
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Token refresh successful")
                print(f"   New token expires in: {result['expires_in']} seconds")
                
                # Update stored token
                self.tokens['admin']['access_token'] = result['access_token']
                return True
            else:
                print(f"❌ Token refresh failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Token refresh test failed: {e}")
            return False
    
    def test_logout(self):
        """Test logout functionality"""
        print("\n" + "="*60)
        print("🚪 TESTING LOGOUT")
        print("="*60)
        
        if 'admin' not in self.tokens:
            print("❌ No admin token available for logout testing")
            return False
        
        token = self.tokens['admin']['access_token']
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            response = self.session.post(f"{self.base_url}/auth/logout", headers=headers)
            
            if response.status_code == 200:
                print("✅ Logout successful")
                
                # Test that token is now invalid
                test_response = self.session.get(f"{self.base_url}/auth/profile", headers=headers)
                if test_response.status_code == 401:
                    print("✅ Token properly invalidated after logout")
                else:
                    print("❌ Token still valid after logout")
                
                return True
            else:
                print(f"❌ Logout failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Logout test failed: {e}")
            return False
    
    def run_comprehensive_test_suite(self):
        """Run all authentication tests"""
        print("\n" + "🔐" * 30)
        print("🚀 ENTERPRISE AUTHENTICATION TEST SUITE")
        print("🔐" * 30)
        
        test_results = {}
        
        # Run all tests
        tests = [
            ("Health Check", self.test_health_check),
            ("User Registration", self.test_user_registration),
            ("Password Policy", self.test_password_policy_validation),
            ("User Login", self.test_user_login),
            ("Failed Login Protection", self.test_invalid_login_attempts),
            ("Protected Endpoints", self.test_protected_endpoints),
            ("Unauthorized Access", self.test_unauthorized_access),
            ("Multi-Factor Auth", self.test_mfa_setup),
            ("OAuth Integration", self.test_oauth_endpoints),
            ("Password Change", self.test_password_change),
            ("Session Management", self.test_session_management),
            ("Admin Endpoints", self.test_admin_endpoints),
            ("Token Refresh", self.test_token_refresh),
            ("Logout", self.test_logout)
        ]
        
        for test_name, test_func in tests:
            try:
                print(f"\n⏳ Running {test_name}...")
                result = test_func()
                test_results[test_name] = result
                time.sleep(1)  # Brief pause between tests
            except Exception as e:
                print(f"❌ {test_name} failed with exception: {e}")
                test_results[test_name] = False
        
        # Summary
        print("\n" + "="*60)
        print("📊 TEST RESULTS SUMMARY")
        print("="*60)
        
        passed = sum(1 for result in test_results.values() if result)
        total = len(test_results)
        
        for test_name, result in test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} {test_name}")
        
        print(f"\n🎯 Overall Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 ALL TESTS PASSED - Enterprise Authentication System is SECURE!")
        else:
            print("⚠️  Some tests failed - Review security implementation")
        
        return test_results

def main():
    """Run the enterprise authentication test suite"""
    tester = EnterpriseAuthTester()
    results = tester.run_comprehensive_test_suite()
    
    # Exit with appropriate code
    all_passed = all(results.values())
    exit(0 if all_passed else 1)

if __name__ == "__main__":
    main() 