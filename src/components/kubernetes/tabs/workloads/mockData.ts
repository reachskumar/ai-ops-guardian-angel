
// Mock data for kubernetes workloads components

export const mockDeployments = [
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

export const mockPods = [
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

export const mockServices = [
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
