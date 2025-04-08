
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloudProvider } from "@/services/cloud";

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
  // Region options based on provider with expanded list of regions
  const getRegionOptions = (provider: CloudProvider) => {
    switch (provider) {
      case "aws":
        return [
          { value: "us-east-1", label: "US East (N. Virginia)" },
          { value: "us-east-2", label: "US East (Ohio)" },
          { value: "us-west-1", label: "US West (N. California)" },
          { value: "us-west-2", label: "US West (Oregon)" },
          { value: "af-south-1", label: "Africa (Cape Town)" },
          { value: "ap-east-1", label: "Asia Pacific (Hong Kong)" },
          { value: "ap-south-1", label: "Asia Pacific (Mumbai)" },
          { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
          { value: "ap-northeast-2", label: "Asia Pacific (Seoul)" },
          { value: "ap-northeast-3", label: "Asia Pacific (Osaka)" },
          { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
          { value: "ap-southeast-2", label: "Asia Pacific (Sydney)" },
          { value: "ap-southeast-3", label: "Asia Pacific (Jakarta)" },
          { value: "ca-central-1", label: "Canada (Central)" },
          { value: "eu-central-1", label: "Europe (Frankfurt)" },
          { value: "eu-west-1", label: "Europe (Ireland)" },
          { value: "eu-west-2", label: "Europe (London)" },
          { value: "eu-west-3", label: "Europe (Paris)" },
          { value: "eu-north-1", label: "Europe (Stockholm)" },
          { value: "eu-south-1", label: "Europe (Milan)" },
          { value: "me-south-1", label: "Middle East (Bahrain)" },
          { value: "sa-east-1", label: "South America (São Paulo)" },
        ];
      case "azure":
        return [
          { value: "eastus", label: "East US" },
          { value: "eastus2", label: "East US 2" },
          { value: "centralus", label: "Central US" },
          { value: "northcentralus", label: "North Central US" },
          { value: "southcentralus", label: "South Central US" },
          { value: "westcentralus", label: "West Central US" },
          { value: "westus", label: "West US" },
          { value: "westus2", label: "West US 2" },
          { value: "westus3", label: "West US 3" },
          { value: "canadacentral", label: "Canada Central" },
          { value: "canadaeast", label: "Canada East" },
          { value: "brazilsouth", label: "Brazil South" },
          { value: "northeurope", label: "North Europe" },
          { value: "westeurope", label: "West Europe" },
          { value: "uksouth", label: "UK South" },
          { value: "ukwest", label: "UK West" },
          { value: "francecentral", label: "France Central" },
          { value: "germanywestcentral", label: "Germany West Central" },
          { value: "norwayeast", label: "Norway East" },
          { value: "switzerlandnorth", label: "Switzerland North" },
          { value: "swedencentral", label: "Sweden Central" },
          { value: "uaenorth", label: "UAE North" },
          { value: "southafricanorth", label: "South Africa North" },
          { value: "australiaeast", label: "Australia East" },
          { value: "australiasoutheast", label: "Australia Southeast" },
          { value: "centralindia", label: "Central India" },
          { value: "southindia", label: "South India" },
          { value: "japaneast", label: "Japan East" },
          { value: "japanwest", label: "Japan West" },
          { value: "koreacentral", label: "Korea Central" },
          { value: "koreasouth", label: "Korea South" },
          { value: "eastasia", label: "East Asia" },
          { value: "southeastasia", label: "Southeast Asia" },
        ];
      case "gcp":
        return [
          { value: "us-central1", label: "Iowa (us-central1)" },
          { value: "us-east1", label: "South Carolina (us-east1)" },
          { value: "us-east4", label: "Northern Virginia (us-east4)" },
          { value: "us-west1", label: "Oregon (us-west1)" },
          { value: "us-west2", label: "Los Angeles (us-west2)" },
          { value: "us-west3", label: "Salt Lake City (us-west3)" },
          { value: "us-west4", label: "Las Vegas (us-west4)" },
          { value: "northamerica-northeast1", label: "Montreal (northamerica-northeast1)" },
          { value: "northamerica-northeast2", label: "Toronto (northamerica-northeast2)" },
          { value: "southamerica-east1", label: "São Paulo (southamerica-east1)" },
          { value: "southamerica-west1", label: "Santiago (southamerica-west1)" },
          { value: "europe-north1", label: "Finland (europe-north1)" },
          { value: "europe-central2", label: "Warsaw (europe-central2)" },
          { value: "europe-west1", label: "Belgium (europe-west1)" },
          { value: "europe-west2", label: "London (europe-west2)" },
          { value: "europe-west3", label: "Frankfurt (europe-west3)" },
          { value: "europe-west4", label: "Netherlands (europe-west4)" },
          { value: "europe-west6", label: "Zurich (europe-west6)" },
          { value: "asia-east1", label: "Taiwan (asia-east1)" },
          { value: "asia-east2", label: "Hong Kong (asia-east2)" },
          { value: "asia-northeast1", label: "Tokyo (asia-northeast1)" },
          { value: "asia-northeast2", label: "Osaka (asia-northeast2)" },
          { value: "asia-northeast3", label: "Seoul (asia-northeast3)" },
          { value: "asia-south1", label: "Mumbai (asia-south1)" },
          { value: "asia-south2", label: "Delhi (asia-south2)" },
          { value: "asia-southeast1", label: "Singapore (asia-southeast1)" },
          { value: "asia-southeast2", label: "Jakarta (asia-southeast2)" },
          { value: "australia-southeast1", label: "Sydney (australia-southeast1)" },
          { value: "australia-southeast2", label: "Melbourne (australia-southeast2)" },
        ];
      default:
        return [];
    }
  };

  // Get the region options for the current provider
  const regionOptions = getRegionOptions(provider);

  // If the currently selected value is not in the new provider's options,
  // reset it to the first available option
  React.useEffect(() => {
    const validValues = regionOptions.map(option => option.value);
    if (!validValues.includes(value) && validValues.length > 0) {
      onChange(validValues[0]);
    }
  }, [provider, value, onChange, regionOptions]);

  return (
    <div className="space-y-2">
      <Label htmlFor="region">Region</Label>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger>
          <SelectValue placeholder="Select region" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {regionOptions.map((region) => (
            <SelectItem key={region.value} value={region.value}>
              {region.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default RegionSelector;
