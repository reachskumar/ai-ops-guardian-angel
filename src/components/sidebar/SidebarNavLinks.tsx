
import React from "react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { 
  Home, 
  Server, 
  Database, 
  Shield, 
  Cloud, 
  TrendingUp, 
  Code, 
  Lock, 
  MessageSquare, 
  LayoutDashboard, 
  Users, 
  AlertTriangle,
  Network,
  Settings
} from "lucide-react";

interface SidebarNavLinksProps {
  isMobile?: boolean;
  role?: string;
}

export const SidebarNavLinks: React.FC<SidebarNavLinksProps> = ({ 
  isMobile = false, 
  role 
}) => {
  const navItemClass = isMobile 
    ? "block py-2 px-4 rounded hover:bg-secondary" 
    : "block py-2 px-4 rounded hover:bg-secondary w-full";
  
  const containerClass = isMobile
    ? "flex flex-col space-y-1"
    : "flex flex-col space-y-1 w-full";
    
  const menuItemClass = isMobile ? "" : "w-full";

  return (
    <NavigationMenu orientation="vertical">
      <NavigationMenuList className={containerClass}>
        <NavigationMenuItem className={menuItemClass}>
          <Link to="/" className={navItemClass}>
            <Home className="mr-2 h-4 w-4 inline-block" />
            Dashboard
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem className={menuItemClass}>
          <Link to="/servers" className={navItemClass}>
            <Server className="mr-2 h-4 w-4 inline-block" />
            Servers
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem className={menuItemClass}>
          <Link to="/databases" className={navItemClass}>
            <Database className="mr-2 h-4 w-4 inline-block" />
            Databases
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem className={menuItemClass}>
          <Link to="/security" className={navItemClass}>
            <Shield className="mr-2 h-4 w-4 inline-block" />
            Security
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem className={menuItemClass}>
          <Link to="/cloud-resources" className={navItemClass}>
            <Cloud className="mr-2 h-4 w-4 inline-block" />
            Cloud Resources
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem className={menuItemClass}>
          <Link to="/cost-analysis" className={navItemClass}>
            <TrendingUp className="mr-2 h-4 w-4 inline-block" />
            Cost Analysis
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem className={menuItemClass}>
          <Link to="/kubernetes" className={navItemClass}>
            <Code className="mr-2 h-4 w-4 inline-block" />
            Kubernetes
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem className={menuItemClass}>
          <Link to="/iam" className={navItemClass}>
            <Lock className="mr-2 h-4 w-4 inline-block" />
            IAM
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem className={menuItemClass}>
          <Link to="/ai-assistant" className={navItemClass}>
            <MessageSquare className="mr-2 h-4 w-4 inline-block" />
            AI Assistant
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem className={menuItemClass}>
          <Link to="/analytics" className={navItemClass}>
            <LayoutDashboard className="mr-2 h-4 w-4 inline-block" />
            Analytics
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem className={menuItemClass}>
          <Link to="/collaboration" className={navItemClass}>
            <Users className="mr-2 h-4 w-4 inline-block" />
            Collaboration
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem className={menuItemClass}>
          <Link to="/incidents" className={navItemClass}>
            <AlertTriangle className="mr-2 h-4 w-4 inline-block" />
            Incidents
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem className={menuItemClass}>
          <Link to="/infrastructure" className={navItemClass}>
            <Network className="mr-2 h-4 w-4 inline-block" />
            Infrastructure
          </Link>
        </NavigationMenuItem>
        {role === 'admin' && (
          <NavigationMenuItem className={menuItemClass}>
            <Link to="/admin" className={navItemClass}>
              <Settings className="mr-2 h-4 w-4 inline-block" />
              Admin Panel
            </Link>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
