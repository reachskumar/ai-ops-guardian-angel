
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TagsFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TagsField: React.FC<TagsFieldProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="tags">Tags (key=value,key=value)</Label>
      <Input
        id="tags"
        placeholder="env=prod,project=web,owner=devops"
        value={value}
        onChange={onChange}
      />
      <p className="text-xs text-muted-foreground">
        Separate multiple tags with commas, format as key=value
      </p>
    </div>
  );
};

export default TagsField;
