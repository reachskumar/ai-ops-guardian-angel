
export const mockConfigMaps = [
  { 
    id: "cm-1", 
    name: "app-config", 
    namespace: "default",
    cluster: "production-cluster",
    keys: 5,
    age: "5d"
  },
  { 
    id: "cm-2", 
    name: "nginx-conf", 
    namespace: "default",
    cluster: "production-cluster",
    keys: 2,
    age: "5d"
  },
  { 
    id: "cm-3", 
    name: "prometheus-config", 
    namespace: "monitoring",
    cluster: "production-cluster",
    keys: 8,
    age: "2d"
  }
];

export const mockSecrets = [
  { 
    id: "secret-1", 
    name: "db-credentials", 
    namespace: "default",
    cluster: "production-cluster",
    type: "Opaque",
    keys: 3,
    age: "5d"
  },
  { 
    id: "secret-2", 
    name: "api-keys", 
    namespace: "default",
    cluster: "production-cluster",
    type: "Opaque",
    keys: 2,
    age: "3d"
  },
  { 
    id: "secret-3", 
    name: "tls-cert", 
    namespace: "default",
    cluster: "production-cluster",
    type: "kubernetes.io/tls",
    keys: 2,
    age: "10d"
  }
];
