
export interface CostTool {
  name: string;
  description: string;
  url: string;
  github?: string;
  tags: string[];
  features: string[];
  documentation: string;
  installation: string;
  commands?: string[];
  compatibleClouds: string[];
  screenshots?: string[];
}
