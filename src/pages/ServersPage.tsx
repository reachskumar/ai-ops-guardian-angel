
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { SidebarWithProvider } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Server, Shield, Settings, HardDrive, Network, Cpu } from "lucide-react";

const ServersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock server data
  const servers = [
    {
      id: "srv-1",
      name: "prod-web-01",
      status: "running",
      type: "web server",
      ip: "10.0.1.4",
      os: "Ubuntu 22.04",
      cpu: "4 vCPUs",
      memory: "16 GB",
      region: "us-east-1",
    },
    {
      id: "srv-2",
      name: "prod-db-01",
      status: "running",
      type: "database",
      ip: "10.0.1.5",
      os: "Debian 11",
      cpu: "8 vCPUs",
      memory: "32 GB",
      region: "us-east-1",
    },
    {
      id: "srv-3",
      name: "staging-web-01",
      status: "stopped",
      type: "web server",
      ip: "10.0.2.4",
      os: "Ubuntu 20.04",
      cpu: "2 vCPUs",
      memory: "8 GB",
      region: "eu-west-1",
    },
    {
      id: "srv-4",
      name: "dev-app-01",
      status: "running",
      type: "application",
      ip: "10.0.3.10",
      os: "Amazon Linux 2",
      cpu: "2 vCPUs",
      memory: "4 GB",
      region: "us-west-2",
    },
    {
      id: "srv-5",
      name: "prod-cache-01",
      status: "maintenance",
      type: "cache",
      ip: "10.0.1.6",
      os: "Redis OS",
      cpu: "2 vCPUs",
      memory: "8 GB",
      region: "us-east-1",
    },
  ];

  // Filter servers based on search query
  const filteredServers = servers.filter(server => 
    server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    server.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    server.os.toLowerCase().includes(searchQuery.toLowerCase()) ||
    server.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "running":
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      case "stopped":
        return <Badge variant="secondary">{status}</Badge>;
      case "maintenance":
        return <Badge variant="outline" className="text-amber-500 border-amber-500">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getServerTypeIcon = (type: string) => {
    switch(type) {
      case "web server":
        return <Server className="h-4 w-4 text-blue-500" />;
      case "database":
        return <HardDrive className="h-4 w-4 text-emerald-500" />;
      case "application":
        return <Cpu className="h-4 w-4 text-purple-500" />;
      case "cache":
        return <Network className="h-4 w-4 text-amber-500" />;
      default:
        return <Server className="h-4 w-4" />;
    }
  };

  return (
    <SidebarWithProvider>
      <Helmet>
        <title>Servers - AI Ops Guardian</title>
      </Helmet>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Server Management</h1>
          <Button>
            <Server className="mr-2 h-4 w-4" />
            Add Server
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{servers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Running</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {servers.filter(s => s.status === "running").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Stopped</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-500">
                {servers.filter(s => s.status === "stopped").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">
                {servers.filter(s => s.status === "maintenance").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="servers" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="servers">Servers</TabsTrigger>
              <TabsTrigger value="groups">Server Groups</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search servers..."
                className="w-64 pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <TabsContent value="servers" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <div className="grid grid-cols-8 border-b bg-muted/50 p-2 text-sm font-medium">
                    <div className="col-span-2">Name</div>
                    <div>Status</div>
                    <div>Type</div>
                    <div>IP Address</div>
                    <div>OS</div>
                    <div>Resources</div>
                    <div className="text-right">Actions</div>
                  </div>
                  {filteredServers.length > 0 ? (
                    filteredServers.map((server) => (
                      <div key={server.id} className="grid grid-cols-8 items-center p-2 text-sm border-b last:border-0">
                        <div className="col-span-2 font-medium">{server.name}</div>
                        <div>{getStatusBadge(server.status)}</div>
                        <div className="flex items-center gap-1">
                          {getServerTypeIcon(server.type)}
                          <span>{server.type}</span>
                        </div>
                        <div>{server.ip}</div>
                        <div>{server.os}</div>
                        <div>{server.cpu}, {server.memory}</div>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost">
                            <Cpu className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No servers match your search criteria.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="groups" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Server Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <p>Create server groups to manage multiple servers together.</p>
                  <Button className="mt-4">Create Server Group</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Server Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <p>Create server templates to quickly deploy standardized configurations.</p>
                  <Button className="mt-4">Create Template</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarWithProvider>
  );
};

export default ServersPage;
