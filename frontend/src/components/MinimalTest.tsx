import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

const MinimalTest: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testCloudConnection = async () => {
    setIsLoading(true);
    addResult('=== MINIMAL CLOUD CONNECTION TEST ===');

    try {
      // Step 1: Test authentication
      addResult('1. Testing authentication...');
      const authResponse = await fetch('http://localhost:8001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username_or_email: 'admin@demo.com',
          password: 'SecureAdmin123!'
        })
      });
      
      const authData = await authResponse.json();
      addResult(`   Auth status: ${authResponse.status}`);
      addResult(`   Auth success: ${authResponse.ok}`);
      addResult(`   Token present: ${authData.access_token ? 'YES' : 'NO'}`);

      if (!authData.access_token) {
        addResult('   ERROR: No access token received');
        return;
      }

      // Step 2: Test cloud provider connection
      addResult('2. Testing cloud provider connection...');
      const connectResponse = await fetch('http://localhost:8001/cloud/providers/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.access_token}`
        },
        body: JSON.stringify({
          provider: 'aws',
          credentials: {
            access_key_id: 'test-key',
            secret_access_key: 'test-secret'
          },
          account_name: 'minimal-test'
        })
      });
      
      const connectData = await connectResponse.json();
      addResult(`   Connect status: ${connectResponse.status}`);
      addResult(`   Connect success: ${connectResponse.ok}`);
      addResult(`   Connect data: ${JSON.stringify(connectData)}`);

      // Step 3: Test getting cloud providers
      addResult('3. Testing get cloud providers...');
      const providersResponse = await fetch('http://localhost:8001/cloud/providers', {
        headers: {
          'Authorization': `Bearer ${authData.access_token}`
        }
      });
      
      const providersData = await providersResponse.json();
      addResult(`   Providers status: ${providersResponse.status}`);
      addResult(`   Providers success: ${providersResponse.ok}`);
      addResult(`   Providers data: ${JSON.stringify(providersData)}`);

    } catch (error) {
      addResult(`ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    addResult('=== TEST COMPLETE ===');
    setIsLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Minimal Cloud Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={testCloudConnection} 
              disabled={isLoading}
            >
              {isLoading ? 'Testing...' : 'Run Minimal Test'}
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
              <h3 className="font-semibold">Test Results:</h3>
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
              This test bypasses the frontend API client and makes direct fetch calls to identify the exact issue.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default MinimalTest; 