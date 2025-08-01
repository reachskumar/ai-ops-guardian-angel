import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

const SimpleTest: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBackendConnection = async () => {
    setIsLoading(true);
    addResult('Starting backend connection test...');

    try {
      // Test 1: Direct fetch to backend health
      addResult('Testing backend health...');
      const healthResponse = await fetch('http://localhost:8001/health');
      const healthData = await healthResponse.json();
      addResult(`Health check: ${healthResponse.ok ? 'SUCCESS' : 'FAILED'} - ${JSON.stringify(healthData)}`);

      // Test 2: Test authentication
      addResult('Testing authentication...');
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
      addResult(`Authentication: ${authResponse.ok ? 'SUCCESS' : 'FAILED'} - Token: ${authData.access_token ? 'Present' : 'Missing'}`);

      // Test 3: Test cloud providers with token
      if (authData.access_token) {
        addResult('Testing cloud providers...');
        const providersResponse = await fetch('http://localhost:8001/cloud/providers', {
          headers: {
            'Authorization': `Bearer ${authData.access_token}`
          }
        });
        
        const providersData = await providersResponse.json();
        addResult(`Cloud providers: ${providersResponse.ok ? 'SUCCESS' : 'FAILED'} - ${JSON.stringify(providersData)}`);
      }

      // Test 4: Test CORS
      addResult('Testing CORS...');
      const corsResponse = await fetch('http://localhost:8001/cloud/providers', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:8080',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'authorization'
        }
      });
      addResult(`CORS test: ${corsResponse.ok ? 'SUCCESS' : 'FAILED'} - Status: ${corsResponse.status}`);

    } catch (error) {
      addResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setIsLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Simple Backend-Frontend Integration Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={testBackendConnection} 
              disabled={isLoading}
            >
              {isLoading ? 'Testing...' : 'Run Backend Test'}
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
              <div className="max-h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg">
                {results.map((result, index) => (
                  <div key={index} className="text-sm font-mono mb-1">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Alert>
            <AlertDescription>
              <strong>Backend URL:</strong> http://localhost:8001<br/>
              <strong>Frontend URL:</strong> http://localhost:8080<br/>
              <strong>Test Credentials:</strong> admin@demo.com / SecureAdmin123!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleTest; 