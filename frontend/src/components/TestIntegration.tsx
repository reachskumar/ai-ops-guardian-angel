import React, { useState, useEffect } from 'react';
import { aiServicesAPI } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const TestIntegration: React.FC = () => {
  const { user, token, login } = useAuth();
  const [testResults, setTestResults] = useState<any>({});
  const [isTesting, setIsTesting] = useState(false);

  const runTests = async () => {
    setIsTesting(true);
    const results: any = {};

    try {
      // Test 1: Health Check
      console.log('Testing health check...');
      const healthResponse = await aiServicesAPI.healthCheck();
      results.health = healthResponse.success;

      // Test 2: Authentication
      console.log('Testing authentication...');
      if (!token) {
        const loginSuccess = await login('admin@demo.com', 'SecureAdmin123!');
        results.auth = loginSuccess;
      } else {
        results.auth = true;
      }

      // Test 3: Cloud Providers
      console.log('Testing cloud providers...');
      const providersResponse = await aiServicesAPI.getCloudProviders();
      results.cloudProviders = providersResponse.success;

      // Test 4: Connect Cloud Provider
      console.log('Testing cloud provider connection...');
      const connectResponse = await aiServicesAPI.connectCloudProvider('aws', {
        access_key_id: 'test-key',
        secret_access_key: 'test-secret'
      }, 'test-account');
      results.cloudConnect = connectResponse.success;

      // Test 5: Get Cloud Resources
      console.log('Testing cloud resources...');
      const resourcesResponse = await aiServicesAPI.getCloudResources('aws');
      results.cloudResources = resourcesResponse.success;

      // Test 6: Chat
      console.log('Testing chat...');
      const chatResponse = await aiServicesAPI.sendChatMessage('Hello, test message');
      results.chat = chatResponse.success;

    } catch (error) {
      console.error('Test error:', error);
      results.error = error instanceof Error ? error.message : 'Unknown error';
    }

    setTestResults(results);
    setIsTesting(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Frontend-Backend Integration Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runTests} 
            disabled={isTesting}
            className="w-full"
          >
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run Integration Tests'
            )}
          </Button>

          {Object.keys(testResults).length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Test Results:</h3>
              
              {testResults.health !== undefined && (
                <Alert>
                  {testResults.health ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    Health Check: {testResults.health ? 'PASS' : 'FAIL'}
                  </AlertDescription>
                </Alert>
              )}

              {testResults.auth !== undefined && (
                <Alert>
                  {testResults.auth ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    Authentication: {testResults.auth ? 'PASS' : 'FAIL'}
                  </AlertDescription>
                </Alert>
              )}

              {testResults.cloudProviders !== undefined && (
                <Alert>
                  {testResults.cloudProviders ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    Cloud Providers API: {testResults.cloudProviders ? 'PASS' : 'FAIL'}
                  </AlertDescription>
                </Alert>
              )}

              {testResults.cloudConnect !== undefined && (
                <Alert>
                  {testResults.cloudConnect ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    Cloud Provider Connection: {testResults.cloudConnect ? 'PASS' : 'FAIL'}
                  </AlertDescription>
                </Alert>
              )}

              {testResults.cloudResources !== undefined && (
                <Alert>
                  {testResults.cloudResources ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    Cloud Resources API: {testResults.cloudResources ? 'PASS' : 'FAIL'}
                  </AlertDescription>
                </Alert>
              )}

              {testResults.chat !== undefined && (
                <Alert>
                  {testResults.chat ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    Chat API: {testResults.chat ? 'PASS' : 'FAIL'}
                  </AlertDescription>
                </Alert>
              )}

              {testResults.error && (
                <Alert>
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    Error: {testResults.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Current State:</h4>
            <p><strong>User:</strong> {user ? `${user.name} (${user.email})` : 'Not logged in'}</p>
            <p><strong>Token:</strong> {token ? 'Present' : 'Missing'}</p>
            <p><strong>Backend URL:</strong> http://localhost:8001</p>
            <p><strong>Frontend URL:</strong> http://localhost:8080</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestIntegration; 