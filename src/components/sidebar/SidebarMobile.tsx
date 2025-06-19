
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarNavLinks } from "./SidebarNavLinks";
import { SidebarUserMenu } from "./SidebarUserMenu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";

interface SidebarMobileProps {
  user: any;
  profile: any;
  onSignOut: () => void;
}

export const SidebarMobile: React.FC<SidebarMobileProps> = ({
  user,
  profile,
  onSignOut,
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild className="lg:hidden absolute top-4 left-4 z-50">
        <Button variant="outline" size="icon">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-card">
        <SheetHeader>
          <SheetTitle>
            <Link to="/dashboard" className="text-lg font-semibold">
              OrbitOps
            </Link>
          </SheetTitle>
          <SheetDescription>
            Navigate through your infrastructure management platform.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
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
          
          <SidebarNavLinks isMobile={true} role={profile?.role} />
          
          <div className="absolute bottom-4 w-full pr-4">
            <SidebarUserMenu 
              user={user}
              profile={profile}
              onSignOut={onSignOut}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
