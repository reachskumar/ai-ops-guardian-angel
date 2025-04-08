
import React from "react";
import { Button } from "@/components/ui/button";
import { Filter, Search, Download } from "lucide-react";
import ComplianceSelector from "./ComplianceSelector";

interface TabActionsProps {
  showComplianceSelector: boolean;
  setShowComplianceSelector: (show: boolean) => void;
  onRefreshData: (standards: string[]) => void;
  isScanning: boolean;
}

const TabActions: React.FC<TabActionsProps> = ({
  showComplianceSelector,
  setShowComplianceSelector,
  onRefreshData,
  isScanning
}) => {
  const handleRefresh = () => {
    setShowComplianceSelector(true);
  };

  const handleScanStart = (standards: string[]) => {
    setShowComplianceSelector(false);
    onRefreshData(standards);
  };

  return (
    <div className="flex items-center gap-2">
      <ComplianceSelector
        open={showComplianceSelector}
        onOpenChange={setShowComplianceSelector}
        onScanStart={handleScanStart}
        isScanning={isScanning}
      />
      <Button size="sm" variant="outline" className="h-8 gap-1">
        <Filter className="h-4 w-4" />
        Filter
      </Button>
      <Button size="sm" variant="outline" className="h-8 gap-1">
        <Search className="h-4 w-4" />
        Search
      </Button>
      <Button size="sm" variant="outline" className="h-8 gap-1">
        <Download className="h-4 w-4" />
        Export
      </Button>
    </div>
  );
};

export default TabActions;
