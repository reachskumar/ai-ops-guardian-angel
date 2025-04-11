
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader, Cloud, Shield, Terminal, AlertTriangle, Users, Bot } from "lucide-react";
import { useAIChat } from "./AIChatContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { sendChatMessage } from "@/services/aiChatService";

// Command categories with keywords
const COMMAND_CATEGORIES = {
  provision: ["create", "deploy", "launch", "provision", "setup", "configure", "terraform", "ansible"],
  security: ["scan", "vulnerability", "compliance", "secure", "harden", "encrypt", "policy"],
  monitoring: ["monitor", "metrics", "status", "health", "performance", "alert", "threshold", "grafana"],
  incident: ["incident", "error", "problem", "ticket", "outage", "failure", "issue", "resolve"],
  iam: ["user", "permission", "access", "role", "identity", "authenticate", "authorize"]
};

const AIChatInputForm: React.FC = () => {
  const { 
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
  } = useAIChat();
  const { toast } = useToast();
  const { user } = useAuth();

  const detectCommandCategory = (message: string): string | null => {
    const lowerMessage = message.toLowerCase();
    
    for (const [category, keywords] of Object.entries(COMMAND_CATEGORIES)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return category;
      }
    }
    
    return null;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const category = detectCommandCategory(input);
    setCurrentCategory(category);
    
    const userMessage = {
      type: "user" as const,
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendChatMessage(
        input, 
        messages.slice(-10), // Send recent context
        context
      );

      const systemMessage = {
        type: "system" as const,
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, systemMessage]);
      
      // Update context based on the detected category
      if (category) {
        // This is a simplified context update - in a real app, you'd extract more details
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
      }
      
      toast({
        title: "DevOps AI Response",
        description: "Received insights from your AI assistant",
      });
    } catch (error) {
      console.error("Chat error:", error);
      
      const errorMessage = {
        type: "system" as const,
        content: "Sorry, I couldn't process your request. Please try again.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Communication Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setCurrentCategory(null);
    }
  };

  const getCommandIcon = (category: string | null) => {
    switch (category) {
      case 'provision': return <Cloud className="mr-2 h-4 w-4" />;
      case 'security': return <Shield className="mr-2 h-4 w-4" />;
      case 'monitoring': return <Terminal className="mr-2 h-4 w-4" />;
      case 'incident': return <AlertTriangle className="mr-2 h-4 w-4" />;
      case 'iam': return <Users className="mr-2 h-4 w-4" />;
      default: return <Bot className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <form 
      onSubmit={handleSend} 
      className="flex w-full space-x-2"
    >
      <Input 
        placeholder="Enter your DevOps command or query..." 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading || !user}
        className="flex-1"
      />
      <Button 
        type="submit" 
        disabled={isLoading || !input.trim() || !user}
      >
        {isLoading ? (
          <Loader className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <>
            {getCommandIcon(currentCategory)}
            <Send className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
};

export default AIChatInputForm;
