
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloudProvider } from "@/services/cloudProviderService";

interface RegionSelectorProps {
  provider: CloudProvider;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({
  provider,
  value,
  onChange,
  error,
}) => {
  // Region options based on provider
  const getRegionOptions = (provider: CloudProvider) => {
    switch (provider) {
      case "aws":
        return ["us-east-1", "us-west-1", "eu-west-1", "ap-southeast-1"];
      case "azure":
        return ["East US", "West US", "North Europe", "Southeast Asia"];
      case "gcp":
        return ["us-central1", "us-west1", "europe-west1", "asia-east1"];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="region">Region</Label>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger>
          <SelectValue placeholder="Select region" />
        </SelectTrigger>
        <SelectContent>
          {getRegionOptions(provider).map((region) => (
            <SelectItem key={region} value={region}>
              {region}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default RegionSelector;
