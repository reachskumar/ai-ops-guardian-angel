import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import {
  Sidebar,
  Menu,
  MenuItem,
  ProSidebarProvider,
} from 'react-pro-sidebar';
import { Home, Users, Settings, Lock, Plus, Server, Database, Shield, TrendingUp, File, Book, MessageSquare, LayoutDashboard, Cloud, Code, ListChecks, Network, AlertTriangle, HelpCircle, LogOut } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { initializeMockData } from "@/services/mockDatabaseService";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface SidebarWithProviderProps {
  children: React.ReactNode;
}

export const SidebarWithProvider: React.FC<SidebarWithProviderProps> = ({ children }) => {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
    return <div>Loading...</div>;
  }

  return (
    <ProSidebarProvider>
      <div className="lg:flex relative min-h-screen">
        {/* Mobile Sidebar */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden absolute top-4 left-4 z-50">
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>
                Navigate through the application.
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
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link to="/" className="block py-2 px-4 rounded hover:bg-secondary">
                      <Home className="mr-2 h-4 w-4 inline-block" />
                      Dashboard
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/servers" className="block py-2 px-4 rounded hover:bg-secondary">
                      <Server className="mr-2 h-4 w-4 inline-block" />
                      Servers
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/databases" className="block py-2 px-4 rounded hover:bg-secondary">
                      <Database className="mr-2 h-4 w-4 inline-block" />
                      Databases
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/security" className="block py-2 px-4 rounded hover:bg-secondary">
                      <Shield className="mr-2 h-4 w-4 inline-block" />
                      Security
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/cloud-resources" className="block py-2 px-4 rounded hover:bg-secondary">
                      <Cloud className="mr-2 h-4 w-4 inline-block" />
                      Cloud Resources
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/cost-analysis" className="block py-2 px-4 rounded hover:bg-secondary">
                      <TrendingUp className="mr-2 h-4 w-4 inline-block" />
                      Cost Analysis
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/kubernetes" className="block py-2 px-4 rounded hover:bg-secondary">
                      <Code className="mr-2 h-4 w-4 inline-block" />
                      Kubernetes
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/iam" className="block py-2 px-4 rounded hover:bg-secondary">
                      <Lock className="mr-2 h-4 w-4 inline-block" />
                      IAM
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/ai-assistant" className="block py-2 px-4 rounded hover:bg-secondary">
                      <MessageSquare className="mr-2 h-4 w-4 inline-block" />
                      AI Assistant
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/analytics" className="block py-2 px-4 rounded hover:bg-secondary">
                      <LayoutDashboard className="mr-2 h-4 w-4 inline-block" />
                      Analytics
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/collaboration" className="block py-2 px-4 rounded hover:bg-secondary">
                      <Users className="mr-2 h-4 w-4 inline-block" />
                      Collaboration
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/incidents" className="block py-2 px-4 rounded hover:bg-secondary">
                      <AlertTriangle className="mr-2 h-4 w-4 inline-block" />
                      Incidents
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/infrastructure" className="block py-2 px-4 rounded hover:bg-secondary">
                      <Network className="mr-2 h-4 w-4 inline-block" />
                      Infrastructure
                    </Link>
                  </NavigationMenuItem>
                  {profile?.role === 'admin' && (
                    <NavigationMenuItem>
                      <Link to="/admin" className="block py-2 px-4 rounded hover:bg-secondary">
                        <Settings className="mr-2 h-4 w-4 inline-block" />
                        Admin Panel
                      </Link>
                    </NavigationMenuItem>
                  )}
                </NavigationMenuList>
              </NavigationMenu>
              <div className="absolute bottom-4 w-full">
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start pl-4 pr-2 py-2 rounded-md font-normal text-sm">
                      <Avatar className="mr-2 h-5 w-5">
                        <AvatarImage src={`https://avatar.vercel.sh/${user?.email}.png`} alt={user?.email || "User Avatar"} />
                        <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <span>{profile?.full_name || user?.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80" align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <Users className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-gray-50 border-r border-gray-200">
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
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
            <NavigationMenu>
              <NavigationMenuList className="flex flex-col space-y-1">
                <NavigationMenuItem>
                  <Link to="/" className="block py-2 px-4 rounded hover:bg-secondary">
                    <Home className="mr-2 h-4 w-4 inline-block" />
                    Dashboard
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/servers" className="block py-2 px-4 rounded hover:bg-secondary">
                    <Server className="mr-2 h-4 w-4 inline-block" />
                    Servers
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/databases" className="block py-2 px-4 rounded hover:bg-secondary">
                    <Database className="mr-2 h-4 w-4 inline-block" />
                    Databases
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/security" className="block py-2 px-4 rounded hover:bg-secondary">
                    <Shield className="mr-2 h-4 w-4 inline-block" />
                    Security
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/cloud-resources" className="block py-2 px-4 rounded hover:bg-secondary">
                    <Cloud className="mr-2 h-4 w-4 inline-block" />
                    Cloud Resources
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/cost-analysis" className="block py-2 px-4 rounded hover:bg-secondary">
                    <TrendingUp className="mr-2 h-4 w-4 inline-block" />
                    Cost Analysis
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/kubernetes" className="block py-2 px-4 rounded hover:bg-secondary">
                    <Code className="mr-2 h-4 w-4 inline-block" />
                    Kubernetes
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/iam" className="block py-2 px-4 rounded hover:bg-secondary">
                    <Lock className="mr-2 h-4 w-4 inline-block" />
                    IAM
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/ai-assistant" className="block py-2 px-4 rounded hover:bg-secondary">
                    <MessageSquare className="mr-2 h-4 w-4 inline-block" />
                    AI Assistant
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/analytics" className="block py-2 px-4 rounded hover:bg-secondary">
                    <LayoutDashboard className="mr-2 h-4 w-4 inline-block" />
                    Analytics
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/collaboration" className="block py-2 px-4 rounded hover:bg-secondary">
                    <Users className="mr-2 h-4 w-4 inline-block" />
                    Collaboration
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/incidents" className="block py-2 px-4 rounded hover:bg-secondary">
                    <AlertTriangle className="mr-2 h-4 w-4 inline-block" />
                    Incidents
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/infrastructure" className="block py-2 px-4 rounded hover:bg-secondary">
                    <Network className="mr-2 h-4 w-4 inline-block" />
                    Infrastructure
                  </Link>
                </NavigationMenuItem>
                {profile?.role === 'admin' && (
                  <NavigationMenuItem>
                    <Link to="/admin" className="block py-2 px-4 rounded hover:bg-secondary">
                      <Settings className="mr-2 h-4 w-4 inline-block" />
                      Admin Panel
                    </Link>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="sticky bottom-0 w-full border-t border-gray-200 p-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start pl-2 pr-2 py-2 rounded-md font-normal text-sm">
                  <Avatar className="mr-2 h-5 w-5">
                    <AvatarImage src={`https://avatar.vercel.sh/${user?.email}.png`} alt={user?.email || "User Avatar"} />
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <span>{profile?.full_name || user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </ProSidebarProvider>
  );
};
