
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloudProvider } from "@/services/cloudProviderService";

interface SizeSelectorProps {
  provider: CloudProvider;
  resourceType: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const SizeSelector: React.FC<SizeSelectorProps> = ({
  provider,
  resourceType,
  value,
  onChange,
  error,
}) => {
  // Size options based on provider and resource type
  const getSizeOptions = (provider: CloudProvider, type: string) => {
    if (type.includes("EC2") || type.includes("Virtual Machine") || type.includes("Compute Engine")) {
      return ["t2.micro", "t2.small", "t2.medium", "t2.large", "t2.xlarge"];
    }
    if (type.includes("RDS") || type.includes("SQL")) {
      return ["db.t3.micro", "db.t3.small", "db.t3.medium", "db.t3.large"];
    }
    if (type.includes("S3") || type.includes("Blob") || type.includes("Storage")) {
      return ["Standard", "Infrequent Access", "Archive"];
    }
    return ["Small", "Medium", "Large"];
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="size">Size / Tier</Label>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger>
          <SelectValue placeholder="Select size" />
        </SelectTrigger>
        <SelectContent>
          {getSizeOptions(provider, resourceType).map((size) => (
            <SelectItem key={size} value={size}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default SizeSelector;
