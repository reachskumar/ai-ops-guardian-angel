
import React from "react";
import { SidebarWithProvider } from "@/components/Sidebar";
import Header from "@/components/Header";
import TeamWorkspace from "@/components/collaboration/TeamWorkspace"; 

const CollaborationPage: React.FC = () => {
  return (
    <SidebarWithProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Team Collaboration</h1>
            <p className="text-muted-foreground">
              Work together with your team to manage infrastructure and resolve incidents
            </p>
          </div>
          
          <TeamWorkspace 
            onCreateWorkItem={() => console.log('Creating work item')}
            onViewWorkItem={(id) => console.log('Viewing work item', id)}
          />
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default CollaborationPage;
