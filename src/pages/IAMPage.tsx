
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { SidebarWithProvider } from "@/components/Sidebar";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, Key } from "lucide-react";
import { IAMSearchBar, UsersTab, RolesTab, ApiKeysTab } from "@/components/iam";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/user";
import { useToast } from "@/hooks/use-toast";

const IAMPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setIsRefreshing(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*");

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchProfiles();
  };

  // Mock data for roles
  const roles = [
    { id: "role1", name: "Admin", description: "Full system access", users: 1, permissions: 15 },
    { id: "role2", name: "Developer", description: "Developer access", users: 2, permissions: 10 },
    { id: "role3", name: "Operator", description: "System operation access", users: 1, permissions: 8 },
    { id: "role4", name: "Viewer", description: "View-only access", users: 1, permissions: 5 },
  ];

  // Mock data for API keys
  const apiKeys = [
    { id: "key1", name: "Production API Key", created: "2023-01-15", expires: "2024-01-15", status: "Active" },
    { id: "key2", name: "Development API Key", created: "2023-02-20", expires: "2024-02-20", status: "Active" },
    { id: "key3", name: "Testing API Key", created: "2023-03-10", expires: "2023-12-10", status: "Expiring soon" },
    { id: "key4", name: "Legacy API Key", created: "2022-05-05", expires: "2023-10-01", status: "Expired" },
  ];

  // Filter users based on search query
  const filteredUsers = profiles.filter(
    (user) =>
      (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter roles based on search query
  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter API keys based on search query
  const filteredApiKeys = apiKeys.filter(
    (key) =>
      key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarWithProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <Helmet>
          <title>Identity & Access Management - AI Ops Guardian</title>
        </Helmet>
        <main className="flex-1 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Identity & Access Management</h1>
            <IAMSearchBar 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery}
              isRefreshing={isRefreshing}
              handleRefresh={handleRefresh}
            />
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 md:w-auto">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Roles</span>
              </TabsTrigger>
              <TabsTrigger value="apikeys" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <span className="hidden sm:inline">API Keys</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <UsersTab 
                filteredUsers={filteredUsers} 
                refreshUsers={handleRefresh}
              />
            </TabsContent>
            
            {/* Roles Tab */}
            <TabsContent value="roles" className="space-y-4">
              <RolesTab filteredRoles={filteredRoles} />
            </TabsContent>
            
            {/* API Keys Tab */}
            <TabsContent value="apikeys" className="space-y-4">
              <ApiKeysTab filteredApiKeys={filteredApiKeys} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SidebarWithProvider>
  );
};

export default IAMPage;
