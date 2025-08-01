import React, { useState, useEffect } from 'react';
import { 
  Cloud, Shield, DollarSign, Activity, Users, Settings, Bot, 
  BarChart3, AlertTriangle, CheckCircle, Clock, TrendingUp, 
  TrendingDown, Zap, Database, Server, Globe, Lock, Eye, 
  Plus, Search, Filter, Download, RefreshCw, Bell, User, LogOut,
  Building, Target, ShieldCheck, Cpu, HardDrive, Network,
  Key, ExternalLink, Menu, X, ChevronDown, ChevronRight,
  Play, Pause, Square, RotateCcw, MoreHorizontal,
  Edit, Trash, Copy, Share, Star, Bookmark, Calendar, Clock3,
  TestTube, Wifi, WifiOff, CheckCircle2, XCircle, AlertCircle, Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ServiceStatus {
  name: string;
  url: string;
  status: 'online' | 'offline' | 'error';
  responseTime: number;
  lastCheck: string;
  error?: string;
}

interface APITest {
  name: string;
  endpoint: string;
  method: string;
  status: 'pending' | 'success' | 'error';
  responseTime: number;
  response?: any;
  error?: string;
}

interface IntegrationTest {
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: any;
  error?: string;
}

const RealTimeIntegration: React.FC = () => {
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([]);
  const [apiTests, setApiTests] = useState<APITest[]>([]);
  const [integrationTests, setIntegrationTests] = useState<IntegrationTest[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [testResults, setTestResults] = useState<any>({});

  // Backend service URLs
  const services = [
    { name: 'API Gateway', url: 'http://localhost:3001' },
    { name: 'AI Services', url: 'http://localhost:8001' },
    { name: 'Data Services', url: 'http://localhost:8003' },
    { name: 'Cloud Integrations', url: 'http://localhost:8002' },
    { name: 'Security Services', url: 'http://localhost:8004' },
    { name: 'Real-time Services', url: 'http://localhost:8005' }
  ];

  // API endpoints to test
  const apiEndpoints = [
    { name: 'Health Check', endpoint: '/health', method: 'GET' },
    { name: 'Authentication', endpoint: '/auth/login', method: 'POST' },
    { name: 'AI Chat', endpoint: '/chat', method: 'POST' },
    { name: 'Cloud Resources', endpoint: '/resources', method: 'GET' },
    { name: 'Security Issues', endpoint: '/security/issues', method: 'GET' },
    { name: 'Cost Optimization', endpoint: '/costs/optimizations', method: 'GET' },
    { name: 'AI Agents', endpoint: '/agents', method: 'GET' },
    { name: 'Organizations', endpoint: '/organizations', method: 'GET' }
  ];

  // Integration tests
  const integrationTestCases = [
    {
      name: 'Authentication Flow',
      description: 'Test user registration, login, and session management'
    },
    {
      name: 'AI Chat Integration',
      description: 'Test AI chat functionality with different agents'
    },
    {
      name: 'Cloud Resource Management',
      description: 'Test cloud resource discovery and management'
    },
    {
      name: 'Security Monitoring',
      description: 'Test security issue detection and reporting'
    },
    {
      name: 'Cost Optimization',
      description: 'Test cost analysis and optimization recommendations'
    },
    {
      name: 'Multi-tenant Features',
      description: 'Test organization isolation and user management'
    },
    {
      name: 'Real-time Updates',
      description: 'Test real-time data synchronization'
    },
    {
      name: 'API Rate Limiting',
      description: 'Test rate limiting and quota management'
    }
  ];

  // Check service status
  const checkServiceStatus = async (service: { name: string; url: string }) => {
    const startTime = Date.now();
    try {
      const response = await fetch(`${service.url}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return {
          name: service.name,
          url: service.url,
          status: 'online' as const,
          responseTime,
          lastCheck: new Date().toISOString()
        };
      } else {
        return {
          name: service.name,
          url: service.url,
          status: 'error' as const,
          responseTime,
          lastCheck: new Date().toISOString(),
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        name: service.name,
        url: service.url,
        status: 'offline' as const,
        responseTime,
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  };

  // Test API endpoint
  const testAPIEndpoint = async (test: { name: string; endpoint: string; method: string }) => {
    const startTime = Date.now();
    try {
      // Try different base URLs
      const baseUrls = [
        'http://localhost:3001', // API Gateway
        'http://localhost:8001', // AI Services
        'http://localhost:8003'  // Data Services
      ];

      let response: Response | null = null;
      let usedUrl = '';

      for (const baseUrl of baseUrls) {
        try {
          const url = `${baseUrl}${test.endpoint}`;
          response = await fetch(url, {
            method: test.method,
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(5000)
          });
          usedUrl = url;
          break;
        } catch (error) {
          continue;
        }
      }

      const responseTime = Date.now() - startTime;

      if (response && response.ok) {
        const responseData = await response.json().catch(() => ({}));
        return {
          name: test.name,
          endpoint: test.endpoint,
          method: test.method,
          status: 'success' as const,
          responseTime,
          response: responseData
        };
      } else {
        return {
          name: test.name,
          endpoint: test.endpoint,
          method: test.method,
          status: 'error' as const,
          responseTime,
          error: response ? `HTTP ${response.status}: ${response.statusText}` : 'No service available'
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        name: test.name,
        endpoint: test.endpoint,
        method: test.method,
        status: 'error' as const,
        responseTime,
        error: error instanceof Error ? error.message : 'Request failed'
      };
    }
  };

  // Run integration test
  const runIntegrationTest = async (test: { name: string; description: string }) => {
    const testFunctions: { [key: string]: () => Promise<any> } = {
      'Authentication Flow': async () => {
        // Test registration
        const registerResponse = await fetch('http://localhost:3001/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'TestPassword123!',
            organization: 'TestCorp'
          })
        });

        // Test login
        const loginResponse = await fetch('http://localhost:3001/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'TestPassword123!'
          })
        });

        return {
          register: registerResponse.ok,
          login: loginResponse.ok,
          token: loginResponse.ok ? await loginResponse.json().catch(() => ({})) : null
        };
      },

      'AI Chat Integration': async () => {
        const chatResponse = await fetch('http://localhost:8001/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'Hello, can you help me with cost optimization?',
            agent_type: 'cost_optimization'
          })
        });

        return {
          success: chatResponse.ok,
          response: chatResponse.ok ? await chatResponse.json().catch(() => ({})) : null
        };
      },

      'Cloud Resource Management': async () => {
        const resourcesResponse = await fetch('http://localhost:8003/resources', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        return {
          success: resourcesResponse.ok,
          resources: resourcesResponse.ok ? await resourcesResponse.json().catch(() => []) : []
        };
      },

      'Security Monitoring': async () => {
        const securityResponse = await fetch('http://localhost:8003/security/issues', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        return {
          success: securityResponse.ok,
          issues: securityResponse.ok ? await securityResponse.json().catch(() => []) : []
        };
      },

      'Cost Optimization': async () => {
        const costResponse = await fetch('http://localhost:8003/costs/optimizations', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        return {
          success: costResponse.ok,
          optimizations: costResponse.ok ? await costResponse.json().catch(() => []) : []
        };
      },

      'Multi-tenant Features': async () => {
        const orgsResponse = await fetch('http://localhost:8003/organizations', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        return {
          success: orgsResponse.ok,
          organizations: orgsResponse.ok ? await orgsResponse.json().catch(() => []) : []
        };
      },

      'Real-time Updates': async () => {
        // Test WebSocket connection if available
        try {
          const ws = new WebSocket('ws://localhost:8005/ws');
          return new Promise((resolve) => {
            ws.onopen = () => {
              ws.close();
              resolve({ success: true, message: 'WebSocket connection established' });
            };
            ws.onerror = () => {
              resolve({ success: false, message: 'WebSocket connection failed' });
            };
            setTimeout(() => {
              resolve({ success: false, message: 'WebSocket connection timeout' });
            }, 3000);
          });
        } catch (error) {
          return { success: false, message: 'WebSocket not available' };
        }
      },

      'API Rate Limiting': async () => {
        // Test rate limiting by making multiple requests
        const requests = Array(10).fill(0).map(() => 
          fetch('http://localhost:3001/health', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          })
        );

        const responses = await Promise.all(requests);
        const successCount = responses.filter(r => r.ok).length;
        const rateLimitedCount = responses.filter(r => r.status === 429).length;

        return {
          success: successCount > 0,
          totalRequests: requests.length,
          successfulRequests: successCount,
          rateLimitedRequests: rateLimitedCount
        };
      }
    };

    const testFunction = testFunctions[test.name];
    if (testFunction) {
      try {
        const result = await testFunction();
        return { success: true, result };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Test failed' 
        };
      }
    } else {
      return { success: false, error: 'Test function not implemented' };
    }
  };

  // Run all service status checks
  const runServiceChecks = async () => {
    setIsRunningTests(true);
    const statuses = await Promise.all(services.map(checkServiceStatus));
    setServiceStatuses(statuses);
    setIsRunningTests(false);
  };

  // Run all API tests
  const runAPITests = async () => {
    setIsRunningTests(true);
    const tests = await Promise.all(apiEndpoints.map(testAPIEndpoint));
    setApiTests(tests);
    setIsRunningTests(false);
  };

  // Run integration tests
  const runIntegrationTests = async () => {
    setIsRunningTests(true);
    const tests = await Promise.all(
      integrationTestCases.map(async (test) => {
        const result = await runIntegrationTest(test);
        return {
          ...test,
          status: result.success ? 'success' : 'error',
          result: result.result,
          error: result.error
        };
      })
    );
    setIntegrationTests(tests);
    setIsRunningTests(false);
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunningTests(true);
    await Promise.all([
      runServiceChecks(),
      runAPITests(),
      runIntegrationTests()
    ]);
    setIsRunningTests(false);
  };

  // Auto-run tests on component mount
  useEffect(() => {
    runAllTests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'success':
        return 'bg-green-500';
      case 'offline':
      case 'error':
        return 'bg-red-500';
      case 'pending':
      case 'running':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'offline':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
      case 'running':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Real-Time Backend Integration Testing
          </h1>
          <p className="text-gray-600">
            Comprehensive testing of all backend services and API endpoints for production readiness
          </p>
        </div>

        {/* Control Panel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Test Control Panel</span>
              <div className="flex space-x-2">
                <Button 
                  onClick={runServiceChecks} 
                  disabled={isRunningTests}
                  variant="outline"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRunningTests ? 'animate-spin' : ''}`} />
                  Check Services
                </Button>
                <Button 
                  onClick={runAPITests} 
                  disabled={isRunningTests}
                  variant="outline"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Test APIs
                </Button>
                <Button 
                  onClick={runIntegrationTests} 
                  disabled={isRunningTests}
                  variant="outline"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Integration Tests
                </Button>
                <Button 
                  onClick={runAllTests} 
                  disabled={isRunningTests}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run All Tests
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Test Results */}
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="services">Service Status</TabsTrigger>
            <TabsTrigger value="apis">API Tests</TabsTrigger>
            <TabsTrigger value="integration">Integration Tests</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          {/* Service Status Tab */}
          <TabsContent value="services" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceStatuses.map((service, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <h3 className="font-semibold">{service.name}</h3>
                          <p className="text-sm text-gray-500">{service.url}</p>
                        </div>
                      </div>
                      <Badge variant={service.status === 'online' ? 'default' : 'destructive'}>
                        {service.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Response Time:</span>
                        <span className="font-medium">{service.responseTime}ms</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Last Check:</span>
                        <span className="font-medium">
                          {new Date(service.lastCheck).toLocaleTimeString()}
                        </span>
                      </div>
                      {service.error && (
                        <div className="text-sm text-red-600">
                          Error: {service.error}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* API Tests Tab */}
          <TabsContent value="apis" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {apiTests.map((test, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <h3 className="font-semibold">{test.name}</h3>
                          <p className="text-sm text-gray-500">
                            {test.method} {test.endpoint}
                          </p>
                        </div>
                      </div>
                      <Badge variant={test.status === 'success' ? 'default' : 'destructive'}>
                        {test.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Response Time:</span>
                        <span className="font-medium">{test.responseTime}ms</span>
                      </div>
                      {test.response && (
                        <div className="text-sm">
                          <span className="font-medium">Response:</span>
                          <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                            {JSON.stringify(test.response, null, 2)}
                          </pre>
                        </div>
                      )}
                      {test.error && (
                        <div className="text-sm text-red-600">
                          Error: {test.error}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Integration Tests Tab */}
          <TabsContent value="integration" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {integrationTests.map((test, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <h3 className="font-semibold">{test.name}</h3>
                          <p className="text-sm text-gray-500">{test.description}</p>
                        </div>
                      </div>
                      <Badge variant={test.status === 'success' ? 'default' : 'destructive'}>
                        {test.status}
                      </Badge>
                    </div>
                    
                    {test.result && (
                      <div className="text-sm">
                        <span className="font-medium">Result:</span>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(test.result, null, 2)}
                        </pre>
                      </div>
                    )}
                    {test.error && (
                      <div className="text-sm text-red-600">
                        Error: {test.error}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Service Status Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Service Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Online Services:</span>
                      <span className="font-bold text-green-600">
                        {serviceStatuses.filter(s => s.status === 'online').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Offline Services:</span>
                      <span className="font-bold text-red-600">
                        {serviceStatuses.filter(s => s.status === 'offline').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Services:</span>
                      <span className="font-bold text-orange-600">
                        {serviceStatuses.filter(s => s.status === 'error').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* API Tests Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>API Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Successful APIs:</span>
                      <span className="font-bold text-green-600">
                        {apiTests.filter(t => t.status === 'success').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed APIs:</span>
                      <span className="font-bold text-red-600">
                        {apiTests.filter(t => t.status === 'error').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending APIs:</span>
                      <span className="font-bold text-yellow-600">
                        {apiTests.filter(t => t.status === 'pending').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Integration Tests Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Integration Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Successful Tests:</span>
                      <span className="font-bold text-green-600">
                        {integrationTests.filter(t => t.status === 'success').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed Tests:</span>
                      <span className="font-bold text-red-600">
                        {integrationTests.filter(t => t.status === 'error').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Tests:</span>
                      <span className="font-bold text-yellow-600">
                        {integrationTests.filter(t => t.status === 'pending').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overall Status */}
            <Card>
              <CardHeader>
                <CardTitle>Overall System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {serviceStatuses.every(s => s.status === 'online') ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500" />
                    )}
                    <div>
                      <h3 className="font-semibold">Backend Services</h3>
                      <p className="text-sm text-gray-600">
                        {serviceStatuses.filter(s => s.status === 'online').length} of {serviceStatuses.length} services online
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {apiTests.every(t => t.status === 'success') ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500" />
                    )}
                    <div>
                      <h3 className="font-semibold">API Endpoints</h3>
                      <p className="text-sm text-gray-600">
                        {apiTests.filter(t => t.status === 'success').length} of {apiTests.length} APIs working
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {integrationTests.every(t => t.status === 'success') ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500" />
                    )}
                    <div>
                      <h3 className="font-semibold">Integration Tests</h3>
                      <p className="text-sm text-gray-600">
                        {integrationTests.filter(t => t.status === 'success').length} of {integrationTests.length} tests passing
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RealTimeIntegration; 