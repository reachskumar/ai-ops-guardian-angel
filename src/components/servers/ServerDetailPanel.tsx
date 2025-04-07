
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Server, 
  HardDrive, 
  Cpu, 
  MemoryStick, 
  Network, 
  Globe,
  PowerOff, 
  Play, 
  AlertTriangle,
  RotateCw
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

interface ServerDetailPanelProps {
  server: {
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
}

const ServerDetailPanel: React.FC<ServerDetailPanelProps> = ({ server }) => {
  const navigate = useNavigate();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-green-500";
      case "stopped": return "bg-gray-500";
      case "warning": return "bg-amber-500";
      case "maintenance": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  // Simulate resource usage metrics
  const cpuUsage = Math.floor(Math.random() * 100);
  const memoryUsage = Math.floor(Math.random() * 100);
  const diskUsage = Math.floor(Math.random() * 100);
  const networkUsage = Math.floor(Math.random() * 100);
  
  const getResourceColor = (value: number) => {
    if (value >= 80) return "bg-red-500";
    if (value >= 60) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{server.name}</CardTitle>
            <Badge className={`${getStatusColor(server.status)} text-white`}>
              {server.status}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {server.type} • {server.ip}
          </div>
        </div>
        
        <div className="flex gap-2">
          {server.status === "running" ? (
            <Button size="sm" variant="outline">
              <PowerOff className="h-4 w-4 mr-2 text-red-500" />
              Stop
            </Button>
          ) : server.status === "stopped" ? (
            <Button size="sm" variant="outline">
              <Play className="h-4 w-4 mr-2 text-green-500" />
              Start
            </Button>
          ) : null}
          
          <Button size="sm" variant="outline">
            <RotateCw className="h-4 w-4 mr-2" />
            Restart
          </Button>
          
          <Button 
            size="sm" 
            variant="default"
            onClick={() => navigate(`/servers/${server.id}`)}
          >
            Details
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Cpu className="h-3.5 w-3.5" /> CPU
            </span>
            <span className="font-medium">{server.cpu}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <MemoryStick className="h-3.5 w-3.5" /> Memory
            </span>
            <span className="font-medium">{server.memory}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <HardDrive className="h-3.5 w-3.5" /> OS
            </span>
            <span className="font-medium">{server.os}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" /> Region
            </span>
            <span className="font-medium">{server.region}</span>
          </div>
        </div>
        
        {/* Resource usage */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5 text-blue-500" /> CPU Usage
              </span>
              <span className={cpuUsage > 80 ? "text-red-500" : ""}>{cpuUsage}%</span>
            </div>
            <Progress value={cpuUsage} className={`h-1.5 ${getResourceColor(cpuUsage)}`} />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <MemoryStick className="h-3.5 w-3.5 text-green-500" /> Memory Usage
              </span>
              <span className={memoryUsage > 80 ? "text-red-500" : ""}>{memoryUsage}%</span>
            </div>
            <Progress value={memoryUsage} className={`h-1.5 ${getResourceColor(memoryUsage)}`} />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <HardDrive className="h-3.5 w-3.5 text-amber-500" /> Disk Usage
              </span>
              <span className={diskUsage > 80 ? "text-red-500" : ""}>{diskUsage}%</span>
            </div>
            <Progress value={diskUsage} className={`h-1.5 ${getResourceColor(diskUsage)}`} />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <Network className="h-3.5 w-3.5 text-purple-500" /> Network I/O
              </span>
              <span>{networkUsage} MB/s</span>
            </div>
            <Progress value={networkUsage} className={`h-1.5 ${getResourceColor(networkUsage)}`} />
          </div>
        </div>
        
        {server.status === "warning" && (
          <div className="mt-4 p-2 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-amber-700">
              High CPU utilization detected
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServerDetailPanel;
