
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CloudProvider } from '@/services/cloud/types';
import { getResourceTypes } from '@/services/cloud/providerFactory';

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
  error
}) => {
  // Get resource types for this provider and category
  const resourceTypesData = getResourceTypes(provider, category);
  const resourceTypes = resourceTypesData.length > 0 ? resourceTypesData[0]?.types || [] : [];
  
  return (
    <div className="space-y-2">
      <Label htmlFor="resource-type">Resource Type</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="resource-type" className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          {resourceTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default ResourceTypeSelector;
