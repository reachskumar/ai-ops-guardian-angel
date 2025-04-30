
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ResourceNameFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const ResourceNameField: React.FC<ResourceNameFieldProps> = ({
  value,
  onChange,
  error
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="resource-name">Resource Name</Label>
      <Input
        id="resource-name"
        placeholder="Enter resource name"
        value={value}
        onChange={onChange}
        className={error ? 'border-red-500' : ''}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default ResourceNameField;
