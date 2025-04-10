
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProSidebarProvider } from 'react-pro-sidebar';
import { useAuth } from "@/providers/AuthProvider";
import { initializeMockData } from "@/services/mockDatabaseService";
import { useToast } from "@/hooks/use-toast";
import { SidebarMobile } from "./sidebar/SidebarMobile";
import { SidebarDesktop } from "./sidebar/SidebarDesktop";

interface SidebarWithProviderProps {
  children: React.ReactNode;
}

export const SidebarWithProvider: React.FC<SidebarWithProviderProps> = ({ children }) => {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth/sign-in');
  };

  React.useEffect(() => {
    if (user) {
      initializeMockData(user.id);
    }
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <ProSidebarProvider>
      <div className="flex h-screen bg-background">
        {/* Mobile Sidebar */}
        <SidebarMobile 
          user={user}
          profile={profile}
          onSignOut={handleSignOut}
        />

        {/* Desktop Sidebar */}
        <SidebarDesktop 
          user={user}
          profile={profile}
          onSignOut={handleSignOut}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </ProSidebarProvider>
  );
};
