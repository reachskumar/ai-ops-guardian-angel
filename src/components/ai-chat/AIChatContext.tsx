
import React, { createContext, useState, useContext, ReactNode } from "react";
import { ChatMessage, DevOpsContext } from "@/services/aiChatService";
 
interface AIChatContextType {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  currentCategory: string | null;
  setCurrentCategory: React.Dispatch<React.SetStateAction<string | null>>;
  context: DevOpsContext | undefined;
  setContext: React.Dispatch<React.SetStateAction<DevOpsContext | undefined>>;
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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      type: "system",
      content: "Hello! I'm your AI DevOps assistant. How can I help you automate and optimize your infrastructure?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [context, setContext] = useState<DevOpsContext | undefined>(undefined);

  return (
    <AIChatContext.Provider
      value={{
        messages,
        setMessages,
        input,
        setInput,
        isLoading, 
        setIsLoading,
        currentCategory,
        setCurrentCategory,
        context,
        setContext
      }}
    >
      {children}
    </AIChatContext.Provider>
  );
};
