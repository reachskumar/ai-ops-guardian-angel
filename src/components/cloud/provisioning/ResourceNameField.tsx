
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ResourceNameFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const ResourceNameField: React.FC<ResourceNameFieldProps> = ({
  value,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="name">Resource Name</Label>
      <Input
        id="name"
        placeholder="Enter resource name"
        value={value}
        onChange={onChange}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default ResourceNameField;
