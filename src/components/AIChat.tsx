
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Send, Bot, User, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Message = {
  type: "user" | "system";
  content: string;
  timestamp: Date;
};

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "system",
      content: "Hello! I'm your AI DevOps assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      type: "user" as const,
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      let response: string;

      if (input.toLowerCase().includes("provision") || input.toLowerCase().includes("create")) {
        response = "I can help you provision resources. I'm currently configured to work with AWS, Azure, and GCP. What cloud provider and resources would you like to provision?";
      } else if (input.toLowerCase().includes("security") || input.toLowerCase().includes("vulnerability")) {
        response = "I can run security scans on your infrastructure and applications. Would you like me to initiate a security scan or provide a compliance report?";
      } else if (input.toLowerCase().includes("monitor") || input.toLowerCase().includes("metrics")) {
        response = "I can show you monitoring data. What specific metrics are you looking for? (e.g., CPU usage, memory, service health)";
      } else if (input.toLowerCase().includes("incident") || input.toLowerCase().includes("issue")) {
        response = "I can help create and manage incidents. Would you like me to create a new incident or show you the status of existing incidents?";
      } else if (input.toLowerCase().includes("restart") || input.toLowerCase().includes("scale")) {
        response = "I can perform automation actions like restarting services or scaling resources. Please provide more details about what you'd like to do.";
      } else {
        response = "I'm here to help with DevOps automation, infrastructure provisioning, security checks, monitoring, incidents, and more. How can I assist you with your operations today?";
      }

      const systemMessage = {
        type: "system" as const,
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, systemMessage]);
      setIsLoading(false);
      
      toast({
        title: "AI Processing Complete",
        description: "Your request has been processed",
      });
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
                  {msg.type === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    msg.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
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
                  <div className="dot-pulse">
                    <div className="dot-pulse-item"></div>
                    <div className="dot-pulse-item"></div>
                    <div className="dot-pulse-item"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default AIChat;
