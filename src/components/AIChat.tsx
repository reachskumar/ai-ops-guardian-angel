
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Send, Bot, User, Loader, Zap, Shield, Bell, Cloud, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendChatMessage, ChatMessage } from "@/services/aiChatService";
import { useAuth } from "@/providers/AuthProvider";

const MESSAGE_CATEGORIES = {
  provision: ["create", "provision", "deploy", "launch", "setup", "ec2", "instance", "cluster"],
  security: ["security", "scan", "vulnerability", "compliance", "cis", "benchmark", "audit"],
  monitoring: ["monitor", "metrics", "cpu", "memory", "disk", "network", "status", "health"],
  incident: ["incident", "alert", "error", "failure", "outage", "problem", "ticket", "issue"],
  iam: ["user", "permission", "role", "access", "iam", "account", "auth", "identity"],
};

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      type: "system",
      content: "Hello! I'm your AI DevOps assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [categoryHighlight, setCategoryHighlight] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const detectMessageCategory = (message: string): string | null => {
    const lowerMessage = message.toLowerCase();
    
    for (const [category, keywords] of Object.entries(MESSAGE_CATEGORIES)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return category;
      }
    }
    
    return null;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Detect the category for UI highlighting
    const category = detectMessageCategory(input);
    setCategoryHighlight(category);
    
    const userMessage = {
      type: "user" as const,
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Get AI response from our service
      const response = await sendChatMessage(
        input, 
        // Only send the last 10 messages for context
        messages.slice(-10)
      );

      const systemMessage = {
        type: "system" as const,
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, systemMessage]);
      
      // Show a toast notification 
      toast({
        title: "AI Response Received",
        description: "Your request has been processed",
      });
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      const errorMessage = {
        type: "system" as const,
        content: "Sorry, I encountered an error processing your request. Please try again later.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setCategoryHighlight(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get the icon for the message based on content analysis
  const getMessageIcon = (message: ChatMessage) => {
    if (message.type === "user") return <User size={16} />;
    
    const content = message.content.toLowerCase();
    
    if (content.includes("provision") || content.includes("create") || content.includes("deploy")) {
      return <Cloud size={16} />;
    } else if (content.includes("security") || content.includes("vulnerability") || content.includes("compliance")) {
      return <Shield size={16} />;
    } else if (content.includes("incident") || content.includes("alert") || content.includes("error")) {
      return <Bell size={16} />;
    } else if (content.includes("user") || content.includes("permission") || content.includes("role")) {
      return <Users size={16} />;
    } else if (content.includes("monitor") || content.includes("metric") || content.includes("status")) {
      return <Zap size={16} />;
    }
    
    return <Bot size={16} />;
  };

  return (
    <Card className="h-full border border-border bg-card flex flex-col">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start gap-2 max-w-[80%] ${
                  msg.type === "user"
                    ? "flex-row-reverse"
                    : "flex-row"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {msg.type === "user" ? <User size={16} /> : getMessageIcon(msg)}
                </div>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    msg.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2 max-w-[80%]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground">
                  <Bot size={16} />
                </div>
                <div className="rounded-lg px-4 py-2 bg-secondary text-secondary-foreground">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-background animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-background animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-background animate-bounce" style={{ animationDelay: "600ms" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <CardFooter className="border-t border-border p-4">
        <form 
          className="flex w-full gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <Input
            placeholder="Type a command or ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1"
            disabled={isLoading || !user}
          />
          <Button type="submit" disabled={isLoading || !input.trim() || !user}>
            {isLoading ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default AIChat;
