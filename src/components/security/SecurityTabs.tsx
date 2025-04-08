
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Search, Download, RefreshCw } from "lucide-react";
import VulnerabilityTable from "./VulnerabilityTable";
import ComplianceCards from "./ComplianceCards";
import SecurityOverview from "./SecurityOverview";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";

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
  vulnerabilityData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onRefreshData?: (selectedStandards?: string[]) => void;
  lastScanTime?: string;
  complianceScore?: number;
  isScanning?: boolean;
}

const SecurityTabs: React.FC<SecurityTabsProps> = ({ 
  vulnerabilities, 
  complianceItems, 
  vulnerabilityData = [],
  activeTab = "overview", 
  onTabChange = () => {},
  onRefreshData = () => {},
  lastScanTime = new Date().toISOString(),
  complianceScore = 85,
  isScanning = false
}) => {
  const [showComplianceSelector, setShowComplianceSelector] = useState(false);
  const form = useForm({
    defaultValues: {
      complianceStandards: ["PCI DSS"]
    }
  });

  const handleRefresh = () => {
    setShowComplianceSelector(true);
  };

  const handleScanStart = (data: { complianceStandards: string[] }) => {
    setShowComplianceSelector(false);
    onRefreshData(data.complianceStandards);
  };

  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={onTabChange}>
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <Popover open={showComplianceSelector} onOpenChange={setShowComplianceSelector}>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleRefresh}>
                <RefreshCw className={`h-4 w-4 ${isScanning ? "animate-spin" : ""}`} />
                Scan Now
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleScanStart)} className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Select Compliance Standards</h4>
                    <p className="text-sm text-muted-foreground">Choose which standards to include in the scan</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="complianceStandards"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup 
                            onValueChange={(value) => field.onChange([value])}
                            value={field.value[0]}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="PCI DSS" id="pci" />
                              <Label htmlFor="pci">PCI DSS</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="HIPAA" id="hipaa" />
                              <Label htmlFor="hipaa">HIPAA</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="NIST" id="nist" />
                              <Label htmlFor="nist">NIST</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="SOC 2" id="soc2" />
                              <Label htmlFor="soc2">SOC 2</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="All" id="all" />
                              <Label htmlFor="all">All Standards</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" size="sm">
                      Start Scan
                    </Button>
                  </div>
                </form>
              </Form>
            </PopoverContent>
          </Popover>
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

      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>Security Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <SecurityOverview 
              complianceScore={complianceScore}
              lastScanTime={lastScanTime}
              vulnerabilityData={vulnerabilityData}
              isScanning={isScanning}
              onRunScan={handleRefresh}
            />
          </CardContent>
        </Card>
      </TabsContent>

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
    </Tabs>
  );
};

export default SecurityTabs;
