
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setProfile(data);
      setIsAdmin(data?.role === 'admin');
      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Could not fetch user profile",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  // Ensure profile exists for a user
  const ensureProfileExists = useCallback(async (user: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        // Create profile if it doesn't exist
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          username: user.email?.split('@')[0],
          full_name: user.user_metadata?.full_name || user.email,
          role: 'user' // Default role
        });

        if (insertError) throw insertError;
        
        // Fetch the newly created profile
        return await fetchUserProfile(user.id);
      }
      
      return data;
    } catch (error) {
      console.error("Error ensuring profile exists:", error);
      toast({
        title: "Profile Error",
        description: "Could not create or fetch user profile",
        variant: "destructive",
      });
      return null;
    }
  }, [fetchUserProfile, toast]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  }, [user, fetchUserProfile]);

  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state change:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Use setTimeout to avoid potential recursion issues
          setTimeout(async () => {
            await fetchUserProfile(currentSession.user!.id);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        if (data.session?.user) {
          await ensureProfileExists(data.session.user);
          await fetchUserProfile(data.session.user.id);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        toast({
          title: "Authentication Error",
          description: "Failed to initialize authentication",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, [ensureProfileExists, fetchUserProfile, toast]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign Out Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const value = {
    session,
    user,
    profile,
    loading,
    isAdmin,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
