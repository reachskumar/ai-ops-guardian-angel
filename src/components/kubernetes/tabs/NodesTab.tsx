
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Server, Cpu, MemoryStick } from "lucide-react";

// Mock data for demo
const mockNodes = [
  { 
    id: "node-1", 
    name: "ip-10-0-1-23.ec2.internal", 
    cluster: "production-cluster",
    instanceType: "t3.large",
    status: "Ready",
    age: "10d",
    cpuUsage: 67,
    memoryUsage: 72,
    pods: "18/23"
  },
  { 
    id: "node-2", 
    name: "ip-10-0-1-24.ec2.internal", 
    cluster: "production-cluster",
    instanceType: "t3.large",
    status: "Ready",
    age: "10d",
    cpuUsage: 42,
    memoryUsage: 51,
    pods: "15/23"
  },
  { 
    id: "node-3", 
    name: "gke-staging-default-node-1",
    cluster: "staging-cluster",
    instanceType: "e2-standard-4",
    status: "Ready",
    age: "5d",
    cpuUsage: 34,
    memoryUsage: 40,
    pods: "10/23"
  },
  { 
    id: "node-4", 
    name: "gke-staging-default-node-2",
    cluster: "staging-cluster",
    instanceType: "e2-standard-4",
    status: "NotReady",
    age: "5d",
    cpuUsage: 0,
    memoryUsage: 0,
    pods: "0/23"
  },
  { 
    id: "node-5", 
    name: "aks-dev-12345-vmss00000",
    cluster: "dev-cluster",
    instanceType: "Standard_D4s_v3",
    status: "Ready",
    age: "2d",
    cpuUsage: 21,
    memoryUsage: 35,
    pods: "8/30"
  },
];

const NodesTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border border-border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Total Nodes</h4>
            <Server className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">5</p>
          <p className="text-xs text-muted-foreground mt-1">Across 3 clusters</p>
        </div>
        <div className="border border-border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Average CPU Usage</h4>
            <Cpu className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">41%</p>
          <Progress value={41} className="h-1.5 mt-2" />
        </div>
        <div className="border border-border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Average Memory Usage</h4>
            <MemoryStick className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">49.6%</p>
          <Progress value={49.6} className="h-1.5 mt-2" />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Node</TableHead>
            <TableHead>Cluster</TableHead>
            <TableHead>Instance Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>CPU</TableHead>
            <TableHead>Memory</TableHead>
            <TableHead>Pods</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockNodes.map((node) => (
            <TableRow key={node.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  {node.name}
                </div>
              </TableCell>
              <TableCell>{node.cluster}</TableCell>
              <TableCell>{node.instanceType}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    node.status === "Ready"
                      ? "border-green-500 text-green-500"
                      : "border-red-500 text-red-500"
                  }
                >
                  {node.status}
                </Badge>
              </TableCell>
              <TableCell>{node.age}</TableCell>
              <TableCell>
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">{node.cpuUsage}%</span>
                  </div>
                  <Progress 
                    value={node.cpuUsage} 
                    className="h-1.5"
                    indicatorClassName={
                      node.cpuUsage > 80 ? "bg-red-500" :
                      node.cpuUsage > 60 ? "bg-amber-500" :
                      "bg-green-500"
                    } 
                  />
                </div>
              </TableCell>
              <TableCell>
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">{node.memoryUsage}%</span>
                  </div>
                  <Progress 
                    value={node.memoryUsage} 
                    className="h-1.5"
                    indicatorClassName={
                      node.memoryUsage > 80 ? "bg-red-500" :
                      node.memoryUsage > 60 ? "bg-amber-500" :
                      "bg-green-500"
                    } 
                  />
                </div>
              </TableCell>
              <TableCell>{node.pods}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default NodesTab;
