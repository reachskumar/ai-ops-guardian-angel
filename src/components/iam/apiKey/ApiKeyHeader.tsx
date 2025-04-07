
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ApiKeyHeaderProps {
  onCreateKey: () => void;
}

const ApiKeyHeader: React.FC<ApiKeyHeaderProps> = ({ onCreateKey }) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">API Key Management</h2>
      <Button size="sm" onClick={onCreateKey}>
        <Plus className="h-4 w-4 mr-2" />
        Create API Key
      </Button>
    </div>
  );
};

export default ApiKeyHeader;
