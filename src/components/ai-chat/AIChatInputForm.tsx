
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader, Cloud, Shield, Terminal, AlertTriangle, Users, Bot } from "lucide-react";
import { useAIChat } from "./AIChatContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const AIChatInputForm: React.FC = () => {
  const { 
    input, 
    setInput, 
    isLoading, 
    currentCategory, 
    handleSendMessage
  } = useAIChat();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use the chat.",
        variant: "destructive",
      });
      return;
    }
    
    handleSendMessage();
    
    toast({
      title: "DevOps AI Response",
      description: "Processing your request...",
    });
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
      onSubmit={handleSubmit} 
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
