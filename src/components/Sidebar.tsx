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
  LayoutDashboard,
  Menu,
  Server,
  Settings,
  FileText,
  BarChart3,
  Cloud,
  Globe,
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Server, label: "Servers", path: "/servers" },
    { icon: Cloud, label: "Cloud Resources", path: "/cloud-resources" },
    { icon: Globe, label: "Multi-Cloud", path: "/multi-cloud" },
    { icon: BarChart3, label: "Reports", path: "/reports" },
    { icon: FileText, label: "Logs", path: "/logs" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={onToggle}>
        <SheetTrigger asChild>
          <button className="md:hidden p-2 rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary">
            <Menu className="h-6 w-6" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <SheetHeader>
            <SheetTitle>AI Ops Guardian</SheetTitle>
            <SheetDescription>
              Navigate your infrastructure with ease.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center px-4 py-2 rounded-md hover:bg-secondary ${
                  location.pathname === item.path ? "bg-secondary" : ""
                }`}
              >
                <item.icon className="h-4 w-4 mr-2" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
      <aside className="hidden md:flex flex-col w-64 bg-sidebar-background border-r border-sidebar-border">
        <div className="flex items-center justify-center h-16 border-b border-sidebar-border">
          <span className="text-lg font-semibold">AI Ops Guardian</span>
        </div>
        <nav className="flex-grow p-4">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center px-4 py-2 rounded-md hover:bg-sidebar-accent ${
                location.pathname === item.path ? "bg-sidebar-accent" : ""
              }`}
            >
              <item.icon className="h-4 w-4 mr-2" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
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
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <>{children}</>;
  }

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
