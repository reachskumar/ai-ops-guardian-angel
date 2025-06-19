
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Settings,
  Shield,
  Zap,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DriftItem {
  id: string;
  resource: string;
  type: string;
  status: 'drifted' | 'compliant' | 'unknown';
  severity: 'high' | 'medium' | 'low';
  description: string;
  expectedValue: string;
  actualValue: string;
  lastChecked: string;
}

const DriftDetection: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [lastScan, setLastScan] = useState('2 hours ago');
  const { toast } = useToast();

  const [driftItems] = useState<DriftItem[]>([
    {
      id: '1',
      resource: 'aws_instance.web_server',
      type: 'EC2 Instance',
      status: 'drifted',
      severity: 'high',
      description: 'Instance type changed from t3.micro to t3.small',
      expectedValue: 't3.micro',
      actualValue: 't3.small',
      lastChecked: '1 hour ago'
    },
    {
      id: '2',
      resource: 'aws_security_group.web',
      type: 'Security Group',
      status: 'drifted',
      severity: 'medium',
      description: 'Inbound rule added for port 8080',
      expectedValue: 'ports: 80, 443',
      actualValue: 'ports: 80, 443, 8080',
      lastChecked: '1 hour ago'
    },
    {
      id: '3',
      resource: 'aws_s3_bucket.assets',
      type: 'S3 Bucket',
      status: 'compliant',
      severity: 'low',
      description: 'No drift detected',
      expectedValue: 'versioning: enabled',
      actualValue: 'versioning: enabled',
      lastChecked: '30 minutes ago'
    }
  ]);

  const runDriftDetection = async () => {
    setIsScanning(true);
    setScanProgress(0);

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setLastScan('Just now');
          toast({
            title: 'Drift Detection Completed',
            description: 'Infrastructure drift scan completed successfully',
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const remediateDrift = (itemId: string) => {
    toast({
      title: 'Remediation Started',
      description: `Starting remediation for resource ${itemId}`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'drifted':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const driftedCount = driftItems.filter(item => item.status === 'drifted').length;
  const compliantCount = driftItems.filter(item => item.status === 'compliant').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Infrastructure Drift Detection</h2>
        <Button onClick={runDriftDetection} disabled={isScanning}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Scanning...' : 'Run Detection'}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driftItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Infrastructure resources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drifted</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{driftedCount}</div>
            <p className="text-xs text-muted-foreground">
              Resources with drift
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliant</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{compliantCount}</div>
            <p className="text-xs text-muted-foreground">
              Resources in sync
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Scan</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lastScan}</div>
            <p className="text-xs text-muted-foreground">
              Detection frequency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Scanning Progress */}
      {isScanning && (
        <Card>
          <CardHeader>
            <CardTitle>Scanning Infrastructure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Checking resources...</span>
                <span>{scanProgress}%</span>
              </div>
              <Progress value={scanProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="drift-items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="drift-items">Drift Items</TabsTrigger>
          <TabsTrigger value="remediation">Remediation</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="drift-items">
          <Card>
            <CardHeader>
              <CardTitle>Detected Drift</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {driftItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-start gap-4">
                      {getStatusIcon(item.status)}
                      <div className="space-y-1">
                        <div className="font-medium">{item.resource}</div>
                        <div className="text-sm text-muted-foreground">{item.type}</div>
                        <div className="text-sm">{item.description}</div>
                        <div className="text-xs text-muted-foreground">
                          Expected: {item.expectedValue} | Actual: {item.actualValue}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last checked: {item.lastChecked}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getSeverityColor(item.severity)}>
                        {item.severity}
                      </Badge>
                      {item.status === 'drifted' && (
                        <Button
                          size="sm"
                          onClick={() => remediateDrift(item.id)}
                        >
                          <Zap className="mr-2 h-3 w-3" />
                          Remediate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remediation">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Remediation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Immediate Remediation</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Automatically fix drift as soon as it's detected
                    </p>
                    <Button variant="outline" className="w-full">
                      Configure Rules
                    </Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Scheduled Remediation</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Fix drift during maintenance windows
                    </p>
                    <Button variant="outline" className="w-full">
                      Set Schedule
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Remediation History</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">aws_instance.web_server - Instance type restored</span>
                      </div>
                      <span className="text-xs text-muted-foreground">2 days ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">aws_s3_bucket.logs - Encryption enabled</span>
                      </div>
                      <span className="text-xs text-muted-foreground">1 week ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Detection Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Scan Frequency</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline">Hourly</Button>
                    <Button variant="default">Daily</Button>
                    <Button variant="outline">Weekly</Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Resource Filters</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">EC2 Instances</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Security Groups</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">S3 Buckets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span className="text-sm">IAM Roles</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Notification Settings</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Email notifications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span className="text-sm">Slack integration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span className="text-sm">Webhook notifications</span>
                    </div>
                  </div>
                </div>

                <Button>
                  <Settings className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DriftDetection;
