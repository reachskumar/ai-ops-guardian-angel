
import { supabase } from "@/integrations/supabase/client";

export type ChatMessage = {
  type: "user" | "system";
  content: string;
  timestamp: Date;
};

export const sendChatMessage = async (
  message: string,
  history: ChatMessage[]
): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke("chat-devops", {
      body: { message, history },
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
  // This function will be expanded as we implement more features
  // For now it just passes commands to the AI
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

// This will be expanded as we implement more specific functionality
export const getSystemStatusSummary = async (): Promise<{
  resources: { status: string; count: number };
  security: { status: string; alerts: number };
  incidents: { status: string; active: number };
}> => {
  // Mock implementation - will be replaced with actual data
  return {
    resources: { status: "healthy", count: 24 },
    security: { status: "warning", alerts: 3 },
    incidents: { status: "critical", active: 1 },
  };
};
