
import React from "react";
import { SidebarWithProvider } from "@/components/Sidebar";
import Header from "@/components/Header";
import ProjectKanban from "@/components/kanban/ProjectKanban";

const ProjectKanbanPage: React.FC = () => {
  return (
    <SidebarWithProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Project Kanban</h1>
            <p className="text-muted-foreground">
              Track the progress of all features and implementation status
            </p>
          </div>
          
          <ProjectKanban />
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default ProjectKanbanPage;
