
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';

interface UseSessionTimeoutOptions {
  timeoutDuration?: number; // in milliseconds
  warningDuration?: number; // in milliseconds
}

export const useSessionTimeout = ({
  timeoutDuration = 30 * 60 * 1000, // 30 minutes
  warningDuration = 5 * 60 * 1000,  // 5 minutes warning
}: UseSessionTimeoutOptions = {}) => {
  const { user, signOut } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [warningTimeLeft, setWarningTimeLeft] = useState(0);
  
  const resetTimeout = useCallback(() => {
    setShowWarning(false);
  }, []);

  const extendSession = useCallback(() => {
    setShowWarning(false);
    // Reset the timeout by triggering activity
    document.dispatchEvent(new Event('mousedown'));
  }, []);

  const handleTimeout = useCallback(async () => {
    await signOut();
  }, [signOut]);

  useEffect(() => {
    if (!user) return;

    let timeoutId: NodeJS.Timeout;
    let warningId: NodeJS.Timeout;
    let lastActivity = Date.now();

    const resetTimers = () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      lastActivity = Date.now();

      // Set warning timer
      warningId = setTimeout(() => {
        setShowWarning(true);
        setWarningTimeLeft(warningDuration / 1000);
      }, timeoutDuration - warningDuration);

      // Set timeout timer
      timeoutId = setTimeout(() => {
        handleTimeout();
      }, timeoutDuration);
    };

    const handleActivity = () => {
      if (showWarning) {
        setShowWarning(false);
      }
      resetTimers();
    };

    // Activity events to monitor
    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initialize timers
    resetTimers();

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user, timeoutDuration, warningDuration, showWarning, handleTimeout]);

  return {
    showWarning,
    warningTimeLeft,
    extendSession,
    handleTimeout
  };
};
