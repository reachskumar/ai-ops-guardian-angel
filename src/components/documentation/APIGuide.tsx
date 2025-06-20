
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Code, 
  Key, 
  Shield, 
  Zap, 
  Copy, 
  ExternalLink,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

const APIGuide: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const apiEndpoints = [
    {
      category: "Authentication",
      endpoints: [
        {
          method: "POST",
          path: "/api/auth/login",
          description: "Authenticate user and get access token",
          parameters: [
            { name: "email", type: "string", required: true, description: "User email address" },
            { name: "password", type: "string", required: true, description: "User password" }
          ],
          example: {
            request: `curl -X POST https://api.cloudops.com/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'`,
            response: `{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "role": "admin"
  }
}`
          }
        },
        {
          method: "POST",
          path: "/api/auth/refresh",
          description: "Refresh access token",
          parameters: [
            { name: "refresh_token", type: "string", required: true, description: "Valid refresh token" }
          ],
          example: {
            request: `curl -X POST https://api.cloudops.com/auth/refresh \\
  -H "Content-Type: application/json" \\
  -d '{
    "refresh_token": "refresh_token_here"
  }'`,
            response: `{
  "success": true,
  "token": "new_access_token_here",
  "expires_in": 3600
}`
          }
        }
      ]
    },
    {
      category: "Cloud Resources",
      endpoints: [
        {
          method: "GET",
          path: "/api/resources",
          description: "List all cloud resources",
          parameters: [
            { name: "provider", type: "string", required: false, description: "Filter by cloud provider (aws, azure, gcp)" },
            { name: "type", type: "string", required: false, description: "Filter by resource type" },
            { name: "region", type: "string", required: false, description: "Filter by region" },
            { name: "limit", type: "integer", required: false, description: "Number of resources to return (default: 50)" },
            { name: "offset", type: "integer", required: false, description: "Pagination offset (default: 0)" }
          ],
          example: {
            request: `curl -X GET "https://api.cloudops.com/resources?provider=aws&type=ec2&limit=10" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`,
            response: `{
  "success": true,
  "data": [
    {
      "id": "resource-123",
      "name": "web-server-01",
      "type": "ec2",
      "provider": "aws",
      "region": "us-east-1",
      "status": "running",
      "created_at": "2024-01-15T10:30:00Z",
      "cost_per_day": 24.50
    }
  ],
  "total": 42,
  "limit": 10,
  "offset": 0
}`
          }
        },
        {
          method: "GET",
          path: "/api/resources/{id}",
          description: "Get detailed information about a specific resource",
          parameters: [
            { name: "id", type: "string", required: true, description: "Resource ID" }
          ],
          example: {
            request: `curl -X GET "https://api.cloudops.com/resources/resource-123" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`,
            response: `{
  "success": true,
  "data": {
    "id": "resource-123",
    "name": "web-server-01",
    "type": "ec2",
    "provider": "aws",
    "region": "us-east-1",
    "status": "running",
    "metadata": {
      "instance_type": "t3.medium",
      "ami_id": "ami-12345678",
      "key_name": "my-key-pair"
    },
    "tags": {
      "Environment": "production",
      "Team": "backend"
    },
    "cost_per_day": 24.50,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:22:00Z"
  }
}`
          }
        }
      ]
    },
    {
      category: "Monitoring",
      endpoints: [
        {
          method: "GET",
          path: "/api/metrics/{resource_id}",
          description: "Get metrics for a specific resource",
          parameters: [
            { name: "resource_id", type: "string", required: true, description: "Resource ID" },
            { name: "metric", type: "string", required: false, description: "Specific metric name (cpu, memory, disk, network)" },
            { name: "start_time", type: "string", required: false, description: "Start time (ISO 8601 format)" },
            { name: "end_time", type: "string", required: false, description: "End time (ISO 8601 format)" },
            { name: "interval", type: "string", required: false, description: "Data interval (1m, 5m, 1h, 1d)" }
          ],
          example: {
            request: `curl -X GET "https://api.cloudops.com/metrics/resource-123?metric=cpu&interval=5m" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`,
            response: `{
  "success": true,
  "data": {
    "resource_id": "resource-123",
    "metric": "cpu",
    "unit": "percent",
    "interval": "5m",
    "data_points": [
      {
        "timestamp": "2024-01-20T10:00:00Z",
        "value": 45.2
      },
      {
        "timestamp": "2024-01-20T10:05:00Z",
        "value": 52.1
      }
    ]
  }
}`
          }
        }
      ]
    },
    {
      category: "Security",
      endpoints: [
        {
          method: "POST",
          path: "/api/security/scan",
          description: "Trigger a security scan",
          parameters: [
            { name: "scan_type", type: "string", required: true, description: "Type of scan (vulnerability, compliance, configuration)" },
            { name: "target_type", type: "string", required: true, description: "Target type (resource, account, all)" },
            { name: "target_id", type: "string", required: false, description: "Specific target ID (required if target_type is resource or account)" }
          ],
          example: {
            request: `curl -X POST https://api.cloudops.com/security/scan \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "scan_type": "vulnerability",
    "target_type": "resource",
    "target_id": "resource-123"
  }'`,
            response: `{
  "success": true,
  "scan_id": "scan-456",
  "status": "started",
  "estimated_completion": "2024-01-20T11:30:00Z"
}`
          }
        }
      ]
    }
  ];

  const sdkExamples = [
    {
      language: "JavaScript",
      code: `// Install: npm install @cloudops/sdk

import { CloudOpsClient } from '@cloudops/sdk';

const client = new CloudOpsClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.cloudops.com'
});

// Get all resources
const resources = await client.resources.list({
  provider: 'aws',
  type: 'ec2'
});

// Get specific resource
const resource = await client.resources.get('resource-123');

// Get metrics
const metrics = await client.metrics.get('resource-123', {
  metric: 'cpu',
  interval: '5m'
});`
    },
    {
      language: "Python",
      code: `# Install: pip install cloudops-sdk

from cloudops_sdk import CloudOpsClient

client = CloudOpsClient(
    api_key='your-api-key',
    base_url='https://api.cloudops.com'
)

# Get all resources
resources = client.resources.list(
    provider='aws',
    type='ec2'
)

# Get specific resource
resource = client.resources.get('resource-123')

# Get metrics
metrics = client.metrics.get(
    resource_id='resource-123',
    metric='cpu',
    interval='5m'
)`
    },
    {
      language: "Go",
      code: `// Install: go get github.com/cloudops/go-sdk

package main

import (
    "github.com/cloudops/go-sdk/cloudops"
)

func main() {
    client := cloudops.NewClient(&cloudops.Config{
        APIKey:  "your-api-key",
        BaseURL: "https://api.cloudops.com",
    })

    // Get all resources
    resources, err := client.Resources.List(&cloudops.ListResourcesParams{
        Provider: "aws",
        Type:     "ec2",
    })

    // Get specific resource
    resource, err := client.Resources.Get("resource-123")

    // Get metrics
    metrics, err := client.Metrics.Get("resource-123", &cloudops.MetricsParams{
        Metric:   "cpu",
        Interval: "5m",
    })
}`
    }
  ];

  const rateLimits = [
    { endpoint: "Authentication", limit: "10 requests/minute", burst: "20 requests" },
    { endpoint: "Resources", limit: "100 requests/minute", burst: "200 requests" },
    { endpoint: "Metrics", limit: "1000 requests/minute", burst: "2000 requests" },
    { endpoint: "Security Scans", limit: "5 requests/minute", burst: "10 requests" }
  ];

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-6 w-6" />
            <span>CloudOps API Documentation</span>
          </CardTitle>
          <p className="text-muted-foreground">
            RESTful API for managing cloud infrastructure, monitoring, and security
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Shield className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-medium">Secure</h3>
              <p className="text-sm text-muted-foreground">API key and OAuth2 authentication</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Zap className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-medium">Fast</h3>
              <p className="text-sm text-muted-foreground">Optimized for high performance</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Code className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <h3 className="font-medium">RESTful</h3>
              <p className="text-sm text-muted-foreground">Standard HTTP methods and status codes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="endpoints" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="sdks">SDKs</TabsTrigger>
          <TabsTrigger value="limits">Rate Limits</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints">
          <div className="space-y-6">
            {apiEndpoints.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader>
                  <CardTitle>{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {category.endpoints.map((endpoint, endpointIndex) => (
                      <div key={endpointIndex} className="border rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <Badge variant={endpoint.method === 'GET' ? 'default' : endpoint.method === 'POST' ? 'secondary' : 'destructive'}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4">{endpoint.description}</p>

                        <Tabs defaultValue="parameters" className="space-y-4">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="parameters">Parameters</TabsTrigger>
                            <TabsTrigger value="example">Example</TabsTrigger>
                          </TabsList>

                          <TabsContent value="parameters">
                            <div className="space-y-2">
                              {endpoint.parameters.map((param, paramIndex) => (
                                <div key={paramIndex} className="flex items-start space-x-3 p-3 border rounded-lg">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <code className="text-sm font-mono">{param.name}</code>
                                      <Badge variant="outline" className="text-xs">{param.type}</Badge>
                                      {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{param.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TabsContent>

                          <TabsContent value="example">
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium">Request</h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(endpoint.example.request, `request-${categoryIndex}-${endpointIndex}`)}
                                  >
                                    {copiedCode === `request-${categoryIndex}-${endpointIndex}` ? (
                                      <CheckCircle className="h-4 w-4" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                                <pre className="text-sm bg-muted p-3 rounded-lg overflow-x-auto">
                                  <code>{endpoint.example.request}</code>
                                </pre>
                              </div>
                              
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium">Response</h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(endpoint.example.response, `response-${categoryIndex}-${endpointIndex}`)}
                                  >
                                    {copiedCode === `response-${categoryIndex}-${endpointIndex}` ? (
                                      <CheckCircle className="h-4 w-4" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                                <pre className="text-sm bg-muted p-3 rounded-lg overflow-x-auto">
                                  <code>{endpoint.example.response}</code>
                                </pre>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="authentication">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>API Authentication</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">API Key Authentication</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Include your API key in the Authorization header of every request.
                  </p>
                  <div className="bg-muted p-3 rounded-lg">
                    <code className="text-sm">Authorization: Bearer YOUR_API_KEY</code>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Getting an API Key</h3>
                  <ol className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">1</div>
                      <span>Navigate to Settings → API Keys in your dashboard</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">2</div>
                      <span>Click "Create New API Key"</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">3</div>
                      <span>Give your key a name and select permissions</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">4</div>
                      <span>Copy and securely store your API key</span>
                    </li>
                  </ol>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Security Best Practices</h4>
                      <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                        <li>• Never expose API keys in client-side code</li>
                        <li>• Rotate API keys regularly</li>
                        <li>• Use environment variables to store keys</li>
                        <li>• Limit key permissions to minimum required</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sdks">
          <div className="space-y-4">
            {sdkExamples.map((sdk, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{sdk.language} SDK</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(sdk.code, `sdk-${index}`)}
                    >
                      {copiedCode === `sdk-${index}` ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{sdk.code}</code>
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="limits">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limits</CardTitle>
              <p className="text-muted-foreground">
                API rate limits help ensure fair usage and system stability
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Endpoint Category</th>
                        <th className="text-left py-2 px-4">Rate Limit</th>
                        <th className="text-left py-2 px-4">Burst Limit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rateLimits.map((limit, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{limit.endpoint}</td>
                          <td className="py-3 px-4">{limit.limit}</td>
                          <td className="py-3 px-4">{limit.burst}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Rate Limit Headers</h4>
                  <p className="text-sm text-blue-800 mb-2">
                    Every API response includes rate limit information in the headers:
                  </p>
                  <div className="space-y-1 text-sm font-mono text-blue-700">
                    <div>X-RateLimit-Limit: Maximum requests per time window</div>
                    <div>X-RateLimit-Remaining: Remaining requests in current window</div>
                    <div>X-RateLimit-Reset: Unix timestamp when limit resets</div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Rate Limit Exceeded</h4>
                  <p className="text-sm text-red-800">
                    When rate limits are exceeded, the API returns HTTP 429 status code with a Retry-After header
                    indicating when to retry the request.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIGuide;
