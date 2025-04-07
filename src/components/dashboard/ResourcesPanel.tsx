
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Server, Database, Cpu } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ResourceItemProps {
  name: string;
  provider: string;
  type: string;
  usagePercent: number;
  region: string;
  icon: React.ReactNode;
}

const ResourceItem: React.FC<ResourceItemProps> = ({
  name,
  provider,
  type,
  usagePercent,
  region,
  icon,
}) => {
  const getUsageColor = () => {
    if (usagePercent >= 90) return "text-critical";
    if (usagePercent >= 75) return "text-warning";
    if (usagePercent >= 50) return "text-info";
    return "text-success";
  };

  return (
    <div className="flex items-center space-x-4 border-b border-border py-3 last:border-0 last:pb-0">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
        {icon}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{name}</p>
          <div className="flex items-center">
            <span className={`text-xs font-medium ${getUsageColor()}`}>
              {usagePercent}%
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {provider} • {type}
          </span>
          <span>{region}</span>
        </div>
        <Progress value={usagePercent} className="h-1 mt-1" />
      </div>
    </div>
  );
};

const ResourcesPanel: React.FC = () => {
  const resources: ResourceItemProps[] = [
    {
      name: "Production Database",
      provider: "AWS",
      type: "RDS",
      usagePercent: 92,
      region: "us-east-1",
      icon: <Database className="h-5 w-5 text-info" />,
    },
    {
      name: "Web Server Cluster",
      provider: "AWS",
      type: "EC2",
      usagePercent: 68,
      region: "us-east-1",
      icon: <Server className="h-5 w-5 text-info" />,
    },
    {
      name: "Auth Service VM",
      provider: "Azure",
      type: "VM",
      usagePercent: 45,
      region: "East US",
      icon: <Cpu className="h-5 w-5 text-info" />,
    },
    {
      name: "Storage Bucket",
      provider: "GCP",
      type: "Storage",
      usagePercent: 23,
      region: "us-central1",
      icon: <Cloud className="h-5 w-5 text-info" />,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Cloud className="h-5 w-5 text-primary" /> Cloud Resources
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          {resources.map((resource, i) => (
            <ResourceItem key={i} {...resource} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourcesPanel;
