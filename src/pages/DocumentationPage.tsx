
import React, { useState } from "react";
import { SidebarWithProvider } from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Book, 
  Video, 
  FileText, 
  HelpCircle, 
  Search,
  ChevronRight,
  Star,
  Clock,
  Users,
  Shield,
  Cloud,
  Activity,
  Settings,
  Download
} from "lucide-react";
import UserGuide from "@/components/documentation/UserGuide";
import AdminTraining from "@/components/documentation/AdminTraining";
import GettingStarted from "@/components/documentation/GettingStarted";
import TroubleshootingGuide from "@/components/documentation/TroubleshootingGuide";
import APIGuide from "@/components/documentation/APIGuide";
import VideoTutorials from "@/components/documentation/VideoTutorials";

const DocumentationPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("getting-started");

  const documentationSections = [
    {
      id: "getting-started",
      title: "Getting Started",
      description: "Learn the basics and get up and running quickly",
      icon: <Star className="h-5 w-5" />,
      badge: "Essential",
      estimatedTime: "10 min"
    },
    {
      id: "user-guide",
      title: "User Guide",
      description: "Comprehensive guides for all platform features",
      icon: <Book className="h-5 w-5" />,
      badge: "Complete",
      estimatedTime: "45 min"
    },
    {
      id: "admin-training",
      title: "Admin Training",
      description: "Advanced features for administrators",
      icon: <Shield className="h-5 w-5" />,
      badge: "Advanced",
      estimatedTime: "30 min"
    },
    {
      id: "video-tutorials",
      title: "Video Tutorials",
      description: "Step-by-step video walkthroughs",
      icon: <Video className="h-5 w-5" />,
      badge: "Interactive",
      estimatedTime: "60 min"
    },
    {
      id: "api-guide",
      title: "API Documentation",
      description: "Technical reference for developers",
      icon: <FileText className="h-5 w-5" />,
      badge: "Technical",
      estimatedTime: "20 min"
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      description: "Common issues and solutions",
      icon: <HelpCircle className="h-5 w-5" />,
      badge: "Support",
      estimatedTime: "15 min"
    }
  ];

  const quickLinks = [
    { title: "Dashboard Overview", icon: <Activity className="h-4 w-4" />, href: "#dashboard" },
    { title: "Cloud Resources", icon: <Cloud className="h-4 w-4" />, href: "#resources" },
    { title: "User Management", icon: <Users className="h-4 w-4" />, href: "#users" },
    { title: "Security Settings", icon: <Shield className="h-4 w-4" />, href: "#security" },
    { title: "System Configuration", icon: <Settings className="h-4 w-4" />, href: "#config" }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "getting-started":
        return <GettingStarted />;
      case "user-guide":
        return <UserGuide />;
      case "admin-training":
        return <AdminTraining />;
      case "video-tutorials":
        return <VideoTutorials />;
      case "api-guide":
        return <APIGuide />;
      case "troubleshooting":
        return <TroubleshootingGuide />;
      default:
        return <GettingStarted />;
    }
  };

  return (
    <SidebarWithProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Documentation & Training</h1>
              <p className="text-muted-foreground mb-6">
                Learn how to use the cloud infrastructure management platform effectively
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar Navigation */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sections</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {documentationSections.map((section) => (
                      <Button
                        key={section.id}
                        variant={activeSection === section.id ? "default" : "ghost"}
                        className="w-full justify-start h-auto p-3"
                        onClick={() => setActiveSection(section.id)}
                      >
                        <div className="flex items-center space-x-3 w-full">
                          {section.icon}
                          <div className="flex-1 text-left">
                            <div className="font-medium">{section.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {section.estimatedTime}
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {section.badge}
                          </Badge>
                        </div>
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {quickLinks.map((link, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {}}
                      >
                        {link.icon}
                        <span className="ml-2">{link.title}</span>
                        <ChevronRight className="ml-auto h-4 w-4" />
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {documentationSections.find(s => s.id === activeSection)?.icon}
                        <div>
                          <CardTitle>
                            {documentationSections.find(s => s.id === activeSection)?.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {documentationSections.find(s => s.id === activeSection)?.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{documentationSections.find(s => s.id === activeSection)?.estimatedTime}</span>
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderContent()}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarWithProvider>
  );
};

export default DocumentationPage;
