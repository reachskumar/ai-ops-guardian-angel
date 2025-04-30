
import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface CostErrorAlertProps {
  isVisible?: boolean;
  onRefresh?: () => void;
  error?: string;
}

export const CostErrorAlert: React.FC<CostErrorAlertProps> = ({ isVisible = true, onRefresh, error = "An error occurred" }) => {
  if (!isVisible) return null;

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Connection Error</AlertTitle>
      <AlertDescription>
        {error}
        {onRefresh && (
          <Button 
            variant="link" 
            className="p-0 h-auto text-destructive-foreground underline ml-2" 
            onClick={onRefresh}
          >
            Try again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default CostErrorAlert;
