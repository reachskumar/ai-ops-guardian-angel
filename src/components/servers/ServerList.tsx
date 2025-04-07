
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cpu, Server as ServerIcon, Shield, Settings, HardDrive, Network, Cpu as CpuIcon } from "lucide-react";

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

interface ServerListProps {
  servers: ServerItem[];
  searchQuery: string;
}

const ServerList: React.FC<ServerListProps> = ({ servers, searchQuery }) => {
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
        return <ServerIcon className="h-4 w-4 text-blue-500" />;
      case "database":
        return <HardDrive className="h-4 w-4 text-emerald-500" />;
      case "application":
        return <CpuIcon className="h-4 w-4 text-purple-500" />;
      case "cache":
        return <Network className="h-4 w-4 text-amber-500" />;
      default:
        return <ServerIcon className="h-4 w-4" />;
    }
  };

  return (
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
            <div className="col-span-2 font-medium">
              <Link to={`/servers/${server.id}`} className="hover:text-primary hover:underline">
                {server.name}
              </Link>
            </div>
            <div>{getStatusBadge(server.status)}</div>
            <div className="flex items-center gap-1">
              {getServerTypeIcon(server.type)}
              <span>{server.type}</span>
            </div>
            <div>{server.ip}</div>
            <div>{server.os}</div>
            <div>{server.cpu}, {server.memory}</div>
            <div className="flex justify-end gap-2">
              <Link to={`/servers/${server.id}`}>
                <Button size="sm" variant="ghost">
                  <Cpu className="h-4 w-4" />
                </Button>
              </Link>
              <Link to={`/servers/${server.id}?tab=security`}>
                <Button size="sm" variant="ghost">
                  <Shield className="h-4 w-4" />
                </Button>
              </Link>
              <Link to={`/servers/${server.id}?tab=settings`}>
                <Button size="sm" variant="ghost">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ))
      ) : (
        <div className="p-4 text-center text-muted-foreground">
          No servers match your search criteria.
        </div>
      )}
    </div>
  );
};

export default ServerList;
