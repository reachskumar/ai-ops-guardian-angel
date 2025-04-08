
import React from "react";
import { CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import ComplianceCardDetails from "./ComplianceCardDetails";

interface ComplianceCardCollapsibleProps {
  isExpanded: boolean;
  itemName: string;
  score: number;
}

const ComplianceCardCollapsible: React.FC<ComplianceCardCollapsibleProps> = ({ 
  isExpanded, 
  itemName,
  score 
}) => {
  return (
    <>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full flex items-center justify-center border border-border/30"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Show Details
            </>
          )}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <ComplianceCardDetails score={score} showExpanded={true} />
      </CollapsibleContent>
    </>
  );
};

export default ComplianceCardCollapsible;
