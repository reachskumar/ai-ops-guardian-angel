
export const mockClusters = [
  { 
    id: "cluster-1", 
    name: "production-cluster", 
    provider: "AWS EKS", 
    region: "us-west-2", 
    version: "1.26",
    status: "running",
    nodes: 5,
    cpu: "20 vCPU",
    memory: "80 GiB"
  },
  { 
    id: "cluster-2", 
    name: "staging-cluster", 
    provider: "GCP GKE", 
    region: "us-central1", 
    version: "1.25",
    status: "running",
    nodes: 3,
    cpu: "12 vCPU",
    memory: "48 GiB"
  },
  { 
    id: "cluster-3", 
    name: "dev-cluster", 
    provider: "Azure AKS", 
    region: "eastus", 
    version: "1.24",
    status: "stopped",
    nodes: 2,
    cpu: "8 vCPU",
    memory: "32 GiB"
  },
];
