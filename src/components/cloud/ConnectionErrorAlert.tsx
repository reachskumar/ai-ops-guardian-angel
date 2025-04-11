
import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ConnectionErrorAlertProps {
  isVisible: boolean;
  error?: string;
  onRetry: () => void;
}

export const ConnectionErrorAlert: React.FC<ConnectionErrorAlertProps> = ({ 
  isVisible, 
  error,
  onRetry 
}) => {
  if (!isVisible) return null;

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Connection Error</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center gap-2">
        {error || "Failed to connect to cloud provider. Edge Function returned a non-2xx status code."}
        <Button 
          variant="outline" 
          size="sm"
          className="mt-2 sm:mt-0" 
          onClick={onRetry}
        >
          Try Again
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionErrorAlert;
