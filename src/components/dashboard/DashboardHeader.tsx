
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Shield, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DashboardHeaderProps {
  refreshData: () => void;
  isRefreshing?: boolean; // Make isRefreshing optional
  complianceStatus?: {
    pci: 'passing' | 'warning' | 'failing' | 'not-applicable';
    hipaa?: 'passing' | 'warning' | 'failing' | 'not-applicable';
    gdpr?: 'passing' | 'warning' | 'failing' | 'not-applicable';
    soc2?: 'passing' | 'warning' | 'failing' | 'not-applicable';
  };
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  refreshData,
  isRefreshing = false, // Provide a default value
  complianceStatus = { pci: 'not-applicable' }
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passing': return 'bg-green-600';
      case 'warning': return 'bg-yellow-600';
      case 'failing': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Operations Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time overview of your infrastructure and cloud resources
        </p>
        
        {/* Compliance Status Indicators */}
        <div className="flex items-center gap-2 mt-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className={`flex items-center gap-1 ${getStatusColor(complianceStatus.pci)}`}>
                <Shield className="h-3 w-3" /> PCI DSS
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>PCI DSS {complianceStatus.pci === 'passing' ? 'compliant' : 'compliance status'}</p>
            </TooltipContent>
          </Tooltip>
          
          {complianceStatus.hipaa && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className={`flex items-center gap-1 ${getStatusColor(complianceStatus.hipaa)}`}>
                  <Shield className="h-3 w-3" /> HIPAA
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>HIPAA {complianceStatus.hipaa === 'passing' ? 'compliant' : 'compliance status'}</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {complianceStatus.gdpr && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className={`flex items-center gap-1 ${getStatusColor(complianceStatus.gdpr)}`}>
                  <Shield className="h-3 w-3" /> GDPR
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>GDPR {complianceStatus.gdpr === 'passing' ? 'compliant' : 'compliance status'}</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {complianceStatus.soc2 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className={`flex items-center gap-1 ${getStatusColor(complianceStatus.soc2)}`}>
                  <BadgeCheck className="h-3 w-3" /> SOC 2
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>SOC 2 {complianceStatus.soc2 === 'passing' ? 'compliant' : 'compliance status'}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
