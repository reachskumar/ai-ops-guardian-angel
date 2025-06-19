
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

interface SessionTimeoutDialogProps {
  isOpen: boolean;
  onExtendSession: () => void;
  onSignOut: () => void;
  warningTimeLeft: number; // in seconds
}

const SessionTimeoutDialog: React.FC<SessionTimeoutDialogProps> = ({
  isOpen,
  onExtendSession,
  onSignOut,
  warningTimeLeft
}) => {
  const [timeLeft, setTimeLeft] = useState(warningTimeLeft);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onSignOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onSignOut]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Session Expiring Soon
          </DialogTitle>
          <DialogDescription>
            Your session will expire due to inactivity
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Time remaining: <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button onClick={onExtendSession} className="flex-1">
              Continue Session
            </Button>
            <Button onClick={onSignOut} variant="outline" className="flex-1">
              Sign Out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionTimeoutDialog;
