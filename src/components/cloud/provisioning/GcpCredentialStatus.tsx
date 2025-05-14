
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface GcpCredentialStatusProps {
  hasCredentials: boolean;
  accountId: string;
  credentialStatus: 'valid' | 'invalid' | 'missing' | 'unknown' | 'loading';
  errorMessage?: string;
}

const GcpCredentialStatus: React.FC<GcpCredentialStatusProps> = ({
  hasCredentials,
  accountId,
  credentialStatus,
  errorMessage
}) => {
  if (credentialStatus === 'loading') {
    return (
      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
        <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
        <AlertTitle className="text-blue-800 dark:text-blue-300">Validating credentials...</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          Please wait while we validate your GCP service account credentials.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (credentialStatus === 'valid') {
    return (
      <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-800 dark:text-green-300">Valid GCP credentials</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-400">
          Your GCP service account credentials are valid and ready to use.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (credentialStatus === 'invalid') {
    return (
      <Alert className="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900">
        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <AlertTitle className="text-red-800 dark:text-red-300">Invalid GCP credentials</AlertTitle>
        <AlertDescription className="text-red-700 dark:text-red-400">
          {errorMessage || "Your GCP service account credentials are invalid."}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (credentialStatus === 'missing') {
    return (
      <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-900">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="text-amber-800 dark:text-amber-300">Missing GCP credentials</AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-400">
          No service account key found for this GCP account. Please reconnect with valid credentials.
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};

export default GcpCredentialStatus;
