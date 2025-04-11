
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Code, Database, Activity } from "lucide-react";

interface ImplementationStep {
  id: string;
  title: string;
  description: string;
  category: "frontend" | "backend" | "integration" | "infrastructure";
  status: "not-started" | "in-progress" | "completed";
  complexity: "low" | "medium" | "high";
  dependencies?: string[];
}

const implementationSteps: ImplementationStep[] = [
  {
    id: "step-1",
    title: "Set up WebSocket Connection Service",
    description: "Create a service to manage WebSocket connections to data sources",
    category: "backend",
    status: "not-started",
    complexity: "medium"
  },
  {
    id: "step-2",
    title: "Create Data Transformation Layer",
    description: "Implement utilities to parse and transform real-time data",
    category: "backend",
    status: "not-started",
    complexity: "medium",
    dependencies: ["step-1"]
  },
  {
    id: "step-3",
    title: "Develop Real-time Data Hooks",
    description: "Create React hooks to manage real-time data state",
    category: "frontend",
    status: "not-started",
    complexity: "medium",
    dependencies: ["step-2"]
  },
  {
    id: "step-4",
    title: "Update UI Components for Real-time Updates",
    description: "Modify existing components to handle real-time data updates",
    category: "frontend",
    status: "not-started",
    complexity: "medium",
    dependencies: ["step-3"]
  },
  {
    id: "step-5",
    title: "Implement Error Handling & Reconnection Logic",
    description: "Add robust error handling and connection recovery for WebSockets",
    category: "integration",
    status: "not-started",
    complexity: "high",
    dependencies: ["step-1", "step-3"]
  },
  {
    id: "step-6",
    title: "Add Data Source Configuration UI",
    description: "Create interface for users to configure real-time data sources",
    category: "frontend",
    status: "not-started",
    complexity: "low",
    dependencies: []
  },
  {
    id: "step-7",
    title: "Integration with Authentication",
    description: "Secure WebSocket connections with proper authentication",
    category: "integration",
    status: "not-started",
    complexity: "high",
    dependencies: ["step-1"]
  },
  {
    id: "step-8",
    title: "Performance Optimization",
    description: "Optimize rendering and data processing for real-time updates",
    category: "frontend",
    status: "not-started",
    complexity: "high",
    dependencies: ["step-3", "step-4"]
  }
];

const ImplementationStepsTab: React.FC = () => {
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "frontend":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1">
            <Code className="h-3 w-3" />
            Frontend
          </Badge>
        );
      case "backend":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1">
            <Database className="h-3 w-3" />
            Backend
          </Badge>
        );
      case "integration":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Integration
          </Badge>
        );
      case "infrastructure":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Infrastructure
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">{category}</Badge>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            In Progress
          </Badge>
        );
      case "not-started":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300 flex items-center gap-1">
            Not Started
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">{status}</Badge>
        );
    }
  };

  const getComplexityBadge = (complexity: string) => {
    switch (complexity) {
      case "low":
        return <span className="text-green-600 font-medium">Low</span>;
      case "medium":
        return <span className="text-amber-600 font-medium">Medium</span>;
      case "high":
        return <span className="text-red-600 font-medium">High</span>;
      default:
        return <span>{complexity}</span>;
    }
  };

  const getDependenciesList = (dependencies?: string[]) => {
    if (!dependencies || dependencies.length === 0) {
      return <span className="text-gray-500">None</span>;
    }

    return (
      <ul className="list-disc list-inside">
        {dependencies.map((depId) => {
          const dep = implementationSteps.find(step => step.id === depId);
          return <li key={depId} className="text-sm">{dep?.title || depId}</li>;
        })}
      </ul>
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableCaption>Implementation steps for connecting to real-time data sources</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Step</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Complexity</TableHead>
            <TableHead>Dependencies</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {implementationSteps.map((step) => (
            <TableRow key={step.id}>
              <TableCell>
                <div className="font-medium">{step.title}</div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
              </TableCell>
              <TableCell>{getCategoryBadge(step.category)}</TableCell>
              <TableCell>{getStatusBadge(step.status)}</TableCell>
              <TableCell>{getComplexityBadge(step.complexity)}</TableCell>
              <TableCell>{getDependenciesList(step.dependencies)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ImplementationStepsTab;
