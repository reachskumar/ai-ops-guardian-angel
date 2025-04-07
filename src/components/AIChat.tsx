
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { 
  Send, 
  Bot, 
  User, 
  Loader, 
  Cloud, 
  Shield, 
  Terminal, 
  AlertTriangle, 
  Users 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendChatMessage, ChatMessage } from "@/services/aiChatService";
import { useAuth } from "@/providers/AuthProvider";

// DevOps command categories with keywords
const COMMAND_CATEGORIES = {
  provision: ["create", "deploy", "launch", "provision", "setup", "configure"],
  security: ["scan", "vulnerability", "compliance", "secure", "harden"],
  monitoring: ["monitor", "metrics", "status", "health", "performance"],
  incident: ["incident", "alert", "error", "problem", "ticket"],
  iam: ["user", "permission", "access", "role", "identity"]
};

const AIChat: React.FC = () => {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const detectCommandCategory = (message: string): string | null => {
    const lowerMessage = message.toLowerCase();
    
    for (const [category, keywords] of Object.entries(COMMAND_CATEGORIES)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return category;
      }
    }
    
    return null;
  };

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const category = detectCommandCategory(input);
    setCurrentCategory(category);
    
    const userMessage: ChatMessage = {
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendChatMessage(
        input, 
        messages.slice(-10)  // Send recent context
      );

      const systemMessage: ChatMessage = {
        type: "system",
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, systemMessage]);
      
      toast({
        title: "DevOps AI Response",
        description: "Received insights from your AI assistant",
      });
    } catch (error) {
      console.error("Chat error:", error);
      
      const errorMessage: ChatMessage = {
        type: "system",
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
    <Card className="h-full flex flex-col border border-border">
      <ScrollArea className="flex-1 p-4 space-y-4">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div className="max-w-[80%] flex items-start gap-2">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center 
                ${msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}
              `}>
                {msg.type === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`
                rounded-lg p-3 
                ${msg.type === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground'}
              `}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <small className="text-xs opacity-60 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </small>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>
      
      <CardFooter className="border-t p-4">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }} 
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
      </CardFooter>
    </Card>
  );
};

export default AIChat;
