
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CloudProvider } from '@/services/cloud/types';
import { getRegions } from '@/services/cloud/providerFactory';

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
  error
}) => {
  // Get regions for this provider
  const regions = getRegions(provider);
  
  return (
    <div className="space-y-2">
      <Label htmlFor="region">Region</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="region" className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder="Select region" />
        </SelectTrigger>
        <SelectContent>
          {regions.map((region) => (
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
