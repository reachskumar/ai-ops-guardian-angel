
import React, { memo } from "react";
import { Bell, Settings, Search, LogOut, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Header: React.FC = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="border-b border-border bg-card px-4 lg:px-6 h-14 flex items-center justify-between sticky top-0 z-30">
      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-sm mr-4 hidden md:flex">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 bg-background w-full md:w-[240px] lg:w-[320px]"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
                <Avatar className="h-8 w-8">
                  {profile?.avatar_url && (
                    <AvatarImage src={profile.avatar_url} alt={profile?.full_name || user.email} />
                  )}
                  <AvatarFallback>
                    {profile?.full_name
                      ? getInitials(profile.full_name)
                      : getInitials(user.email || "")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {profile?.full_name || "User"}
                    </p>
                    {isAdmin && (
                      <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 border-amber-300">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem onClick={() => navigate('/admin')}>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};

// Use React memo to prevent unnecessary re-renders
export default memo(Header);
