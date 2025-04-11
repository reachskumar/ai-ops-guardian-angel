
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AIChatProvider, AIContextBadge, AIChatMessageList, AIChatInputForm } from "@/components/ai-chat";
import { useAIChat } from "@/components/ai-chat/AIChatContext";

const AIChatInner: React.FC = () => {
  const { context, setContext } = useAIChat();
  
  return (
    <>
      <CardContent className="p-4 flex-1 flex flex-col">
        <AIContextBadge activeContext={context} onContextChange={setContext} />
        <AIChatMessageList />
      </CardContent>
      
      <CardFooter className="border-t p-4">
        <AIChatInputForm />
      </CardFooter>
    </>
  );
};

const AIChat: React.FC = () => {
  return (
    <Card className="h-full flex flex-col border border-border">
      <AIChatProvider>
        <AIChatInner />
      </AIChatProvider>
    </Card>
  );
};

export default AIChat;
