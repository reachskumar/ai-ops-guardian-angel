
import React from "react";
import { Collapsible } from "@/components/ui/collapsible";
import { ComplianceItem } from "../../ComplianceCards";
import ComplianceCardHeader from "./ComplianceCardHeader";
import ComplianceScoreDisplay from "./ComplianceScoreDisplay";
import ComplianceScanButton from "./ComplianceScanButton";
import ComplianceCardCollapsible from "./ComplianceCardCollapsible";
import ComplianceCardDetails from "./ComplianceCardDetails";

interface ComplianceCardProps {
  item: ComplianceItem;
  isExpanded: boolean;
  onToggleExpand: (itemName: string) => void;
  scanning: string | null;
  showExpanded?: boolean;
  onScanRequest?: (id: string) => Promise<void>;
}

const ComplianceCard: React.FC<ComplianceCardProps> = ({
  item,
  isExpanded,
  onToggleExpand,
  scanning,
  showExpanded = false,
  onScanRequest
}) => {
  const handleScanRequest = async () => {
    if (onScanRequest) {
      await onScanRequest(item.id);
    }
  };

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={() => onToggleExpand(item.name)}
      className="border border-border rounded-lg p-4 transition-all duration-200 hover:shadow-md"
    >
      <ComplianceCardHeader 
        name={item.name} 
        status={item.status} 
        score={item.score} 
      />
      
      <div className="space-y-2">
        <ComplianceScoreDisplay score={item.score} />
        
        {onScanRequest && (
          <ComplianceScanButton 
            isScanning={scanning === item.id} 
            onClick={handleScanRequest} 
          />
        )}
        
        <ComplianceCardCollapsible 
          isExpanded={isExpanded} 
          itemName={item.name}
          score={item.score}
        />
        
        {showExpanded && (
          <ComplianceCardDetails score={item.score} />
        )}
      </div>
    </Collapsible>
  );
};

export default ComplianceCard;
