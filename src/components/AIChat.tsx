
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
  Users,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendChatMessage, ChatMessage, DevOpsContext } from "@/services/aiChatService";
import { useAuth } from "@/providers/AuthProvider";

// DevOps command categories with keywords
const COMMAND_CATEGORIES = {
  provision: ["create", "deploy", "launch", "provision", "setup", "configure", "terraform", "ansible"],
  security: ["scan", "vulnerability", "compliance", "secure", "harden", "encrypt", "policy"],
  monitoring: ["monitor", "metrics", "status", "health", "performance", "alert", "threshold", "grafana"],
  incident: ["incident", "error", "problem", "ticket", "outage", "failure", "issue", "resolve"],
  iam: ["user", "permission", "access", "role", "identity", "authenticate", "authorize"]
};

interface AIContextProps {
  activeContext: DevOpsContext | undefined;
  onContextChange: (context: DevOpsContext | undefined) => void;
}

const AIContextBadge: React.FC<AIContextProps> = ({ activeContext, onContextChange }) => {
  if (!activeContext) return null;
  
  const contextTypes = Object.keys(activeContext).filter(key => 
    activeContext[key as keyof DevOpsContext] !== undefined
  );
  
  if (contextTypes.length === 0) return null;
  
  const getContextIcon = (type: string) => {
    switch (type) {
      case 'infrastructure': return <Cloud className="h-3 w-3 mr-1" />;
      case 'security': return <Shield className="h-3 w-3 mr-1" />;
      case 'monitoring': return <Terminal className="h-3 w-3 mr-1" />;
      case 'incident': return <AlertTriangle className="h-3 w-3 mr-1" />;
      default: return <Zap className="h-3 w-3 mr-1" />;
    }
  };
  
  return (
    <div className="flex flex-wrap gap-1 mb-2">
      {contextTypes.map(type => (
        <div 
          key={type}
          className="bg-secondary text-secondary-foreground text-xs py-1 px-2 rounded-full flex items-center"
        >
          {getContextIcon(type)}
          <span className="capitalize">{type}</span>
          <button 
            className="ml-1 hover:text-primary" 
            onClick={() => {
              const newContext = { ...activeContext };
              delete newContext[type as keyof DevOpsContext];
              if (Object.keys(newContext).length === 0) {
                onContextChange(undefined);
              } else {
                onContextChange(newContext);
              }
            }}
          >
            &times;
          </button>
        </div>
      ))}
      
      {contextTypes.length > 0 && (
        <button 
          className="text-xs text-muted-foreground underline"
          onClick={() => onContextChange(undefined)}
        >
          Clear All
        </button>
      )}
    </div>
  );
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
  const [context, setContext] = useState<DevOpsContext | undefined>(undefined);
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
        messages.slice(-10), // Send recent context
        context
      );

      const systemMessage: ChatMessage = {
        type: "system",
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, systemMessage]);
      
      // Update context based on the detected category
      if (category) {
        // This is a simplified context update - in a real app, you'd extract more details
        const newContext: DevOpsContext = { ...context };
        
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
      <CardContent className="p-4 flex-1 flex flex-col">
        <AIContextBadge activeContext={context} onContextChange={setContext} />
        
        <ScrollArea className="flex-1 pr-4 space-y-4">
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
      </CardContent>
      
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
