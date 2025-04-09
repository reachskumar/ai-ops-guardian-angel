
import React from 'react';
import { SidebarWithProvider } from '@/components/Sidebar';
import CostAnalysisPanel from '@/components/cloud/CostAnalysisPanel';

const CostAnalysisPage: React.FC = () => {
  return (
    <SidebarWithProvider>
      <div className="container mx-auto py-6 px-4">
        <CostAnalysisPanel />
      </div>
    </SidebarWithProvider>
  );
};

export default CostAnalysisPage;
