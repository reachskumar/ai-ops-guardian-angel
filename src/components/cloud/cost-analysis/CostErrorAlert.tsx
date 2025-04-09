
import React from "react";
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface CostErrorAlertProps {
  isVisible: boolean;
  onRefresh: () => void;
}

export const CostErrorAlert: React.FC<CostErrorAlertProps> = ({ isVisible, onRefresh }) => {
  if (!isVisible) return null;

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Connection Error</AlertTitle>
      <AlertDescription>
        Failed to connect to the Edge Functions. Using simulated data instead. 
        <Button 
          variant="link" 
          className="p-0 h-auto text-destructive-foreground underline ml-2" 
          onClick={onRefresh}
        >
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default CostErrorAlert;
