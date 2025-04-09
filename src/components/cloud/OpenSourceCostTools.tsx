
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CostTool {
  name: string;
  description: string;
  url: string;
  github?: string;
  tags: string[];
  features: string[];
}

const OpenSourceCostTools: React.FC = () => {
  const costTools: CostTool[] = [
    {
      name: "Infracost",
      description: "Cloud cost estimates for Terraform in pull requests. Helps engineers to understand the cost impact of their changes.",
      url: "https://www.infracost.io/",
      github: "https://github.com/infracost/infracost",
      tags: ["Terraform", "IaC", "Cost Estimation"],
      features: ["Cost breakdowns", "CI/CD integration", "Pull request comments"]
    },
    {
      name: "Opencost",
      description: "CNCF project for Kubernetes cost monitoring. Provides real-time cost visibility into Kubernetes environments.",
      url: "https://www.opencost.io/",
      github: "https://github.com/opencost/opencost",
      tags: ["Kubernetes", "CNCF", "Real-time"],
      features: ["Pod cost allocation", "Node cost analysis", "Namespace reporting"]
    },
    {
      name: "Kube-cost",
      description: "Kubernetes cost allocation tool that provides visibility into infrastructure spending across teams and services.",
      url: "https://kubecost.com/",
      github: "https://github.com/kubecost/cost-model",
      tags: ["Kubernetes", "Allocation", "Optimization"],
      features: ["Cost allocation", "Right-sizing recommendations", "Cloud billing integration"]
    },
    {
      name: "Cloud Custodian",
      description: "Rules engine for cloud security, cost optimization, and governance, ensuring enforcement of policies.",
      url: "https://cloudcustodian.io/",
      github: "https://github.com/cloud-custodian/cloud-custodian",
      tags: ["Multi-cloud", "Governance", "Automation"],
      features: ["Policy enforcement", "Resource lifecycle management", "Multi-cloud support"]
    },
    {
      name: "Komiser",
      description: "Cloud environment inspector to analyze and manage cloud cost, usage, security, and governance.",
      url: "https://www.komiser.io/",
      github: "https://github.com/tailwarden/komiser",
      tags: ["Multi-cloud", "Visualization", "Resource tracking"],
      features: ["Cost tracking", "Resource inventory", "Security insights"]
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
          Free and open-source tools for monitoring and optimizing cloud costs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {costTools.map((tool) => (
            <div key={tool.name} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
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
              </div>
              
              <div className="mt-3">
                <h4 className="text-sm font-medium mb-1">Key Features:</h4>
                <ul className="text-xs text-muted-foreground list-disc pl-5 mb-3">
                  {tool.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex gap-2 mt-3">
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OpenSourceCostTools;
