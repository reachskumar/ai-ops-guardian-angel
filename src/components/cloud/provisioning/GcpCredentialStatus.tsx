
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GcpCredentialStatusProps {
  hasCredentials: boolean;
  accountId: string;
  credentialStatus: 'valid' | 'invalid' | 'missing' | 'unknown';
  errorMessage?: string;
}

const GcpCredentialStatus: React.FC<GcpCredentialStatusProps> = ({
  hasCredentials,
  accountId,
  credentialStatus,
  errorMessage
}) => {
  const openGcpConsole = () => {
    window.open('https://console.cloud.google.com/iam-admin/serviceaccounts', '_blank');
  };

  if (credentialStatus === 'valid') {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">GCP Credentials Valid</AlertTitle>
        <AlertDescription className="text-green-700">
          <p>Your GCP service account key has been validated successfully.</p>
          <p className="text-xs mt-1">You can now provision and manage resources in your GCP project.</p>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (credentialStatus === 'invalid') {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Invalid GCP Credentials</AlertTitle>
        <AlertDescription className="flex flex-col space-y-2">
          <span>{errorMessage || "Your GCP service account key appears to be invalid or incomplete."}</span>
          <span className="text-sm">
            Common issues include missing fields, incorrect format, or insufficient permissions.
            The service account needs Compute Admin role to provision VMs.
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 w-fit flex items-center" 
            onClick={openGcpConsole}
          >
            <ExternalLink className="mr-1 h-3 w-3" /> 
            Go to GCP Service Accounts
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (credentialStatus === 'missing') {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>GCP Credentials Required</AlertTitle>
        <AlertDescription className="flex flex-col space-y-2">
          <span>This account needs a GCP service account key for provisioning.</span>
          <span className="text-sm">
            Please ensure you've uploaded a valid service account key with Compute Admin
            permissions during account setup.
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 w-fit flex items-center" 
            onClick={openGcpConsole}
          >
            <ExternalLink className="mr-1 h-3 w-3" /> 
            Go to GCP Service Accounts
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};

export default GcpCredentialStatus;
