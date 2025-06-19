
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Shield, CheckCircle } from 'lucide-react';
import { enhancedAuthService } from '@/services/enhancedAuthService';
import { useToast } from '@/hooks/use-toast';

const MFASetup: React.FC = () => {
  const [step, setStep] = useState<'enroll' | 'verify'>('enroll');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [factorId, setFactorId] = useState<string>('');
  const [challengeId, setChallengeId] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const { toast } = useToast();

  const handleEnrollMFA = async () => {
    setLoading(true);
    try {
      const result = await enhancedAuthService.enrollMFA();
      if (result.success) {
        setQrCode(result.qrCode || '');
        setSecret(result.secret || '');
        setStep('verify');
        toast({
          title: "MFA Enrollment Started",
          description: "Scan the QR code with your authenticator app",
        });
      } else {
        toast({
          title: "MFA Enrollment Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start MFA enrollment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMFA = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Verification Required",
        description: "Please enter the 6-digit code from your authenticator app",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First create a challenge
      const challengeResult = await enhancedAuthService.challengeMFA(factorId);
      if (!challengeResult.success) {
        throw new Error(challengeResult.error);
      }

      // Then verify with the code
      const verifyResult = await enhancedAuthService.verifyMFA(
        factorId,
        challengeResult.challengeId!,
        verificationCode
      );

      if (verifyResult.success) {
        setIsSetup(true);
        toast({
          title: "MFA Setup Complete",
          description: "Multi-factor authentication has been enabled for your account",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: verifyResult.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Verification Error",
        description: error.message || "Failed to verify MFA code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isSetup) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            MFA Enabled
          </CardTitle>
          <CardDescription>
            Multi-factor authentication is now active on your account
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Multi-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'enroll' && (
          <>
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                MFA adds an extra layer of security by requiring a code from your phone 
                in addition to your password when signing in.
              </AlertDescription>
            </Alert>
            <Button onClick={handleEnrollMFA} disabled={loading} className="w-full">
              <Shield className="mr-2 h-4 w-4" />
              {loading ? "Setting up..." : "Enable MFA"}
            </Button>
          </>
        )}

        {step === 'verify' && (
          <>
            <div className="space-y-4">
              <Alert>
                <QrCode className="h-4 w-4" />
                <AlertDescription>
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.), 
                  then enter the 6-digit code below.
                </AlertDescription>
              </Alert>

              {qrCode && (
                <div className="flex justify-center">
                  <img src={qrCode} alt="MFA QR Code" className="border rounded" />
                </div>
              )}

              {secret && (
                <div className="space-y-2">
                  <Label>Manual Entry Key</Label>
                  <Input
                    value={secret}
                    readOnly
                    className="font-mono text-sm"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use this key if you can't scan the QR code
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>

              <Button 
                onClick={handleVerifyMFA} 
                disabled={loading || verificationCode.length !== 6}
                className="w-full"
              >
                {loading ? "Verifying..." : "Verify & Enable MFA"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MFASetup;
