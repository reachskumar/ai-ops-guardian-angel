import { supabase } from "@/integrations/supabase/client";

export type ChatMessage = {
  type: "user" | "system";
  content: string;
  timestamp: Date;
};

export type DevOpsContext = {
  infrastructure?: {
    provider: string;
    resources: string[];
  };
  security?: {
    tools: string[];
    frameworks: string[];
  };
  monitoring?: {
    tools: string[];
    metrics: string[];
  };
  incident?: {
    current: string[];
    history: string[];
  };
};

export const sendChatMessage = async (
  message: string,
  history: ChatMessage[],
  context?: DevOpsContext
): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke("chat-devops", {
      body: { message, history, context },
    });

    if (error) {
      console.error("Error calling AI service:", error);
      throw new Error(`Failed to get response: ${error.message}`);
    }

    return data.response;
  } catch (err) {
    console.error("Chat service error:", err);
    throw new Error("Failed to communicate with AI service");
  }
};

export const processCommand = async (
  command: string,
  type: "provision" | "security" | "monitoring" | "incident" | "iam"
): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke("chat-devops", {
      body: { 
        message: `Execute the following ${type} command: ${command}`,
        history: []
      },
    });

    if (error) throw new Error(`Failed to process command: ${error.message}`);
    return data.response;
  } catch (err) {
    console.error("Command processing error:", err);
    throw new Error("Failed to process command");
  }
};

export const simulateInfrastructureProvisioning = async (
  provider: string,
  resourceType: string,
  config: Record<string, any>
): Promise<{success: boolean; message: string; resourceId?: string}> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const success = Math.random() > 0.2;
    
    if (success) {
      return {
        success: true,
        message: `Successfully provisioned ${resourceType} on ${provider}`,
        resourceId: `${provider}-${resourceType}-${Date.now().toString(36)}`
      };
    } else {
      throw new Error(`Failed to provision resource due to ${
        ["quota limits", "permission issues", "configuration errors"][Math.floor(Math.random() * 3)]
      }`);
    }
  } catch (err) {
    console.error("Provisioning error:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Unknown error occurred"
    };
  }
};

export const runSecurityScan = async (
  target: string,
  scanType: string
): Promise<{success: boolean; findings: Array<{severity: string; description: string; remediation: string}>}> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const findingsCount = Math.floor(Math.random() * 5) + 1;
    const severities = ["critical", "high", "medium", "low", "info"];
    const findings = Array(findingsCount).fill(null).map(() => {
      const severity = severities[Math.floor(Math.random() * severities.length)];
      return {
        severity,
        description: `Sample ${severity} security issue in ${target}`,
        remediation: `Recommended action: update configurations and patch systems`
      };
    });
    
    return {
      success: true,
      findings
    };
  } catch (err) {
    console.error("Security scan error:", err);
    return {
      success: false,
      findings: []
    };
  }
};

export const fetchMonitoringMetrics = async (
  system: string,
  metricType: string,
  timeRange: string
): Promise<{metrics: Array<{timestamp: string; value: number}>}> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const now = new Date();
    const dataPoints = 24;
    let baseValue = Math.random() * 50 + 20;
    
    const metrics = Array(dataPoints).fill(null).map((_, i) => {
      const timestamp = new Date(now.getTime() - (dataPoints - i) * 60 * 60 * 1000).toISOString();
      baseValue = Math.max(0, baseValue + (Math.random() * 10 - 5));
      return {
        timestamp,
        value: Math.round(baseValue * 100) / 100
      };
    });
    
    return { metrics };
  } catch (err) {
    console.error("Metrics fetch error:", err);
    return { metrics: [] };
  }
};

export const createIncidentTicket = async (
  title: string,
  description: string,
  severity: string,
  assignee?: string
): Promise<{success: boolean; ticketId?: string; message: string}> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const ticketId = `INC-${Date.now().toString().slice(-6)}`;
    
    return {
      success: true,
      ticketId,
      message: `Successfully created incident ticket ${ticketId}`
    };
  } catch (err) {
    console.error("Incident creation error:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to create incident ticket"
    };
  }
};

export const getSystemStatusSummary = async (): Promise<{
  resources: { status: string; count: number };
  security: { status: string; alerts: number };
  incidents: { status: string; active: number };
}> => {
  return {
    resources: { status: "healthy", count: 24 },
    security: { status: "warning", alerts: 3 },
    incidents: { status: "critical", active: 1 },
  };
};
