
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertTriangle, CheckCircle } from "lucide-react";

interface GcpCredentialStatusProps {
  hasCredentials: boolean;
  accountId: string;
  credentialStatus: 'valid' | 'invalid' | 'missing' | 'unknown';
  errorMessage?: string;
}

const GcpCredentialStatus: React.FC<GcpCredentialStatusProps> = ({
  hasCredentials,
  credentialStatus,
  errorMessage
}) => {
  if (credentialStatus === 'valid') {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">GCP Credentials Valid</AlertTitle>
        <AlertDescription className="text-green-700">
          Your GCP service account key has been validated successfully.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (credentialStatus === 'invalid') {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Invalid GCP Credentials</AlertTitle>
        <AlertDescription>
          {errorMessage || "Your GCP service account key appears to be invalid or incomplete."}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (credentialStatus === 'missing') {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>GCP Credentials Required</AlertTitle>
        <AlertDescription>
          This account needs a GCP service account key for provisioning. 
          Please ensure you've uploaded a valid service account key during account setup.
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};

export default GcpCredentialStatus;
