
import { supabase } from "@/integrations/supabase/client";
import { User, Session, Provider } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

export interface EnhancedAuthOptions {
  enableMFA?: boolean;
  sessionTimeout?: number; // in minutes
  maxLoginAttempts?: number;
  lockoutDuration?: number; // in minutes
}

export interface LoginAttempt {
  email: string;
  attempts: number;
  lastAttempt: Date;
  lockedUntil?: Date;
}

class EnhancedAuthService {
  private loginAttempts: Map<string, LoginAttempt> = new Map();
  private sessionTimeoutId: NodeJS.Timeout | null = null;
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes default
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  constructor() {
    this.initializeSessionTimeout();
    this.loadLoginAttempts();
  }

  // Social Login Methods
  async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Google sign in error:", error);
      return { success: false, error: error.message };
    }
  }

  async signInWithGitHub(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("GitHub sign in error:", error);
      return { success: false, error: error.message };
    }
  }

  async signInWithProvider(provider: Provider): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error(`${provider} sign in error:`, error);
      return { success: false, error: error.message };
    }
  }

  // Enhanced Email/Password Login with Rate Limiting
  async signInWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if account is locked
      if (this.isAccountLocked(email)) {
        const lockoutEnd = this.loginAttempts.get(email)?.lockedUntil;
        const remainingTime = lockoutEnd ? Math.ceil((lockoutEnd.getTime() - Date.now()) / 60000) : 0;
        return { 
          success: false, 
          error: `Account temporarily locked. Try again in ${remainingTime} minutes.` 
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        this.recordFailedAttempt(email);
        throw error;
      }

      // Clear failed attempts on successful login
      this.loginAttempts.delete(email);
      this.saveLoginAttempts();

      return { success: true };
    } catch (error: any) {
      console.error("Enhanced email sign in error:", error);
      return { success: false, error: error.message };
    }
  }

  // Password Reset Functionality
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Password reset error:", error);
      return { success: false, error: error.message };
    }
  }

  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Update password error:", error);
      return { success: false, error: error.message };
    }
  }

  // Multi-Factor Authentication
  async enrollMFA(): Promise<{ success: boolean; qrCode?: string; secret?: string; error?: string }> {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'DevOps Guardian MFA'
      });

      if (error) throw error;
      
      return { 
        success: true, 
        qrCode: data.qr_code,
        secret: data.secret 
      };
    } catch (error: any) {
      console.error("MFA enrollment error:", error);
      return { success: false, error: error.message };
    }
  }

  async verifyMFA(factorId: string, challengeId: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("MFA verification error:", error);
      return { success: false, error: error.message };
    }
  }

  async challengeMFA(factorId: string): Promise<{ success: boolean; challengeId?: string; error?: string }> {
    try {
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId
      });

      if (error) throw error;
      return { 
        success: true, 
        challengeId: data.id 
      };
    } catch (error: any) {
      console.error("MFA challenge error:", error);
      return { success: false, error: error.message };
    }
  }

  // Session Timeout Management
  initializeSessionTimeout() {
    const resetSessionTimeout = () => {
      if (this.sessionTimeoutId) {
        clearTimeout(this.sessionTimeoutId);
      }

      this.sessionTimeoutId = setTimeout(() => {
        this.handleSessionTimeout();
      }, this.SESSION_TIMEOUT);
    };

    // Reset timeout on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetSessionTimeout, true);
    });

    // Initial timeout setup
    resetSessionTimeout();
  }

  private async handleSessionTimeout() {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Session Expired",
        description: "Your session has expired due to inactivity. Please sign in again.",
        variant: "destructive",
      });
      window.location.href = '/auth';
    } catch (error) {
      console.error("Session timeout error:", error);
    }
  }

  // Rate Limiting for Login Attempts
  private isAccountLocked(email: string): boolean {
    const attempt = this.loginAttempts.get(email);
    if (!attempt) return false;

    if (attempt.lockedUntil && attempt.lockedUntil > new Date()) {
      return true;
    }

    // Clear expired lockout
    if (attempt.lockedUntil && attempt.lockedUntil <= new Date()) {
      attempt.lockedUntil = undefined;
      attempt.attempts = 0;
      this.saveLoginAttempts();
    }

    return false;
  }

  private recordFailedAttempt(email: string) {
    const now = new Date();
    const attempt = this.loginAttempts.get(email) || {
      email,
      attempts: 0,
      lastAttempt: now
    };

    attempt.attempts += 1;
    attempt.lastAttempt = now;

    if (attempt.attempts >= this.MAX_LOGIN_ATTEMPTS) {
      attempt.lockedUntil = new Date(now.getTime() + this.LOCKOUT_DURATION);
    }

    this.loginAttempts.set(email, attempt);
    this.saveLoginAttempts();
  }

  private saveLoginAttempts() {
    const data = Array.from(this.loginAttempts.entries()).map(([email, attempt]) => ({
      email,
      attempts: attempt.attempts,
      lastAttempt: attempt.lastAttempt.toISOString(),
      lockedUntil: attempt.lockedUntil?.toISOString()
    }));
    localStorage.setItem('login_attempts', JSON.stringify(data));
  }

  private loadLoginAttempts() {
    try {
      const data = localStorage.getItem('login_attempts');
      if (data) {
        const attempts = JSON.parse(data);
        attempts.forEach((attempt: any) => {
          this.loginAttempts.set(attempt.email, {
            email: attempt.email,
            attempts: attempt.attempts,
            lastAttempt: new Date(attempt.lastAttempt),
            lockedUntil: attempt.lockedUntil ? new Date(attempt.lockedUntil) : undefined
          });
        });
      }
    } catch (error) {
      console.error("Error loading login attempts:", error);
    }
  }

  cleanup() {
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
    }
  }
}

export const enhancedAuthService = new EnhancedAuthService();
