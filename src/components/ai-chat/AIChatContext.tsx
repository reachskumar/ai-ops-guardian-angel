
import React, { createContext, useState, useContext, ReactNode } from "react";
import { ChatMessage, DevOpsContext } from "@/services/aiChatService";
import { useChatQuery } from "@/hooks/useChatQuery";
 
interface AIChatContextType {
  messages: ChatMessage[];
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  currentCategory: string | null;
  setCurrentCategory: React.Dispatch<React.SetStateAction<string | null>>;
  context: DevOpsContext | undefined;
  setContext: React.Dispatch<React.SetStateAction<DevOpsContext | undefined>>;
  handleSendMessage: () => void;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

export const useAIChat = () => {
  const context = useContext(AIChatContext);
  if (!context) {
    throw new Error("useAIChat must be used within an AIChatProvider");
  }
  return context;
};

interface AIChatProviderProps {
  children: ReactNode;
}

export const AIChatProvider: React.FC<AIChatProviderProps> = ({ children }) => {
  const initialMessages = [
    {
      type: "system" as const,
      content: "Hello! I'm your AI DevOps assistant. How can I help you automate and optimize your infrastructure?",
      timestamp: new Date(),
    }
  ];
  
  const { messages, sendMessage, isLoading } = useChatQuery(initialMessages);
  const [input, setInput] = useState("");
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [context, setContext] = useState<DevOpsContext | undefined>(undefined);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Detect category from input
    const category = detectCommandCategory(input);
    setCurrentCategory(category);
    
    // Send message using react-query mutation
    sendMessage({ input, context });
    
    // Clear input
    setInput("");
    
    // Update context based on detected category
    if (category) {
      updateContextFromCategory(category);
    }
  };

  // Helper function to detect command category
  const detectCommandCategory = (message: string): string | null => {
    const lowerMessage = message.toLowerCase();
    
    const COMMAND_CATEGORIES = {
      provision: ["create", "deploy", "launch", "provision", "setup", "configure", "terraform", "ansible"],
      security: ["scan", "vulnerability", "compliance", "secure", "harden", "encrypt", "policy"],
      monitoring: ["monitor", "metrics", "status", "health", "performance", "alert", "threshold", "grafana"],
      incident: ["incident", "error", "problem", "ticket", "outage", "failure", "issue", "resolve"],
      iam: ["user", "permission", "access", "role", "identity", "authenticate", "authorize"]
    };
    
    for (const [category, keywords] of Object.entries(COMMAND_CATEGORIES)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return category;
      }
    }
    
    return null;
  };

  // Helper function to update context from category
  const updateContextFromCategory = (category: string) => {
    const newContext = { ...context };
    
    switch (category) {
      case 'provision':
        newContext.infrastructure = {
          provider: input.toLowerCase().includes('aws') ? 'AWS' : 
                  input.toLowerCase().includes('azure') ? 'Azure' : 
                  input.toLowerCase().includes('gcp') ? 'GCP' : 'Unknown',
          resources: ['Mentioned in chat']
        };
        break;
      case 'security':
        newContext.security = {
          tools: ['Mentioned in chat'],
          frameworks: ['Mentioned in chat']
        };
        break;
      case 'monitoring':
        newContext.monitoring = {
          tools: ['Mentioned in chat'],
          metrics: ['Mentioned in chat']
        };
        break;
      case 'incident':
        newContext.incident = {
          current: ['Mentioned in chat'],
          history: []
        };
        break;
    }
    
    setContext(newContext);
  };

  return (
    <AIChatContext.Provider
      value={{
        messages,
        input,
        setInput,
        isLoading, 
        currentCategory,
        setCurrentCategory,
        context,
        setContext,
        handleSendMessage
      }}
    >
      {children}
    </AIChatContext.Provider>
  );
};
