
// Pre-generate static data for dashboard components
export const staticCpuData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  value: Math.floor(Math.random() * 30) + 40,
}));

export const staticMemoryData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  value: Math.floor(Math.random() * 25) + 60,
}));

export const staticNetworkData = ["Web", "API", "Auth", "Database", "Cache"].map(
  (name, i) => ({
    name,
    value: Math.floor(Math.random() * 400) + 100,
  })
);

export const staticStorageData = [
  { name: "Used", value: 320 },
  { name: "Available", value: 680 },
];

// Infrastructure resources data
export const infrastructureResources = [
  { id: "i-12345", type: "EC2", status: "running", region: "us-east-1", provider: "AWS" },
  { id: "vm-67890", type: "VM", status: "running", region: "eastus", provider: "Azure" },
  { id: "inst-abcde", type: "GCE", status: "stopped", region: "us-central1", provider: "GCP" },
  { id: "rds-98765", type: "RDS", status: "running", region: "us-east-1", provider: "AWS" },
  { id: "s3-11223", type: "S3", status: "available", region: "global", provider: "AWS" }
];

// Security findings data
export const securityFindings = [
  { id: "vuln-001", severity: "critical", description: "Exposed API key", asset: "API Gateway", date: "2 days ago" },
  { id: "vuln-002", severity: "high", description: "Outdated OS version", asset: "Web Server", date: "1 week ago" },
  { id: "vuln-003", severity: "medium", description: "TLS 1.0 enabled", asset: "Load Balancer", date: "3 days ago" }
];
