
import React from "react";
import { Button } from "@/components/ui/button";

interface ComplianceHeaderProps {
  viewMode: "cards" | "table";
  setViewMode: (mode: "cards" | "table") => void;
}

const ComplianceHeader: React.FC<ComplianceHeaderProps> = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Compliance Standards</h2>
      <div className="flex items-center gap-2">
        <Button 
          variant={viewMode === "cards" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("cards")}
        >
          Card View
        </Button>
        <Button 
          variant={viewMode === "table" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("table")}
        >
          Table View
        </Button>
      </div>
    </div>
  );
};

export default ComplianceHeader;
