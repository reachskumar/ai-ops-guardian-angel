import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { aiServicesAPI } from '../lib/api';
import { useAuth } from '../lib/auth';

const DebugTest: React.FC = () => {
  const { user, token, login } = useAuth();
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runDebugTests = async () => {
    setIsLoading(true);
    addResult('=== STARTING COMPREHENSIVE DEBUG TEST ===');

    try {
      // Test 1: Check if API client is configured
      addResult('1. Checking API client configuration...');
      addResult(`   Base URL: ${aiServicesAPI['baseURL']}`);
      addResult(`   Token: ${token ? 'Present' : 'Missing'}`);

      // Test 2: Test direct fetch to backend
      addResult('2. Testing direct fetch to backend...');
      try {
        const healthResponse = await fetch('http://localhost:8001/health');
        const healthData = await healthResponse.json();
        addResult(`   Health check: ${healthResponse.ok ? 'SUCCESS' : 'FAILED'}`);
        addResult(`   Response: ${JSON.stringify(healthData)}`);
      } catch (error) {
        addResult(`   Health check ERROR: ${error instanceof Error ? error.message : 'Unknown'}`);
      }

      // Test 3: Test authentication via API client
      addResult('3. Testing authentication via API client...');
      try {
        const authResponse = await aiServicesAPI.login('admin@demo.com', 'SecureAdmin123!');
        addResult(`   Auth result: ${authResponse.success ? 'SUCCESS' : 'FAILED'}`);
        if (authResponse.success) {
          addResult(`   Token received: ${authResponse.data?.token ? 'YES' : 'NO'}`);
          addResult(`   User info: ${JSON.stringify(authResponse.data?.user)}`);
        } else {
          addResult(`   Auth error: ${authResponse.error}`);
        }
      } catch (error) {
        addResult(`   Auth ERROR: ${error instanceof Error ? error.message : 'Unknown'}`);
      }

      // Test 4: Test cloud providers
      addResult('4. Testing cloud providers...');
      try {
        const providersResponse = await aiServicesAPI.getCloudProviders();
        addResult(`   Providers result: ${providersResponse.success ? 'SUCCESS' : 'FAILED'}`);
        if (providersResponse.success) {
          addResult(`   Providers data: ${JSON.stringify(providersResponse.data)}`);
        } else {
          addResult(`   Providers error: ${providersResponse.error}`);
        }
      } catch (error) {
        addResult(`   Providers ERROR: ${error instanceof Error ? error.message : 'Unknown'}`);
      }

      // Test 5: Test cloud connection
      addResult('5. Testing cloud connection...');
      try {
        const connectResponse = await aiServicesAPI.connectCloudProvider('aws', {
          access_key_id: 'test-key',
          secret_access_key: 'test-secret'
        }, 'debug-test');
        addResult(`   Connect result: ${connectResponse.success ? 'SUCCESS' : 'FAILED'}`);
        if (connectResponse.success) {
          addResult(`   Connect data: ${JSON.stringify(connectResponse.data)}`);
        } else {
          addResult(`   Connect error: ${connectResponse.error}`);
        }
      } catch (error) {
        addResult(`   Connect ERROR: ${error instanceof Error ? error.message : 'Unknown'}`);
      }

      // Test 6: Test with authentication context
      addResult('6. Testing with auth context...');
      addResult(`   Current user: ${user ? JSON.stringify(user) : 'None'}`);
      addResult(`   Current token: ${token ? 'Present' : 'Missing'}`);

      // Test 7: Test login via auth context
      addResult('7. Testing login via auth context...');
      try {
        const loginSuccess = await login('admin@demo.com', 'SecureAdmin123!');
        addResult(`   Login success: ${loginSuccess}`);
      } catch (error) {
        addResult(`   Login ERROR: ${error instanceof Error ? error.message : 'Unknown'}`);
      }

    } catch (error) {
      addResult(`MAJOR ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    addResult('=== DEBUG TEST COMPLETE ===');
    setIsLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Comprehensive Debug Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runDebugTests} 
              disabled={isLoading}
            >
              {isLoading ? 'Running Tests...' : 'Run Debug Tests'}
            </Button>
            <Button 
              onClick={clearResults} 
              variant="outline"
            >
              Clear Results
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Debug Results:</h3>
              <div className="max-h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg font-mono text-sm">
                {results.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Alert>
            <AlertDescription>
              <strong>Current State:</strong><br/>
              User: {user ? `${user.name} (${user.email})` : 'Not logged in'}<br/>
              Token: {token ? 'Present' : 'Missing'}<br/>
              Backend: http://localhost:8001<br/>
              Frontend: http://localhost:8080
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugTest; 