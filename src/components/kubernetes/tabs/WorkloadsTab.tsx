
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Box, Server, Database, Globe, Network } from "lucide-react";

// Mock data for demo
const mockDeployments = [
  { 
    id: "deploy-1", 
    name: "frontend", 
    namespace: "default",
    cluster: "production-cluster",
    replicas: "3/3",
    status: "Running",
    age: "5d",
    image: "nginx:1.19"
  },
  { 
    id: "deploy-2", 
    name: "backend-api", 
    namespace: "default",
    cluster: "production-cluster",
    replicas: "5/5",
    status: "Running",
    age: "5d",
    image: "api-service:v2.1"
  },
  { 
    id: "deploy-3", 
    name: "db-service", 
    namespace: "database",
    cluster: "production-cluster",
    replicas: "2/2",
    status: "Running",
    age: "5d",
    image: "postgres:13"
  },
  { 
    id: "deploy-4", 
    name: "cache", 
    namespace: "default",
    cluster: "production-cluster",
    replicas: "3/3",
    status: "Running",
    age: "2d",
    image: "redis:6.2"
  }
];

const mockPods = [
  { 
    id: "pod-1", 
    name: "frontend-5f7b8d69dc-xnpvr", 
    namespace: "default",
    node: "ip-10-0-1-23.ec2.internal",
    status: "Running",
    restarts: 0,
    age: "2d",
    ip: "10.0.5.12"
  },
  { 
    id: "pod-2", 
    name: "frontend-5f7b8d69dc-lk4jh", 
    namespace: "default",
    node: "ip-10-0-1-24.ec2.internal",
    status: "Running",
    restarts: 0,
    age: "2d",
    ip: "10.0.5.13"
  },
  { 
    id: "pod-3", 
    name: "backend-api-7d6f8b967c-1n23p", 
    namespace: "default",
    node: "ip-10-0-1-23.ec2.internal",
    status: "Running",
    restarts: 2,
    age: "5d",
    ip: "10.0.5.22"
  },
  { 
    id: "pod-4", 
    name: "db-service-statefulset-0", 
    namespace: "database",
    node: "ip-10-0-1-24.ec2.internal",
    status: "Running",
    restarts: 0,
    age: "5d",
    ip: "10.0.5.30"
  },
  { 
    id: "pod-5", 
    name: "metrics-server-58b4f6c9fb-j2tgp", 
    namespace: "kube-system",
    node: "ip-10-0-1-23.ec2.internal",
    status: "CrashLoopBackOff",
    restarts: 5,
    age: "1d",
    ip: "10.0.5.40"
  }
];

const mockServices = [
  { 
    id: "svc-1", 
    name: "frontend", 
    namespace: "default",
    type: "LoadBalancer",
    clusterIP: "10.100.71.156",
    externalIP: "34.102.123.45",
    ports: "80:30000/TCP",
    age: "5d"
  },
  { 
    id: "svc-2", 
    name: "backend-api", 
    namespace: "default",
    type: "ClusterIP",
    clusterIP: "10.100.71.157",
    externalIP: "-",
    ports: "8080/TCP",
    age: "5d"
  },
  { 
    id: "svc-3", 
    name: "db-service", 
    namespace: "database",
    type: "ClusterIP",
    clusterIP: "10.100.71.158",
    externalIP: "-",
    ports: "5432/TCP",
    age: "5d"
  }
];

const WorkloadsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="deployments">
        <TabsList className="mb-4">
          <TabsTrigger value="deployments" className="flex items-center gap-1">
            <Box className="h-4 w-4" />
            <span>Deployments</span>
          </TabsTrigger>
          <TabsTrigger value="pods" className="flex items-center gap-1">
            <Server className="h-4 w-4" />
            <span>Pods</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-1">
            <Network className="h-4 w-4" />
            <span>Services</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="deployments">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Namespace</TableHead>
                <TableHead>Cluster</TableHead>
                <TableHead>Replicas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Image</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDeployments.map((deployment) => (
                <TableRow key={deployment.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Box className="h-4 w-4 text-muted-foreground" />
                      {deployment.name}
                    </div>
                  </TableCell>
                  <TableCell>{deployment.namespace}</TableCell>
                  <TableCell>{deployment.cluster}</TableCell>
                  <TableCell>{deployment.replicas}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        deployment.status === "Running"
                          ? "border-green-500 text-green-500"
                          : "border-red-500 text-red-500"
                      }
                    >
                      {deployment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{deployment.age}</TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      {deployment.image}
                    </code>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        
        <TabsContent value="pods">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Namespace</TableHead>
                <TableHead>Node</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Restarts</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPods.map((pod) => (
                <TableRow key={pod.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      {pod.name}
                    </div>
                  </TableCell>
                  <TableCell>{pod.namespace}</TableCell>
                  <TableCell>{pod.node}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        pod.status === "Running"
                          ? "border-green-500 text-green-500"
                          : "border-red-500 text-red-500"
                      }
                    >
                      {pod.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={pod.restarts > 0 ? "text-amber-500 font-medium" : ""}>
                      {pod.restarts}
                    </span>
                  </TableCell>
                  <TableCell>{pod.age}</TableCell>
                  <TableCell>{pod.ip}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        
        <TabsContent value="services">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Namespace</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Cluster IP</TableHead>
                <TableHead>External IP</TableHead>
                <TableHead>Ports</TableHead>
                <TableHead>Age</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4 text-muted-foreground" />
                      {service.name}
                    </div>
                  </TableCell>
                  <TableCell>{service.namespace}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {service.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{service.clusterIP}</TableCell>
                  <TableCell>
                    {service.externalIP !== "-" ? (
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3 text-primary" />
                        {service.externalIP}
                      </div>
                    ) : (
                      service.externalIP
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-0.5 rounded text-xs">
                      {service.ports}
                    </code>
                  </TableCell>
                  <TableCell>{service.age}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkloadsTab;
