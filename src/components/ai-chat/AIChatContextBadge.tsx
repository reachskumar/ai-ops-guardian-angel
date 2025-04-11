
import React from "react";
import { Cloud, Shield, Terminal, AlertTriangle, Zap } from "lucide-react";
import { DevOpsContext } from "@/services/aiChatService";

interface AIContextBadgeProps {
  activeContext: DevOpsContext | undefined;
  onContextChange: (context: DevOpsContext | undefined) => void;
}

const AIContextBadge: React.FC<AIContextBadgeProps> = ({ activeContext, onContextChange }) => {
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

export default AIContextBadge;
