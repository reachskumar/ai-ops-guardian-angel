
import React from 'react';
import { SidebarWithProvider } from '@/components/Sidebar';
import CostAnalysisPanel from '@/components/cloud/CostAnalysisPanel';
import OpenSourceCostTools from '@/components/cloud/OpenSourceCostTools';

const CostAnalysisPage: React.FC = () => {
  return (
    <SidebarWithProvider>
      <div className="container mx-auto py-6 px-4 space-y-6">
        <CostAnalysisPanel />
        <OpenSourceCostTools />
      </div>
    </SidebarWithProvider>
  );
};

export default CostAnalysisPage;
