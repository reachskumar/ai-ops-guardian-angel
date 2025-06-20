
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Cloud, 
  Shield, 
  Users, 
  Settings, 
  BarChart3,
  AlertTriangle,
  FileText,
  Play,
  ExternalLink
} from "lucide-react";

const UserGuide: React.FC = () => {
  const [activeGuide, setActiveGuide] = useState("dashboard");

  const guides = [
    {
      id: "dashboard",
      title: "Dashboard Overview",
      icon: <Activity className="h-5 w-5" />,
      description: "Understanding your main dashboard and metrics",
      content: {
        overview: "The dashboard provides a real-time view of your infrastructure health, resource utilization, and key performance metrics.",
        sections: [
          {
            title: "Overview Cards",
            content: [
              "Total Resources: Shows count of all managed resources across cloud providers",
              "Active Alerts: Current number of unresolved alerts and notifications",
              "Average Health: Overall system health percentage based on monitoring data",
              "Monthly Costs: Current month's spending across all connected accounts"
            ]
          },
          {
            title: "Monitoring Charts",
            content: [
              "CPU Usage: Real-time CPU utilization across all resources",
              "Memory Usage: Memory consumption trends and patterns",
              "Network Traffic: Inbound and outbound network activity",
              "Storage Utilization: Disk usage and storage capacity metrics"
            ]
          },
          {
            title: "Resource Lists",
            content: [
              "Infrastructure Resources: List of servers, databases, and services",
              "Security Findings: Current security issues and vulnerabilities",
              "Recent Activities: Audit log of recent changes and actions"
            ]
          }
        ],
        tips: [
          "Use the refresh button to get the latest data",
          "Click on any metric card to see detailed information",
          "Set up custom alerts for proactive monitoring"
        ]
      }
    },
    {
      id: "cloud-resources",
      title: "Cloud Resources",
      icon: <Cloud className="h-5 w-5" />,
      description: "Managing your multi-cloud infrastructure",
      content: {
        overview: "Manage resources across AWS, Azure, and Google Cloud Platform from a single interface.",
        sections: [
          {
            title: "Connecting Cloud Accounts",
            content: [
              "Click 'Connect Provider' to add new cloud accounts",
              "Enter your cloud provider credentials securely",
              "Verify connection status and permissions",
              "Configure sync settings for automatic updates"
            ]
          },
          {
            title: "Resource Inventory",
            content: [
              "View all resources across connected cloud accounts",
              "Filter by provider, region, type, or status",
              "Search for specific resources by name or ID",
              "Export resource lists for reporting purposes"
            ]
          },
          {
            title: "Resource Actions",
            content: [
              "Start/Stop: Control resource power state",
              "Update: Modify resource configuration",
              "Delete: Remove resources (with confirmation)",
              "Tag Management: Organize resources with tags"
            ]
          }
        ],
        tips: [
          "Use tags consistently for better organization",
          "Regular sync ensures up-to-date resource information",
          "Monitor resource costs to optimize spending"
        ]
      }
    },
    {
      id: "security",
      title: "Security & Compliance",
      icon: <Shield className="h-5 w-5" />,
      description: "Security scanning and compliance management",
      content: {
        overview: "Comprehensive security scanning and compliance reporting to protect your infrastructure.",
        sections: [
          {
            title: "Security Scanning",
            content: [
              "Run automated security scans on your infrastructure",
              "Review vulnerability reports and risk assessments",
              "Track remediation progress and timelines",
              "Configure scan schedules and notification settings"
            ]
          },
          {
            title: "Compliance Standards",
            content: [
              "SOC 2: Service Organization Control compliance",
              "PCI DSS: Payment Card Industry Data Security Standard",
              "HIPAA: Health Insurance Portability and Accountability Act",
              "GDPR: General Data Protection Regulation"
            ]
          },
          {
            title: "Vulnerability Management",
            content: [
              "Prioritize vulnerabilities by severity and impact",
              "Assign remediation tasks to team members",
              "Track fix timelines and verification status",
              "Generate compliance reports for audits"
            ]
          }
        ],
        tips: [
          "Schedule regular security scans",
          "Address high-severity vulnerabilities first",
          "Keep compliance documentation up to date"
        ]
      }
    },
    {
      id: "monitoring",
      title: "Monitoring & Alerts",
      icon: <AlertTriangle className="h-5 w-5" />,
      description: "Setting up monitoring and alert rules",
      content: {
        overview: "Proactive monitoring with customizable alerts to ensure optimal system performance.",
        sections: [
          {
            title: "Creating Alert Rules",
            content: [
              "Define thresholds for CPU, memory, and disk usage",
              "Set up network and security-related alerts",
              "Configure notification channels (email, Slack, webhooks)",
              "Test alert rules before activating them"
            ]
          },
          {
            title: "Monitoring Dashboards",
            content: [
              "Real-time metrics visualization with charts and graphs",
              "Historical data analysis and trend identification",
              "Custom dashboard creation for specific use cases",
              "Export monitoring data for external analysis"
            ]
          },
          {
            title: "Alert Management",
            content: [
              "Acknowledge alerts to prevent duplicate notifications",
              "Resolve alerts when issues are fixed",
              "Create incident reports for major outages",
              "Review alert history and response times"
            ]
          }
        ],
        tips: [
          "Start with basic alerts and refine over time",
          "Avoid alert fatigue by setting appropriate thresholds",
          "Regularly review and update alert rules"
        ]
      }
    },
    {
      id: "cost-analysis",
      title: "Cost Analysis",
      icon: <BarChart3 className="h-5 w-5" />,
      description: "Understanding and optimizing cloud costs",
      content: {
        overview: "Track, analyze, and optimize your cloud spending across all providers and services.",
        sections: [
          {
            title: "Cost Tracking",
            content: [
              "Monitor daily, weekly, and monthly spending trends",
              "Break down costs by service, region, and project",
              "Compare spending across different time periods",
              "Set up budget alerts to prevent overspending"
            ]
          },
          {
            title: "Optimization Recommendations",
            content: [
              "Right-sizing: Optimize instance sizes based on usage",
              "Reserved Instances: Save money with longer commitments",
              "Unused Resources: Identify and eliminate waste",
              "Storage Optimization: Archive or delete old data"
            ]
          },
          {
            title: "Budget Management",
            content: [
              "Create budgets for different teams or projects",
              "Set spending limits and automatic alerts",
              "Forecast future costs based on usage trends",
              "Generate cost reports for stakeholders"
            ]
          }
        ],
        tips: [
          "Review cost reports regularly",
          "Implement optimization recommendations promptly",
          "Use tags to track costs by business unit"
        ]
      }
    },
    {
      id: "team-management",
      title: "Team Management",
      icon: <Users className="h-5 w-5" />,
      description: "Managing users, roles, and permissions",
      content: {
        overview: "Collaborative platform with role-based access control for secure team management.",
        sections: [
          {
            title: "User Roles",
            content: [
              "Admin: Full access to all features and settings",
              "Developer: Access to resources and development tools",
              "Operator: Monitor and manage infrastructure operations",
              "Viewer: Read-only access to dashboards and reports"
            ]
          },
          {
            title: "Adding Team Members",
            content: [
              "Send email invitations to new team members",
              "Assign appropriate roles based on responsibilities",
              "Configure specific permissions for sensitive operations",
              "Monitor user activity and access logs"
            ]
          },
          {
            title: "Permission Management",
            content: [
              "Control access to specific cloud accounts",
              "Restrict resource modification capabilities",
              "Manage compliance and security data access",
              "Set up approval workflows for critical changes"
            ]
          }
        ],
        tips: [
          "Follow the principle of least privilege",
          "Regularly review user access and permissions",
          "Use groups to manage permissions efficiently"
        ]
      }
    }
  ];

  const currentGuide = guides.find(g => g.id === activeGuide);

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {guides.map((guide) => (
          <Card 
            key={guide.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              activeGuide === guide.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setActiveGuide(guide.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-2">
                {guide.icon}
                <h3 className="font-medium">{guide.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{guide.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content */}
      {currentGuide && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {currentGuide.icon}
                <CardTitle>{currentGuide.title}</CardTitle>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Watch Video
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Live Demo
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Overview */}
              <div>
                <h3 className="font-medium mb-2">Overview</h3>
                <p className="text-muted-foreground">{currentGuide.content.overview}</p>
              </div>

              {/* Sections */}
              <div className="space-y-4">
                {currentGuide.content.sections.map((section, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">{section.title}</h4>
                    <ul className="space-y-2">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-blue-900">💡 Pro Tips</h4>
                <ul className="space-y-1">
                  {currentGuide.content.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-blue-800">
                      • {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserGuide;
