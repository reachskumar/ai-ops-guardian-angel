
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloudProvider } from "@/services/cloud/types";

interface ResourceTypeSelectorProps {
  provider: CloudProvider;
  category: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const ResourceTypeSelector: React.FC<ResourceTypeSelectorProps> = ({
  provider,
  category,
  value,
  onChange,
  error,
}) => {
  // Resource options based on provider and type with standardized naming
  const getResourceTypes = (provider: CloudProvider, category: string) => {
    switch (provider) {
      case "aws":
        if (category === "compute") return ["EC2", "Lambda"];
        if (category === "storage") return ["S3", "EBS"];
        if (category === "database") return ["RDS", "DynamoDB"];
        if (category === "network") return ["VPC", "ELB"];
        return [];
      case "azure":
        if (category === "compute") return ["Virtual Machine", "Functions"];
        if (category === "storage") return ["Blob Storage", "Disk Storage"];
        if (category === "database") return ["SQL Database", "Cosmos DB"];
        if (category === "network") return ["Virtual Network", "Load Balancer"];
        return [];
      case "gcp":
        if (category === "compute") return ["Compute Engine", "Cloud Functions"];
        if (category === "storage") return ["Cloud Storage", "Persistent Disk"];
        if (category === "database") return ["Cloud SQL", "Firestore"];
        if (category === "network") return ["VPC", "Cloud Load Balancing"];
        return [];
      default:
        return [];
    }
  };

  const resourceTypes = getResourceTypes(provider, category);

  return (
    <div className="space-y-2">
      <Label htmlFor="type">Resource Type</Label>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger id="type">
          <SelectValue placeholder="Select resource type" />
        </SelectTrigger>
        <SelectContent>
          {resourceTypes.length > 0 ? (
            resourceTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>No resource types available</SelectItem>
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default ResourceTypeSelector;
