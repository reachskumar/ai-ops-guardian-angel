import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Key, 
  GitBranch,
  MessageSquare,
  BarChart3,
  Zap,
  Database,
  ExternalLink,
  Download,
  Settings
} from 'lucide-react';

const IntegrationGuide: React.FC = () => {
  const integrationGuides = [
    {
      category: 'Security Tools',
      integrations: [
        {
          name: 'Trivy',
          description: 'Container vulnerability scanner',
          icon: <Shield className="w-5 h-5" />,
          setup: [
            'Install Trivy: `curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin`',
            'Verify installation: `trivy --version`',
            'Configure path in integration settings',
            'Test with: `trivy image alpine:latest`'
          ],
          docs: 'https://aquasecurity.github.io/trivy/',
          benefits: ['Vulnerability scanning', 'CVE detection', 'Compliance checks']
        },
        {
          name: 'Gitleaks',
          description: 'Secrets detection in repositories',
          icon: <Key className="w-5 h-5" />,
          setup: [
            'Install Gitleaks: `brew install gitleaks` (macOS) or download from GitHub',
            'Verify installation: `gitleaks version`',
            'Configure path in integration settings',
            'Test with: `gitleaks detect --source .`'
          ],
          docs: 'https://github.com/gitleaks/gitleaks',
          benefits: ['Secret detection', 'Git history scanning', 'Custom patterns']
        },
        {
          name: 'ScoutSuite',
          description: 'Cloud security posture assessment',
          icon: <Shield className="w-5 h-5" />,
          setup: [
            'Install ScoutSuite: `pip install scoutsuite`',
            'Configure AWS credentials',
            'Run assessment: `scout aws --profile default`',
            'View results in generated HTML report'
          ],
          docs: 'https://github.com/nccgroup/ScoutSuite',
          benefits: ['Cloud security assessment', 'Compliance reporting', 'Risk analysis']
        }
      ]
    },
    {
      category: 'GitOps & CI/CD',
      integrations: [
        {
          name: 'GitHub',
          description: 'GitHub repository integration',
          icon: <GitBranch className="w-5 h-5" />,
          setup: [
            'Create GitHub Personal Access Token',
            'Go to GitHub Settings > Developer settings > Personal access tokens',
            'Generate token with repo, workflow, and admin:org scopes',
            'Configure organization name (optional)',
            'Test API access'
          ],
          docs: 'https://docs.github.com/en/rest',
          benefits: ['Repository management', 'Workflow automation', 'Webhook integration']
        },
        {
          name: 'Jenkins',
          description: 'Jenkins CI/CD server',
          icon: <Zap className="w-5 h-5" />,
          setup: [
            'Install Jenkins server',
            'Create API token: Manage Jenkins > Configure > API Token',
            'Configure Jenkins URL (e.g., http://jenkins:8080)',
            'Test connection with username and API token',
            'Verify job access permissions'
          ],
          docs: 'https://www.jenkins.io/doc/book/using/remote-access-api/',
          benefits: ['Pipeline management', 'Build automation', 'Job monitoring']
        },
        {
          name: 'ArgoCD',
          description: 'GitOps continuous deployment',
          icon: <GitBranch className="w-5 h-5" />,
          setup: [
            'Install ArgoCD server',
            'Create API token: `argocd account generate-token`',
            'Configure ArgoCD server URL',
            'Test API access',
            'Verify application permissions'
          ],
          docs: 'https://argo-cd.readthedocs.io/en/stable/',
          benefits: ['GitOps workflows', 'Kubernetes deployment', 'Application sync']
        }
      ]
    },
    {
      category: 'Monitoring & Observability',
      integrations: [
        {
          name: 'Prometheus',
          description: 'Metrics collection and alerting',
          icon: <BarChart3 className="w-5 h-5" />,
          setup: [
            'Install Prometheus server',
            'Configure scrape targets',
            'Set up Prometheus URL (e.g., http://prometheus:9090)',
            'Test API endpoint: `/api/v1/status/config`',
            'Verify metrics collection'
          ],
          docs: 'https://prometheus.io/docs/',
          benefits: ['Metrics collection', 'Alerting', 'Time series data']
        },
        {
          name: 'Grafana',
          description: 'Visualization and dashboards',
          icon: <BarChart3 className="w-5 h-5" />,
          setup: [
            'Install Grafana server',
            'Create API key: Configuration > API Keys',
            'Configure Grafana URL',
            'Test API access',
            'Verify dashboard permissions'
          ],
          docs: 'https://grafana.com/docs/grafana/latest/developers/http_api/',
          benefits: ['Dashboard creation', 'Data visualization', 'Alert management']
        }
      ]
    },
    {
      category: 'Communication & ChatOps',
      integrations: [
        {
          name: 'Slack',
          description: 'Slack notifications and ChatOps',
          icon: <MessageSquare className="w-5 h-5" />,
          setup: [
            'Create Slack app: https://api.slack.com/apps',
            'Generate Bot User OAuth Token',
            'Add bot to workspace',
            'Configure channel ID',
            'Test message sending'
          ],
          docs: 'https://api.slack.com/',
          benefits: ['Real-time notifications', 'ChatOps workflows', 'Team collaboration']
        },
        {
          name: 'Microsoft Teams',
          description: 'Teams notifications and ChatOps',
          icon: <MessageSquare className="w-5 h-5" />,
          setup: [
            'Create Teams webhook: Channel > Connectors > Incoming Webhook',
            'Configure webhook URL',
            'Set channel name (optional)',
            'Test message sending',
            'Configure notification types'
          ],
          docs: 'https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/',
          benefits: ['Team notifications', 'Integration workflows', 'Enterprise collaboration']
        }
      ]
    },
    {
      category: 'Database & Storage',
      integrations: [
        {
          name: 'MongoDB Atlas',
          description: 'MongoDB Atlas connection',
          icon: <Database className="w-5 h-5" />,
          setup: [
            'Create MongoDB Atlas cluster',
            'Generate connection string',
            'Configure database name',
            'Test connection',
            'Set up collections and indexes'
          ],
          docs: 'https://docs.atlas.mongodb.com/',
          benefits: ['Document storage', 'Scalable database', 'Cloud-native']
        },
        {
          name: 'Redis',
          description: 'Redis cache connection',
          icon: <Database className="w-5 h-5" />,
          setup: [
            'Install Redis server',
            'Configure Redis URL (e.g., redis://localhost:6379)',
            'Set password (optional)',
            'Test connection',
            'Configure database number'
          ],
          docs: 'https://redis.io/documentation',
          benefits: ['Caching', 'Session storage', 'Real-time data']
        }
      ]
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Integration Setup Guide</h1>
        <p className="text-gray-600">
          Learn how to configure external tools and services to enhance your AI-Ops platform capabilities.
        </p>
      </div>

      <div className="space-y-8">
        {integrationGuides.map(category => (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {category.category}
                <Badge variant="secondary">{category.integrations.length} integrations</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {category.integrations.map(integration => (
                  <Card key={integration.name} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {integration.icon}
                        {integration.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{integration.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Setup Steps */}
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Setup Steps
                        </h4>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                          {integration.setup.map((step, index) => (
                            <li key={index} className="pl-2">{step}</li>
                          ))}
                        </ol>
                      </div>

                      {/* Benefits */}
                      <div>
                        <h4 className="font-medium text-sm mb-2">Benefits</h4>
                        <div className="flex flex-wrap gap-1">
                          {integration.benefits.map((benefit, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Documentation */}
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        <a 
                          href={integration.docs} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Documentation
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Start Tips */}
      <Card className="mt-8 border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Quick Start Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Essential Integrations</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• <strong>GitHub</strong> - For repository management and CI/CD</li>
                <li>• <strong>Trivy</strong> - For container security scanning</li>
                <li>• <strong>Slack/Teams</strong> - For notifications and ChatOps</li>
                <li>• <strong>Prometheus</strong> - For monitoring and alerting</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Security Best Practices</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Use environment variables for sensitive data</li>
                <li>• Rotate API tokens regularly</li>
                <li>• Limit integration permissions to minimum required</li>
                <li>• Monitor integration usage and logs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="mt-6 border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle>Troubleshooting Common Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Connection Issues</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Verify network connectivity and firewall settings</li>
                <li>• Check API endpoints and authentication credentials</li>
                <li>• Ensure required permissions are granted</li>
                <li>• Test with curl or Postman before integration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Permission Issues</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Verify API tokens have correct scopes</li>
                <li>• Check user/role permissions in external tools</li>
                <li>• Ensure service accounts have proper access</li>
                <li>• Review audit logs for access denied errors</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationGuide; 