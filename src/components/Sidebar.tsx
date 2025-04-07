
import React from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar as SidebarWrapper,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Bot,
  Shield,
  AlertTriangle,
  Cloud,
  Server,
  MonitorDot,
  Lock,
  Settings,
  Database,
  CreditCard,
  HelpCircle,
} from "lucide-react";

interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}

const NavLink: React.FC<NavLinkProps> = ({
  href,
  icon: Icon,
  children,
  className,
}) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link
          to={href}
          className={cn(
            "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            className
          )}
        >
          <Icon className="h-5 w-5" />
          <span>{children}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

interface SidebarContentsProps {
  className?: string;
}

export const SidebarContents: React.FC<SidebarContentsProps> = ({ className }) => {
  return (
    <SidebarContent className={cn("py-4", className)}>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-sidebar-foreground">
          Overview
        </h2>
        <SidebarMenu>
          <NavLink href="/" icon={BarChart3}>
            Dashboard
          </NavLink>
          <NavLink href="/ai-chatbot" icon={Bot}>
            AI Assistant
          </NavLink>
          <NavLink href="/security" icon={Shield}>
            Security
          </NavLink>
          <NavLink href="/incidents" icon={AlertTriangle}>
            Incidents
          </NavLink>
        </SidebarMenu>
      </div>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-sidebar-foreground">
          Infrastructure
        </h2>
        <SidebarMenu>
          <NavLink href="/cloud-resources" icon={Cloud}>
            Cloud Resources
          </NavLink>
          <NavLink href="/servers" icon={Server}>
            Servers
          </NavLink>
          <NavLink href="/monitoring" icon={MonitorDot}>
            Monitoring
          </NavLink>
          <NavLink href="/iam" icon={Lock}>
            IAM
          </NavLink>
        </SidebarMenu>
      </div>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-sidebar-foreground">
          Management
        </h2>
        <SidebarMenu>
          <NavLink href="/settings" icon={Settings}>
            Settings
          </NavLink>
          <NavLink href="/databases" icon={Database}>
            Databases
          </NavLink>
          <NavLink href="/cost" icon={CreditCard}>
            Cost Analysis
          </NavLink>
        </SidebarMenu>
      </div>
    </SidebarContent>
  );
};

export const SidebarWithProvider: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className }) => {
  return (
    <SidebarProvider>
      <div className={cn("flex min-h-screen w-full", className)}>
        <AppSidebar />
        <div className="flex-1">
          <div className="flex items-center h-12 border-b border-border px-4">
            <SidebarTrigger />
          </div>
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
};

export const AppSidebar: React.FC = () => {
  return (
    <SidebarWrapper>
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-sidebar-foreground">AI Ops Guardian</span>
        </div>
      </div>
      <SidebarContents />
      <SidebarFooter className="border-t border-sidebar-border py-3 px-5">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Need help?</span>
        </div>
      </SidebarFooter>
    </SidebarWrapper>
  );
};

export default SidebarWithProvider;
