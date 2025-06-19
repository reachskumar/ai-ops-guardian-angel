
import React from "react";
import { NavLink } from "react-router-dom";
import {
  AlertCircle,
  BarChart3,
  Box,
  Cloud,
  CreditCard,
  Database,
  Lock,
  LucideIcon,
  Network,
  Server,
  Settings,
  Shield,
  Users,
  Bot,
  Layers,
  KanbanSquare,
  GitBranch,
  GitPullRequest,
  CloudDrizzle
} from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  roles?: string[];
}

interface SidebarNavLinksProps {
  role?: string;
  isMobile?: boolean;
}

const navItems: NavItem[] = [
  {
    path: "/",
    label: "Dashboard",
    icon: BarChart3,
  },
  {
    path: "/infrastructure",
    label: "Infrastructure",
    icon: Network,
  },
  {
    path: "/servers",
    label: "Servers",
    icon: Server,
  },
  {
    path: "/security",
    label: "Security",
    icon: Shield,
  },
  {
    path: "/cloud-resources",
    label: "Cloud Resources",
    icon: Cloud,
  },
  {
    path: "/multi-cloud",
    label: "Multi-Cloud",
    icon: CloudDrizzle,
  },
  {
    path: "/cost-analysis",
    label: "Cost Analysis",
    icon: CreditCard,
  },
  {
    path: "/kubernetes",
    label: "Kubernetes",
    icon: Box,
  },
  {
    path: "/databases",
    label: "Databases",
    icon: Database,
  },
  {
    path: "/iam",
    label: "IAM",
    icon: Lock,
  },
  {
    path: "/devops",
    label: "DevOps",
    icon: GitBranch,
  },
  {
    path: "/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    path: "/collaboration",
    label: "Collaboration",
    icon: Users,
  },
  {
    path: "/incidents",
    label: "Incidents",
    icon: AlertCircle,
  },
  {
    path: "/ai-assistant",
    label: "AI Assistant",
    icon: Bot,
  },
  {
    path: "/project-kanban",
    label: "Project Kanban",
    icon: KanbanSquare,
  },
  {
    path: "/admin",
    label: "Admin Panel",
    icon: Settings,
    roles: ["admin"],
  },
];

export const SidebarNavLinks: React.FC<SidebarNavLinksProps> = ({
  role = "user",
  isMobile = false
}) => {
  // Filter items based on user role
  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <div className={`space-y-1 py-2 ${isMobile ? 'px-2' : 'px-3'}`}>
      {filteredItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => 
            `flex items-center ${isMobile ? 'gap-2' : 'gap-3'} px-3 py-2 rounded-md text-sm font-medium transition-all ${
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent/50'
            }`
          }
          end={item.path === "/"}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
};
