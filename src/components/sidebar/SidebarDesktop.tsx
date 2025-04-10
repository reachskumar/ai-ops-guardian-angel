
import React from "react";
import { Link } from "react-router-dom";
import { SidebarNavLinks } from "./SidebarNavLinks";
import { SidebarUserMenu } from "./SidebarUserMenu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";

interface SidebarDesktopProps {
  user: any;
  profile: any;
  onSignOut: () => void;
}

export const SidebarDesktop: React.FC<SidebarDesktopProps> = ({
  user,
  profile,
  onSignOut,
}) => {
  return (
    <div className="hidden lg:block w-64 bg-card border-r border-border">
      <div className="flex items-center justify-center h-16 border-b border-border">
        <Link to="/" className="text-lg font-semibold">
          CloudMaestro
        </Link>
      </div>

      <div className="flex-grow overflow-y-auto">
        {user ? (
          <div className="flex items-center space-x-4 p-4">
            <Avatar>
              <AvatarImage src={`https://avatar.vercel.sh/${user?.email}.png`} alt={user?.email || "User Avatar"} />
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">{profile?.full_name || user?.email}</p>
              <p className="text-sm text-muted-foreground">{profile?.username || "No username"}</p>
            </div>
          </div>
        ) : (
          <p className="p-4">Not signed in</p>
        )}
        
        <SidebarNavLinks role={profile?.role} />
      </div>

      <div className="sticky bottom-0 w-full border-t border-border p-4">
        <SidebarUserMenu 
          user={user}
          profile={profile}
          onSignOut={onSignOut}
        />
      </div>
    </div>
  );
};
