
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TagsFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TagsField: React.FC<TagsFieldProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="tags">Tags (optional)</Label>
      <Input
        id="tags"
        placeholder="key1=value1,key2=value2"
        value={value}
        onChange={onChange}
      />
      <p className="text-xs text-muted-foreground">
        Enter comma-separated key=value pairs (e.g., env=prod,team=engineering)
      </p>
    </div>
  );
};

export default TagsField;
