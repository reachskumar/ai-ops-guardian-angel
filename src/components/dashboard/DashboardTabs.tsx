
import React, { Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  RefreshCw,
  BarChart,
  Clock,
  Server,
  Database,
  Network,
  Cloud,
  Shield,
  AlertTriangle,
  Terminal
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy-loaded components
const MonitoringWidget = lazy(() => import("@/components/dashboard/MonitoringWidget"));
const ResourcesPanel = lazy(() => import("@/components/dashboard/ResourcesPanel"));
const SecurityPanel = lazy(() => import("@/components/dashboard/SecurityPanel"));
const IncidentPanel = lazy(() => import("@/components/dashboard/IncidentPanel"));
const AIChat = lazy(() => import("@/components/AIChat"));

// Loading spinner with skeleton UI
const LazyLoadingSpinner = () => (
  <div className="w-full">
    <Skeleton className="h-[180px] w-full rounded-md" />
  </div>
);

interface DashboardTabsProps {
  cpuData: Array<{ time: string; value: number }>;
  memoryData: Array<{ time: string; value: number }>;
  networkData: Array<{ name: string; value: number }>;
  storageData: Array<{ name: string; value: number }>;
  infrastructureResources: Array<{
    id: string;
    type: string;
    status: string;
    region: string;
    provider: string;
  }>;
  securityFindings: Array<{
    id: string;
    severity: string;
    description: string;
    asset: string;
    date: string;
  }>;
  refreshData: () => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({
  cpuData,
  memoryData,
  networkData,
  storageData,
  infrastructureResources,
  securityFindings,
  refreshData
}) => {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="grid w-full max-w-2xl grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Suspense fallback={<LazyLoadingSpinner />}>
              <MonitoringWidget
                title="CPU Usage (Last 24 Hours)"
                type="area"
                data={cpuData}
              />
            </Suspense>
            <Suspense fallback={<LazyLoadingSpinner />}>
              <MonitoringWidget
                title="Memory Usage (Last 24 Hours)"
                type="area"
                data={memoryData}
              />
            </Suspense>
          </div>
          <div className="space-y-6">
            <Suspense fallback={<LazyLoadingSpinner />}>
              <ResourcesPanel />
            </Suspense>
            <Suspense fallback={<LazyLoadingSpinner />}>
              <MonitoringWidget
                title="Network Traffic (Mbps)"
                type="bar"
                data={networkData}
              />
            </Suspense>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              <Suspense fallback={<LazyLoadingSpinner />}>
                <MonitoringWidget
                  title="Storage Usage"
                  type="pie"
                  data={storageData}
                />
              </Suspense>
            </div>
            <div className="hidden sm:block">
              <Suspense fallback={<LazyLoadingSpinner />}>
                <AIChat />
              </Suspense>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Suspense fallback={<LazyLoadingSpinner />}>
            <SecurityPanel />
          </Suspense>
          <Suspense fallback={<LazyLoadingSpinner />}>
            <IncidentPanel />
          </Suspense>
        </div>
      </TabsContent>
      
      <TabsContent value="infrastructure" className="mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-md font-medium">Cloud Resources</CardTitle>
                <Button variant="outline" size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Provision
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-6 p-3 text-xs font-medium text-muted-foreground border-b">
                    <div>ID</div>
                    <div>Type</div>
                    <div>Provider</div>
                    <div>Region</div>
                    <div>Status</div>
                    <div></div>
                  </div>
                  {infrastructureResources.map((resource, i) => (
                    <div key={i} className="grid grid-cols-6 p-3 text-sm items-center border-b last:border-0">
                      <div className="font-medium">{resource.id}</div>
                      <div>{resource.type}</div>
                      <div>{resource.provider}</div>
                      <div>{resource.region}</div>
                      <div>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          resource.status === 'running' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 
                          resource.status === 'stopped' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : 
                          'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {resource.status}
                        </span>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="ghost" size="sm">
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Server className="mr-2 h-4 w-4" />
                  Launch New Instance
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="mr-2 h-4 w-4" />
                  Create Database
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Network className="mr-2 h-4 w-4" />
                  Configure Network
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Cloud className="mr-2 h-4 w-4" />
                  Manage Storage
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium">Infrastructure as Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">Terraform</span>
                  </div>
                  <span className="text-xs text-muted-foreground">v1.5.2</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">CloudFormation</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Updated</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="text-sm">Ansible</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Update needed</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="security" className="mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-md font-medium">Security Findings</CardTitle>
                <Button variant="outline" size="sm">
                  <Shield className="mr-2 h-4 w-4" />
                  Run Scan
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 p-3 text-xs font-medium text-muted-foreground border-b">
                    <div>ID</div>
                    <div>Severity</div>
                    <div>Description</div>
                    <div>Asset</div>
                    <div>Detected</div>
                  </div>
                  {securityFindings.map((finding, i) => (
                    <div key={i} className="grid grid-cols-5 p-3 text-sm items-center border-b last:border-0">
                      <div className="font-medium">{finding.id}</div>
                      <div>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          finding.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 
                          finding.severity === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : 
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}>
                          {finding.severity}
                        </span>
                      </div>
                      <div>{finding.description}</div>
                      <div>{finding.asset}</div>
                      <div>{finding.date}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium">Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>PCI DSS</span>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                      Compliant
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>HIPAA</span>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                      Compliant
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SOC 2</span>
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                      In Progress
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>GDPR</span>
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-300">
                      Attention Needed
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium">Security Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">WAF</span>
                  </div>
                  <span className="text-xs text-green-500">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">IDS/IPS</span>
                  </div>
                  <span className="text-xs text-green-500">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="text-sm">SIEM</span>
                  </div>
                  <span className="text-xs text-yellow-500">Needs Config</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">Vulnerability Scanner</span>
                  </div>
                  <span className="text-xs text-green-500">Active</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="monitoring" className="mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 gap-6">
            <Suspense fallback={<LazyLoadingSpinner />}>
              <MonitoringWidget
                title="CPU Usage (Last 24 Hours)"
                type="area"
                data={cpuData}
              />
            </Suspense>
            <Suspense fallback={<LazyLoadingSpinner />}>
              <MonitoringWidget
                title="Memory Usage (Last 24 Hours)"
                type="area"
                data={memoryData}
              />
            </Suspense>
            <Suspense fallback={<LazyLoadingSpinner />}>
              <MonitoringWidget
                title="Network Traffic (Mbps)"
                type="bar"
                data={networkData}
              />
            </Suspense>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium">Alerts Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">High CPU Usage</span>
                  </div>
                  <span className="text-xs inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    &gt; 85%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Low Memory</span>
                  </div>
                  <span className="text-xs inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    &lt; 15%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">API Response Time</span>
                  </div>
                  <span className="text-xs inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    &gt; 2s
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Error Rate</span>
                  </div>
                  <span className="text-xs inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    &gt; 5%
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium">Monitoring Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Prometheus</span>
                  </div>
                  <span className="text-xs text-green-500">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Grafana</span>
                  </div>
                  <span className="text-xs text-green-500">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">ELK Stack</span>
                  </div>
                  <span className="text-xs text-yellow-500">Partial</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">New Relic</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Not Connected</span>
                </div>
                <Button variant="outline" className="w-full mt-2">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Connect Tool
                </Button>
              </CardContent>
            </Card>
            
            <Suspense fallback={<LazyLoadingSpinner />}>
              <MonitoringWidget
                title="Storage Usage"
                type="pie"
                data={storageData}
              />
            </Suspense>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
