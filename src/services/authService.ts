import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

export type UserRole = 'admin' | 'developer' | 'operator' | 'viewer';

export interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  role?: UserRole;
  team_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, error: error.message };
  }
};

export const signUp = async (
  email: string,
  password: string,
  username: string,
  fullName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    
    return { 
      success: true, 
      error: data.session ? undefined : "Please check your email to confirm your account."
    };
  } catch (error: any) {
    console.error("Sign up error:", error);
    return { success: false, error: error.message };
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};

export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session || null;
  } catch (error) {
    console.error("Get current session error:", error);
    return null;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as UserProfile;
  } catch (error) {
    console.error("Get user profile error:", error);
    return null;
  }
};

export const updateUserProfile = async (
  userId: string, 
  updates: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Update user profile error:", error);
    return { success: false, error: error.message };
  }
};

export const checkUserRole = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    const profile = await getUserProfile(userId);
    
    if (!profile?.role) return false;
    
    // Check role hierarchy
    const roleHierarchy = ['viewer', 'operator', 'developer', 'admin'];
    const userRoleIndex = roleHierarchy.indexOf(profile.role as UserRole);
    const requiredRoleIndex = roleHierarchy.indexOf(role);
    
    return userRoleIndex >= requiredRoleIndex;
  } catch (error) {
    console.error("Check user role error:", error);
    return false;
  }
};

export const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return { success: false, error: error.message };
  }
};

export const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
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
};
