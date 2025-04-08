
import React, { useState } from "react";
import { ComplianceCard } from "./compliance/card";

export interface ComplianceItem {
  id: string;
  name: string;
  status: string;
  score: number;
}

interface ComplianceCardsProps {
  complianceItems: ComplianceItem[];
  showExpanded?: boolean;
  onScanRequest?: (standardId: string) => Promise<void>;
}

const ComplianceCards: React.FC<ComplianceCardsProps> = ({ 
  complianceItems, 
  showExpanded = false,
  onScanRequest 
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [scanning, setScanning] = useState<string | null>(null);

  const toggleExpand = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isExpanded = (itemName: string) => expandedItems.includes(itemName);

  const handleScanRequest = async (id: string) => {
    if (!onScanRequest) return;
    
    setScanning(id);
    try {
      await onScanRequest(id);
    } finally {
      setScanning(null);
    }
  };

  return (
    <div className={`grid grid-cols-1 ${showExpanded ? 'md:grid-cols-3' : 'md:grid-cols-2'} xl:grid-cols-3 gap-4`}>
      {complianceItems.map((item) => (
        <ComplianceCard
          key={item.id}
          item={item}
          isExpanded={isExpanded(item.name)}
          onToggleExpand={toggleExpand}
          scanning={scanning}
          showExpanded={showExpanded}
          onScanRequest={handleScanRequest}
        />
      ))}
    </div>
  );
};

export default ComplianceCards;
