
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

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
  if (credentialStatus === 'valid') {
    return (
      <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle>GCP Service Account Key Validated</AlertTitle>
        <AlertDescription>
          Your GCP credentials have been successfully validated.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (credentialStatus === 'invalid') {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Invalid GCP Service Account Key</AlertTitle>
        <AlertDescription>
          {errorMessage || 'The provided GCP service account key is invalid.'}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (credentialStatus === 'missing') {
    return (
      <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle>Missing GCP Service Account Key</AlertTitle>
        <AlertDescription>
          GCP resources require a valid service account key for provisioning.
          Please reconnect your GCP account with proper credentials.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Unknown or initial state
  return null;
};

export default GcpCredentialStatus;
