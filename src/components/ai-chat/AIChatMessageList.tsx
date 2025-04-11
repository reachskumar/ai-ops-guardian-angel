
import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Bot } from "lucide-react";
import { useAIChat } from "./AIChatContext";

const AIChatMessageList: React.FC = () => {
  const { messages } = useAIChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  return (
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
  );
};

export default AIChatMessageList;
