
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, DollarSign, Server, Shield } from 'lucide-react';

interface DashboardOverviewProps {
  pendingApprovals: number;
  budgetRemaining: number;
  activeResources: number;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  pendingApprovals,
  budgetRemaining,
  activeResources
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium">Pending Approvals</p>
              <p className="text-2xl font-bold">{pendingApprovals}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Budget Remaining</p>
              <p className="text-2xl font-bold">₹{budgetRemaining}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Active Resources</p>
              <p className="text-2xl font-bold">{activeResources}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium">Compliance Score</p>
              <p className="text-2xl font-bold">98%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
