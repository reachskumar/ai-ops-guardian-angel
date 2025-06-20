
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  AlertTriangle, 
  HelpCircle, 
  CheckCircle, 
  ExternalLink,
  MessageCircle,
  Book,
  Bug,
  Zap,
  Shield,
  Cloud
} from "lucide-react";

const TroubleshootingGuide: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const commonIssues = [
    {
      id: "login-issues",
      category: "Authentication",
      title: "Unable to Login or Access Issues",
      icon: <Shield className="h-5 w-5" />,
      severity: "High",
      frequency: "Common",
      symptoms: [
        "Login page not loading",
        "Invalid credentials error",
        "Two-factor authentication issues",
        "Session timeout problems"
      ],
      solutions: [
        {
          step: "Check Browser and Cache",
          details: [
            "Clear browser cache and cookies",
            "Try incognito/private browsing mode",
            "Disable browser extensions temporarily",
            "Try a different browser"
          ]
        },
        {
          step: "Verify Credentials",
          details: [
            "Confirm username and password are correct",
            "Check if account is locked or suspended",
            "Reset password if necessary",
            "Contact admin for account verification"
          ]
        },
        {
          step: "Two-Factor Authentication",
          details: [
            "Ensure mobile device time is synchronized",
            "Try regenerating 2FA codes",
            "Use backup codes if available",
            "Contact support for 2FA reset"
          ]
        }
      ],
      relatedArticles: ["Account Setup", "Password Reset", "2FA Configuration"]
    },
    {
      id: "cloud-connection",
      category: "Cloud Integration",
      title: "Cloud Provider Connection Failures",
      icon: <Cloud className="h-5 w-5" />,
      severity: "High",
      frequency: "Common",
      symptoms: [
        "Connection timeout errors",
        "Invalid credentials for cloud provider",
        "Sync failures with cloud accounts",
        "Missing resources in inventory"
      ],
      solutions: [
        {
          step: "Verify Cloud Credentials",
          details: [
            "Check if API keys are correct and active",
            "Ensure proper IAM permissions are configured",
            "Verify account access and subscription status",
            "Test credentials directly with cloud provider console"
          ]
        },
        {
          step: "Network and Connectivity",
          details: [
            "Check internet connection stability",
            "Verify firewall and proxy settings",
            "Test connectivity to cloud provider endpoints",
            "Check for regional service outages"
          ]
        },
        {
          step: "Permissions and Roles",
          details: [
            "Ensure service account has required permissions",
            "Check for policy restrictions or changes",
            "Verify cross-account access if applicable",
            "Update IAM roles if permissions changed"
          ]
        }
      ],
      relatedArticles: ["Cloud Provider Setup", "API Key Management", "IAM Configuration"]
    },
    {
      id: "slow-performance",
      category: "Performance",
      title: "Slow Loading or Performance Issues",
      icon: <Zap className="h-5 w-5" />,
      severity: "Medium",
      frequency: "Occasional",
      symptoms: [
        "Dashboard loads slowly",
        "Resource lists take time to appear",
        "Charts and graphs don't render",
        "Timeout errors during operations"
      ],
      solutions: [
        {
          step: "Browser Optimization",
          details: [
            "Close unnecessary browser tabs",
            "Clear browser cache regularly",
            "Disable heavy browser extensions",
            "Update browser to latest version"
          ]
        },
        {
          step: "Network Diagnostics",
          details: [
            "Check internet connection speed",
            "Run network diagnostic tools",
            "Try different network connection",
            "Contact ISP if issues persist"
          ]
        },
        {
          step: "Data and Filters",
          details: [
            "Reduce data range for large datasets",
            "Apply filters to limit resource queries",
            "Paginate through large lists",
            "Use search instead of browsing all items"
          ]
        }
      ],
      relatedArticles: ["Performance Optimization", "Browser Requirements", "Network Troubleshooting"]
    },
    {
      id: "missing-data",
      category: "Data Sync",
      title: "Missing or Incorrect Data",
      icon: <Bug className="h-5 w-5" />,
      severity: "Medium",
      frequency: "Occasional",
      symptoms: [
        "Resources not appearing in inventory",
        "Outdated resource information",
        "Incorrect cost calculations",
        "Missing security scan results"
      ],
      solutions: [
        {
          step: "Force Data Sync",
          details: [
            "Use the refresh button on affected pages",
            "Trigger manual sync from cloud accounts page",
            "Wait for scheduled sync to complete",
            "Check sync status and error logs"
          ]
        },
        {
          step: "Verify Account Connections",
          details: [
            "Ensure all cloud accounts are connected",
            "Check for authentication errors",
            "Verify account permissions haven't changed",
            "Re-authenticate if necessary"
          ]
        },
        {
          step: "Data Source Validation",
          details: [
            "Confirm resources exist in cloud provider console",
            "Check if resources are in supported regions",
            "Verify resource types are supported",
            "Look for any provider-specific limitations"
          ]
        }
      ],
      relatedArticles: ["Data Synchronization", "Supported Resources", "Account Management"]
    }
  ];

  const quickFixes = [
    {
      title: "Clear Browser Cache",
      description: "Resolves most loading and display issues",
      steps: ["Open browser settings", "Find 'Clear browsing data'", "Select cache and cookies", "Restart browser"]
    },
    {
      title: "Refresh Page",
      description: "Updates data and resolves temporary glitches",
      steps: ["Press F5 or Ctrl+R", "Use browser refresh button", "Try hard refresh (Ctrl+Shift+R)", "Clear cache if needed"]
    },
    {
      title: "Check Internet Connection",
      description: "Ensures stable connectivity for all features",
      steps: ["Test connection speed", "Try different network", "Restart router/modem", "Contact ISP if needed"]
    },
    {
      title: "Update Browser",
      description: "Ensures compatibility with latest features",
      steps: ["Check browser version", "Download latest update", "Restart browser", "Clear cache after update"]
    }
  ];

  const supportChannels = [
    {
      channel: "Documentation",
      description: "Comprehensive guides and tutorials",
      icon: <Book className="h-5 w-5" />,
      action: "Browse Docs",
      available: "24/7"
    },
    {
      channel: "Community Forum",
      description: "Get help from other users and experts",
      icon: <MessageCircle className="h-5 w-5" />,
      action: "Visit Forum",
      available: "24/7"
    },
    {
      channel: "Email Support",
      description: "Direct support for technical issues",
      icon: <HelpCircle className="h-5 w-5" />,
      action: "Send Email",
      available: "Business Hours"
    },
    {
      channel: "Live Chat",
      description: "Real-time assistance from support team",
      icon: <MessageCircle className="h-5 w-5" />,
      action: "Start Chat",
      available: "Business Hours"
    }
  ];

  const filteredIssues = commonIssues.filter(issue =>
    issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.symptoms.some(symptom => symptom.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for issues, symptoms, or solutions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="common-issues" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="common-issues">Common Issues</TabsTrigger>
          <TabsTrigger value="quick-fixes">Quick Fixes</TabsTrigger>
          <TabsTrigger value="support">Get Support</TabsTrigger>
        </TabsList>

        <TabsContent value="common-issues">
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <Card key={issue.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {issue.icon}
                      <div>
                        <CardTitle className="text-lg">{issue.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{issue.category}</Badge>
                          <Badge variant={issue.severity === 'High' ? 'destructive' : 'secondary'}>
                            {issue.severity}
                          </Badge>
                          <Badge variant="outline">{issue.frequency}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="symptoms" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
                      <TabsTrigger value="solutions">Solutions</TabsTrigger>
                      <TabsTrigger value="related">Related</TabsTrigger>
                    </TabsList>

                    <TabsContent value="symptoms">
                      <div className="space-y-2">
                        {issue.symptoms.map((symptom, index) => (
                          <div key={index} className="flex items-start space-x-2 p-2 bg-red-50 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{symptom}</span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="solutions">
                      <div className="space-y-4">
                        {issue.solutions.map((solution, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2 flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>{solution.step}</span>
                            </h4>
                            <ul className="space-y-1 ml-6">
                              {solution.details.map((detail, detailIndex) => (
                                <li key={detailIndex} className="text-sm text-muted-foreground">
                                  • {detail}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="related">
                      <div className="space-y-2">
                        {issue.relatedArticles.map((article, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                            <span className="text-sm">{article}</span>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quick-fixes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickFixes.map((fix, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{fix.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{fix.description}</p>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {fix.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start space-x-2">
                        <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                          {stepIndex + 1}
                        </div>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="support">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Need More Help?</CardTitle>
                <p className="text-muted-foreground">
                  If you can't find a solution here, our support team is ready to help
                </p>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supportChannels.map((channel, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      {channel.icon}
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{channel.channel}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{channel.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{channel.available}</Badge>
                          <Button size="sm">
                            {channel.action}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TroubleshootingGuide;
