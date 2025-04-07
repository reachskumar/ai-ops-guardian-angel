
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Search, Download } from "lucide-react";
import VulnerabilityTable from "./VulnerabilityTable";
import ComplianceCards from "./ComplianceCards";

export interface SecurityTabsProps {
  vulnerabilities: Array<{
    id: string;
    title: string;
    severity: string;
    component: string;
    discovered: string;
    status: string;
  }>;
  complianceItems: Array<{
    name: string;
    status: string;
    score: number;
  }>;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const SecurityTabs: React.FC<SecurityTabsProps> = ({ 
  vulnerabilities, 
  complianceItems, 
  activeTab = "vulnerabilities", 
  onTabChange = () => {} 
}) => {
  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={onTabChange}>
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <Search className="h-4 w-4" />
            Search
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <TabsContent value="vulnerabilities">
        <Card>
          <CardHeader>
            <CardTitle>Vulnerability Report</CardTitle>
          </CardHeader>
          <CardContent>
            <VulnerabilityTable vulnerabilities={vulnerabilities} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="compliance">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Report</CardTitle>
          </CardHeader>
          <CardContent>
            <ComplianceCards complianceItems={complianceItems} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="overview">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Select a specific tab to view detailed reports</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default SecurityTabs;
