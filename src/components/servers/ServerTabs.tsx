
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ServerList from "./ServerList";

interface ServerItem {
  id: string;
  name: string;
  status: string;
  type: string;
  ip: string;
  os: string;
  cpu: string;
  memory: string;
  region: string;
}

interface ServerTabsProps {
  servers: ServerItem[];
  searchQuery: string;
}

const ServerTabs: React.FC<ServerTabsProps> = ({ servers, searchQuery }) => {
  return (
    <Tabs defaultValue="servers" className="space-y-4">
      <TabsList>
        <TabsTrigger value="servers">Servers</TabsTrigger>
        <TabsTrigger value="groups">Server Groups</TabsTrigger>
        <TabsTrigger value="templates">Templates</TabsTrigger>
      </TabsList>
      
      <TabsContent value="servers" className="space-y-4">
        <Card>
          <CardContent className="p-0">
            <ServerList servers={servers} searchQuery={searchQuery} />
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
  );
};

export default ServerTabs;
