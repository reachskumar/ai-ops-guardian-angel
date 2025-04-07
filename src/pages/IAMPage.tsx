
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { SidebarWithProvider } from "@/components/Sidebar";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon, UserPlus, Shield, Users, Key, RefreshCw } from "lucide-react";

const IAMPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Mock data for users
  const users = [
    { id: "user1", name: "John Doe", email: "john.doe@example.com", role: "Admin", lastLogin: "2 hours ago" },
    { id: "user2", name: "Jane Smith", email: "jane.smith@example.com", role: "User", lastLogin: "1 day ago" },
    { id: "user3", name: "Mike Johnson", email: "mike.johnson@example.com", role: "User", lastLogin: "5 days ago" },
    { id: "user4", name: "Sarah Williams", email: "sarah.williams@example.com", role: "Operator", lastLogin: "3 hours ago" },
    { id: "user5", name: "David Brown", email: "david.brown@example.com", role: "Read-only", lastLogin: "2 weeks ago" },
  ];

  // Mock data for roles
  const roles = [
    { id: "role1", name: "Admin", description: "Full system access", users: 1, permissions: 15 },
    { id: "role2", name: "User", description: "Standard user access", users: 2, permissions: 8 },
    { id: "role3", name: "Operator", description: "System operation access", users: 1, permissions: 10 },
    { id: "role4", name: "Read-only", description: "View-only access", users: 1, permissions: 5 },
  ];

  // Mock data for API keys
  const apiKeys = [
    { id: "key1", name: "Production API Key", created: "2023-01-15", expires: "2024-01-15", status: "Active" },
    { id: "key2", name: "Development API Key", created: "2023-02-20", expires: "2024-02-20", status: "Active" },
    { id: "key3", name: "Testing API Key", created: "2023-03-10", expires: "2023-12-10", status: "Expiring soon" },
    { id: "key4", name: "Legacy API Key", created: "2022-05-05", expires: "2023-10-01", status: "Expired" },
  ];

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
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
            <div className="flex space-x-2 mt-2 sm:mt-0">
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
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
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">User Management</h2>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4">Name</th>
                          <th className="text-left p-4">Email</th>
                          <th className="text-left p-4">Role</th>
                          <th className="text-left p-4">Last Login</th>
                          <th className="text-right p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-muted-foreground">
                              No users found
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-muted/50">
                              <td className="p-4">{user.name}</td>
                              <td className="p-4">{user.email}</td>
                              <td className="p-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.role === "Admin" ? "bg-blue-100 text-blue-800" :
                                  user.role === "Operator" ? "bg-amber-100 text-amber-800" :
                                  user.role === "Read-only" ? "bg-slate-100 text-slate-800" :
                                  "bg-green-100 text-green-800"
                                }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="p-4">{user.lastLogin}</td>
                              <td className="p-4 text-right">
                                <Button variant="ghost" size="sm">Edit</Button>
                                <Button variant="ghost" size="sm" className="text-red-500">Deactivate</Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Roles Tab */}
            <TabsContent value="roles" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Roles & Permissions</h2>
                <Button size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4">Role Name</th>
                          <th className="text-left p-4">Description</th>
                          <th className="text-center p-4">Users</th>
                          <th className="text-center p-4">Permissions</th>
                          <th className="text-right p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRoles.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-muted-foreground">
                              No roles found
                            </td>
                          </tr>
                        ) : (
                          filteredRoles.map((role) => (
                            <tr key={role.id} className="border-b hover:bg-muted/50">
                              <td className="p-4 font-medium">{role.name}</td>
                              <td className="p-4">{role.description}</td>
                              <td className="p-4 text-center">{role.users}</td>
                              <td className="p-4 text-center">{role.permissions}</td>
                              <td className="p-4 text-right">
                                <Button variant="ghost" size="sm">Edit</Button>
                                <Button variant="ghost" size="sm">Clone</Button>
                                <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* API Keys Tab */}
            <TabsContent value="apikeys" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">API Key Management</h2>
                <Button size="sm">
                  <Key className="h-4 w-4 mr-2" />
                  Generate API Key
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4">Key Name</th>
                          <th className="text-left p-4">Created</th>
                          <th className="text-left p-4">Expires</th>
                          <th className="text-left p-4">Status</th>
                          <th className="text-right p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApiKeys.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-muted-foreground">
                              No API keys found
                            </td>
                          </tr>
                        ) : (
                          filteredApiKeys.map((key) => (
                            <tr key={key.id} className="border-b hover:bg-muted/50">
                              <td className="p-4 font-medium">{key.name}</td>
                              <td className="p-4">{key.created}</td>
                              <td className="p-4">{key.expires}</td>
                              <td className="p-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  key.status === "Active" ? "bg-green-100 text-green-800" :
                                  key.status === "Expiring soon" ? "bg-amber-100 text-amber-800" :
                                  "bg-red-100 text-red-800"
                                }`}>
                                  {key.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <Button variant="ghost" size="sm">View</Button>
                                <Button variant="ghost" size="sm">Rotate</Button>
                                <Button variant="ghost" size="sm" className="text-red-500">Revoke</Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SidebarWithProvider>
  );
};

export default IAMPage;
