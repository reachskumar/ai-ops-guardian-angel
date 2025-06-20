
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CloudProvider } from '@/services/cloud/types';
import { getInstanceSizes } from '@/services/cloud/providerFactory';

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
  error
}) => {
  // Get instance sizes for this provider and resource type
  const sizes = resourceType ? getInstanceSizes(provider, resourceType) : [];
  
  return (
    <div className="space-y-2">
      <Label htmlFor="resource-size">Size/Tier</Label>
      <Select 
        value={value} 
        onValueChange={onChange}
        disabled={!resourceType || sizes.length === 0}
      >
        <SelectTrigger id="resource-size" className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder="Select size" />
        </SelectTrigger>
        <SelectContent>
          {sizes.map((size) => (
            <SelectItem key={size.id} value={size.id}>
              {size.name} ({size.vcpus} vCPUs, {size.memory} GB RAM)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default SizeSelector;
