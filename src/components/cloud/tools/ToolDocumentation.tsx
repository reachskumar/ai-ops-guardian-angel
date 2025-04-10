
import React from "react";
import { CostTool } from "./types";

interface ToolDocumentationProps {
  tool: CostTool;
}

const ToolDocumentation: React.FC<ToolDocumentationProps> = ({ tool }) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold text-lg mb-2">{tool.name} Documentation</h3>
      <div className="text-sm text-muted-foreground mb-4">
        <p>{tool.documentation}</p>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Installation:</h4>
        <div className="bg-muted p-3 rounded-md text-xs font-mono whitespace-pre overflow-x-auto">
          {tool.installation.replace(/```bash\n|\n```/g, '')}
        </div>
      </div>
      
      {tool.commands && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Common Commands:</h4>
          <ul className="space-y-1">
            {tool.commands.map((command, index) => (
              <li key={index} className="bg-muted p-2 rounded-md text-xs font-mono">
                {command}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ToolDocumentation;
