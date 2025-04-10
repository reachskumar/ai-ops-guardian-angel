
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Github, ChevronDown, ChevronRight, ArrowUpDown, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface CostTool {
  name: string;
  description: string;
  url: string;
  github?: string;
  tags: string[];
  features: string[];
  documentation: string;
  installation: string;
  commands?: string[];
  compatibleClouds: string[];
  screenshots?: string[];
}

const OpenSourceCostTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  
  const toggleToolExpansion = (toolName: string) => {
    setExpandedTool(expandedTool === toolName ? null : toolName);
  };

  const costTools: CostTool[] = [
    {
      name: "Infracost",
      description: "Cloud cost estimates for Terraform in pull requests. Helps engineers to understand the cost impact of their changes.",
      url: "https://www.infracost.io/",
      github: "https://github.com/infracost/infracost",
      tags: ["Terraform", "IaC", "Cost Estimation"],
      features: [
        "Cost breakdowns for Terraform projects",
        "CI/CD integration for automated cost checking",
        "Pull request comments with cost estimates",
        "Support for over 20 cloud resources",
        "Cost policy checks for governance"
      ],
      documentation: "Infracost shows cloud cost estimates for Terraform. It lets engineers see a cost breakdown and includes price sensitivity analysis. Perfect for DevOps and FinOps teams looking to implement cost controls.",
      installation: "```bash\n# Install via brew\nbrew install infracost\n\n# Or via script\ncurl -fsSL https://raw.githubusercontent.com/infracost/infracost/master/scripts/install.sh | sh\n```",
      commands: [
        "infracost breakdown --path /path/to/terraform",
        "infracost diff --path /path/to/terraform",
        "infracost comment github --path /path/to/terraform --repo my/repo --pull-request 123"
      ],
      compatibleClouds: ["AWS", "Azure", "Google Cloud"]
    },
    {
      name: "Opencost",
      description: "CNCF project for Kubernetes cost monitoring. Provides real-time cost visibility into Kubernetes environments.",
      url: "https://www.opencost.io/",
      github: "https://github.com/opencost/opencost",
      tags: ["Kubernetes", "CNCF", "Real-time"],
      features: [
        "Pod cost allocation",
        "Node and namespace cost analysis",
        "Cost monitoring for idle resources",
        "Multi-cluster support",
        "Customizable pricing models"
      ],
      documentation: "OpenCost provides real-time cost monitoring for Kubernetes workloads. It's a vendor-neutral open source project, part of the CNCF, that gives teams visibility into their container costs across any infrastructure.",
      installation: "```bash\n# Install via Helm\nhelm repo add opencost https://opencost.github.io/opencost-helm-chart\nhelm install opencost opencost/opencost -n opencost --create-namespace\n```",
      commands: [
        "kubectl port-forward --namespace opencost service/opencost 9090:9090",
        "kubectl get pods -n opencost",
        "curl http://localhost:9090/allocation/summary"
      ],
      compatibleClouds: ["AWS", "Azure", "Google Cloud", "On-premise"]
    },
    {
      name: "Kubecost",
      description: "Kubernetes cost allocation tool that provides visibility into infrastructure spending across teams and services.",
      url: "https://kubecost.com/",
      github: "https://github.com/kubecost/cost-model",
      tags: ["Kubernetes", "Allocation", "Optimization"],
      features: [
        "Cost allocation by team, application, or service",
        "Right-sizing recommendations for optimal resource usage",
        "Cloud billing integration",
        "Cost forecasting and alerts",
        "Governance and budget enforcement"
      ],
      documentation: "Kubecost provides real-time cost visibility and insights for teams running Kubernetes. It helps teams monitor and reduce their Kubernetes spend by identifying optimization opportunities and allocating costs to teams and projects.",
      installation: "```bash\n# Install via Helm\nhelm repo add kubecost https://kubecost.github.io/cost-analyzer/\nhelm install kubecost kubecost/cost-analyzer --namespace kubecost --create-namespace\n```",
      commands: [
        "kubectl port-forward -n kubecost svc/kubecost-cost-analyzer 9090",
        "kubectl get pods -n kubecost",
        "curl http://localhost:9090/model/allocation"
      ],
      compatibleClouds: ["AWS", "Azure", "Google Cloud", "Any Kubernetes cluster"]
    },
    {
      name: "Cloud Custodian",
      description: "Rules engine for cloud security, cost optimization, and governance, ensuring enforcement of policies.",
      url: "https://cloudcustodian.io/",
      github: "https://github.com/cloud-custodian/cloud-custodian",
      tags: ["Multi-cloud", "Governance", "Automation"],
      features: [
        "Policy enforcement for security and cost",
        "Resource lifecycle management",
        "Multi-cloud support",
        "Hundreds of pre-built policies",
        "Automated remediation workflows"
      ],
      documentation: "Cloud Custodian is a rules engine for managing cloud resources. It enables users to define policies to enforce both cost management and compliance requirements. Custodian policies can manage resources through their lifecycle ensuring both cost control and compliance.",
      installation: "```bash\n# Install via pip\npip install c7n\n\n# Create a policy file\necho '{\"policies\": [{\"name\": \"unused-volumes\", \"resource\": \"aws.ebs\", \"filters\": [{\"State.Value\": \"available\"}]}]}' > policy.yml\n```",
      commands: [
        "custodian run --output-dir=. policy.yml",
        "custodian report policy.yml --output-dir=.",
        "custodian validate policy.yml"
      ],
      compatibleClouds: ["AWS", "Azure", "Google Cloud"]
    },
    {
      name: "Komiser",
      description: "Cloud environment inspector to analyze and manage cloud cost, usage, security, and governance.",
      url: "https://www.komiser.io/",
      github: "https://github.com/tailwarden/komiser",
      tags: ["Multi-cloud", "Visualization", "Resource tracking"],
      features: [
        "Cloud asset inventory and tracking",
        "Cost optimization recommendations",
        "Resource utilization insights",
        "Security posture assessment",
        "Beautiful visual dashboard"
      ],
      documentation: "Komiser is an open-source cloud environment inspector that helps developers manage cloud costs, security and compliance across multiple cloud providers. It visualizes cloud infrastructure to provide actionable cost-saving insights.",
      installation: "```bash\n# Install via brew\nbrew install komiser/tap/komiser\n\n# Or via Docker\ndocker run -d -p 3000:3000 --name komiser tailwarden/komiser:latest\n```",
      commands: [
        "komiser start",
        "komiser configure aws",
        "komiser analyze --out summary.html"
      ],
      compatibleClouds: ["AWS", "Azure", "Google Cloud", "Digital Ocean", "Oracle Cloud"]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5 text-primary" />
          Open Source Cost Analysis Tools
        </CardTitle>
        <CardDescription>
          Free and open-source tools for monitoring and optimizing cloud costs - integrated directly into your workflow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {costTools.map((tool) => (
              <Collapsible 
                key={tool.name} 
                open={expandedTool === tool.name}
                onOpenChange={() => toggleToolExpansion(tool.name)}
                className="border rounded-lg"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{tool.name}</h3>
                        <div className="flex gap-1">
                          {tool.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {expandedTool === tool.name ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                
                <CollapsibleContent>
                  <div className="px-4 pb-4 pt-0 border-t">
                    <div className="mt-3">
                      <h4 className="text-sm font-medium mb-1">Key Features:</h4>
                      <ul className="text-xs text-muted-foreground list-disc pl-5 mb-3">
                        {tool.features.map((feature) => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-3">
                      <h4 className="text-sm font-medium mb-1">Compatible Clouds:</h4>
                      <div className="flex gap-1 flex-wrap mb-3">
                        {tool.compatibleClouds.map((cloud) => (
                          <Badge key={cloud} variant="secondary" className="text-xs">
                            {cloud}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" asChild>
                        <a href={tool.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Website
                        </a>
                      </Button>
                      {tool.github && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={tool.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                            <Github className="h-3.5 w-3.5" />
                            GitHub
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </TabsContent>
          
          <TabsContent value="documentation" className="space-y-6">
            {costTools.map((tool) => (
              <div key={tool.name} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{tool.name} Documentation</h3>
                <div className="text-sm text-muted-foreground mb-4">
                  <p>{tool.documentation}</p>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Installation:</h4>
                  <div className="bg-muted p-3 rounded-md text-xs font-mono whitespace-pre overflow-x-auto">
                    {tool.installation.replace(/```bash\n|\n```/g, '')}
                  </div>
                </div>
                
                {tool.commands && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Common Commands:</h4>
                    <ul className="space-y-1">
                      {tool.commands.map((command, index) => (
                        <li key={index} className="bg-muted p-2 rounded-md text-xs font-mono">
                          {command}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="integration" className="space-y-4">
            <div className="bg-muted/50 border rounded-lg p-4 mb-4">
              <h3 className="font-medium text-lg mb-1">Integration Options</h3>
              <p className="text-sm text-muted-foreground">
                These open-source tools can be integrated with our platform. Select your preferred integration approach below.
              </p>
            </div>
            
            {costTools.map((tool) => (
              <div key={tool.name} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">{tool.name} Integration</h3>
                  <Badge variant="outline" className={tool.name === "Infracost" || tool.name === "Komiser" ? "bg-green-100 text-green-800" : ""}>
                    {tool.name === "Infracost" || tool.name === "Komiser" ? "Ready to integrate" : "Coming soon"}
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border rounded p-3 flex items-center gap-2">
                      <div className={tool.name === "Infracost" || tool.name === "Komiser" ? "text-green-600" : "text-muted-foreground"}>
                        {tool.name === "Infracost" || tool.name === "Komiser" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </div>
                      <span className="text-sm">API Integration</span>
                    </div>
                    <div className="border rounded p-3 flex items-center gap-2">
                      <div className={tool.name === "Infracost" ? "text-green-600" : "text-muted-foreground"}>
                        {tool.name === "Infracost" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </div>
                      <span className="text-sm">CI/CD Pipeline</span>
                    </div>
                    <div className="border rounded p-3 flex items-center gap-2">
                      <div className={tool.name === "Komiser" ? "text-green-600" : "text-muted-foreground"}>
                        {tool.name === "Komiser" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </div>
                      <span className="text-sm">Dashboard Embed</span>
                    </div>
                    <div className="border rounded p-3 flex items-center gap-2">
                      <div className="text-muted-foreground">
                        <X className="h-4 w-4" />
                      </div>
                      <span className="text-sm">Real-time Sync</span>
                    </div>
                  </div>
                  
                  {(tool.name === "Infracost" || tool.name === "Komiser") && (
                    <Button className="w-full mt-2">
                      Configure {tool.name} Integration
                    </Button>
                  )}
                  
                  {!(tool.name === "Infracost" || tool.name === "Komiser") && (
                    <Button variant="outline" className="w-full mt-2" disabled>
                      Integration Coming Soon
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OpenSourceCostTools;
