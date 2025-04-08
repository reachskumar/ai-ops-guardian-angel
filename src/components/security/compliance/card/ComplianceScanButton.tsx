
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ComplianceScanButtonProps {
  isScanning: boolean;
  onClick: () => Promise<void>;
}

const ComplianceScanButton: React.FC<ComplianceScanButtonProps> = ({ isScanning, onClick }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      className="mt-2 w-full"
      disabled={isScanning}
      onClick={onClick}
    >
      {isScanning ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Scanning...
        </>
      ) : (
        'Run Compliance Scan'
      )}
    </Button>
  );
};

export default ComplianceScanButton;
