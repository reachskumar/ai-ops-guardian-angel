
export interface FeatureStatus {
  id: string;
  name: string;
  description: string;
  status: "completed" | "in-progress" | "planned";
  dataStatus: "real" | "mock";
  pendingTasks: string[];
  category: "infrastructure" | "security" | "monitoring" | "collaboration" | "cloud" | "analytics" | "devops" | "other";
}
