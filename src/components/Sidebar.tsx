
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { SidebarDesktop } from "@/components/sidebar/SidebarDesktop";
import { SidebarMobile } from "@/components/sidebar/SidebarMobile";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const { user, profile, signOut } = useAuth();

  return (
    <>
      <SidebarMobile
        user={user}
        profile={profile}
        onSignOut={signOut}
      />
      <SidebarDesktop
        user={user}
        profile={profile}
        onSignOut={signOut}
      />
    </>
  );
};

interface SidebarWithProviderProps {
  children: React.ReactNode;
}

export const SidebarWithProvider: React.FC<SidebarWithProviderProps> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={isOpen} onToggle={toggleSidebar} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-0">
        {children}
      </main>
    </div>
  );
};
