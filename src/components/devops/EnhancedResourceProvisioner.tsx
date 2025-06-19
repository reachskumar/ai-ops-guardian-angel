import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Server, 
  Users, 
  Shield, 
  Activity,
  DollarSign,
  Settings,
  CheckCircle,
  Clock,
  AlertTriangle,
  Bell
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  ProvisioningRequest, 
  ApprovalWorkflow, 
  AuditLog 
} from './provisioning';
import type { ProvisioningConfig } from './provisioning/ProvisioningRequest';
import type { ProvisioningRequest as ProvisioningRequestType } from './provisioning/ApprovalWorkflow';
import type { AuditEntry } from './provisioning/AuditLog';

const EnhancedResourceProvisioner: React.FC = () => {
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin' as 'admin' | 'requestor' | 'viewer',
    email: 'john.doe@company.com'
  });
  
  const [provisioningRequests, setProvisioningRequests] = useState<ProvisioningRequestType[]>([
    {
      id: 'req-001',
      requester: 'Alice Smith',
      resourceType: 'EC2 Instance',
      estimatedCost: 245.50,
      description: 'Web server for new product launch',
      businessJustification: 'Need additional capacity for expected traffic increase during product launch',
      status: 'pending',
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      config: {
        cloudProvider: 'aws',
        resourceType: 'EC2 Instance',
        region: 'us-east-1',
        osType: 'amazon-linux-2023',
        baseImage: 'ami-12345678',
        instanceType: 't3.medium',
        instanceCount: 1,
        vpc: 'vpc-12345678',
        subnet: 'subnet-12345678',
        securityGroups: ['sg-web'],
        networkTags: { Environment: 'Production' },
        storageType: 'gp3',
        storageSize: 30,
        encryption: true,
        estimatedCost: 245.50,
        budgetLimit: 500,
        autoDeprovision: false,
        tags: { Environment: 'Production', Team: 'Frontend' },
        description: 'Web server for new product launch',
        businessJustification: 'Need additional capacity for expected traffic increase during product launch'
      }
    },
    {
      id: 'req-002',
      requester: 'Bob Johnson',
      resourceType: 'RDS Database',
      estimatedCost: 180.00,
      description: 'MySQL database for analytics',
      businessJustification: 'Analytics team needs dedicated database for reporting queries',
      status: 'approved',
      submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      approver: 'John Doe',
      approvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      comments: 'Approved with 7-day TTL for testing',
      config: {
        cloudProvider: 'aws',
        resourceType: 'RDS Database',
        region: 'us-west-2',
        osType: 'mysql-8.0',
        baseImage: 'mysql:8.0',
        instanceType: 'db.t3.micro',
        instanceCount: 1,
        vpc: 'vpc-87654321',
        subnet: 'subnet-87654321',
        securityGroups: ['sg-database'],
        networkTags: { Environment: 'Production' },
        storageType: 'gp3',
        storageSize: 20,
        encryption: true,
        estimatedCost: 180.00,
        budgetLimit: 300,
        ttl: 7,
        autoDeprovision: true,
        tags: { Environment: 'Production', Team: 'Analytics' },
        description: 'MySQL database for analytics',
        businessJustification: 'Analytics team needs dedicated database for reporting queries'
      }
    }
  ]);

  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([
    {
      id: 'audit-001',
      timestamp: new Date().toISOString(),
      user: 'John Doe',
      action: 'approve',
      resourceType: 'RDS',
      resourceName: 'analytics-db',
      status: 'success',
      details: 'Approved RDS database provisioning request',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      cost: 180.00,
      region: 'us-east-1',
      tags: { Environment: 'Production', Team: 'Analytics' }
    },
    {
      id: 'audit-002',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      user: 'Alice Smith',
      action: 'provision',
      resourceType: 'EC2',
      resourceName: 'web-server-01',
      status: 'pending',
      details: 'Submitted provisioning request for EC2 instance',
      ipAddress: '192.168.1.150',
      userAgent: 'Mozilla/5.0...',
      cost: 245.50,
      region: 'us-west-2',
      tags: { Environment: 'Production', Team: 'Frontend' }
    }
  ]);

  const [budgetRemaining] = useState(5000);
  const [quotaStatus] = useState({
    'ec2-instances': { used: 15, limit: 50 },
    'clusters': { used: 2, limit: 5 },
    'databases': { used: 8, limit: 20 }
  });

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-001',
      type: 'approval',
      message: 'New provisioning request from Alice Smith requires approval',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    }
  ]);

  const { toast } = useToast();

  const handleProvisioningRequest = (config: ProvisioningConfig) => {
    const newRequest: ProvisioningRequestType = {
      id: `req-${Date.now()}`,
      requester: currentUser.name,
      resourceType: config.resourceType,
      estimatedCost: config.estimatedCost,
      description: config.description,
      businessJustification: config.businessJustification,
      status: config.estimatedCost < 500 ? 'auto-approved' : 'pending', // Auto-approve low-cost resources
      submittedAt: new Date().toISOString(),
      config
    };

    setProvisioningRequests(prev => [newRequest, ...prev]);

    // Add audit entry
    const auditEntry: AuditEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: currentUser.name,
      action: 'provision',
      resourceType: config.resourceType,
      resourceName: config.description || 'Unnamed Resource',
      status: 'pending',
      details: `Submitted provisioning request for ${config.resourceType}`,
      ipAddress: '192.168.1.100',
      userAgent: navigator.userAgent,
      cost: config.estimatedCost,
      region: config.region,
      tags: config.tags
    };

    setAuditEntries(prev => [auditEntry, ...prev]);

    if (newRequest.status === 'auto-approved') {
      toast({
        title: 'Request Auto-Approved',
        description: 'Your resource has been automatically approved and deployment will begin shortly.',
      });
    } else {
      toast({
        title: 'Request Submitted',
        description: 'Your provisioning request has been submitted for approval.',
      });
    }
  };

  const handleApproval = (requestId: string, comments?: string) => {
    setProvisioningRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: 'approved', 
              approver: currentUser.name,
              approvedAt: new Date().toISOString(),
              comments 
            }
          : req
      )
    );

    // Add audit entry
    const request = provisioningRequests.find(r => r.id === requestId);
    if (request) {
      const auditEntry: AuditEntry = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: currentUser.name,
        action: 'approve',
        resourceType: request.resourceType,
        resourceName: request.description || 'Unnamed Resource',
        status: 'success',
        details: `Approved provisioning request${comments ? `: ${comments}` : ''}`,
        ipAddress: '192.168.1.100',
        userAgent: navigator.userAgent,
        cost: request.estimatedCost,
        tags: request.config?.tags
      };

      setAuditEntries(prev => [auditEntry, ...prev]);
    }
  };

  const handleRejection = (requestId: string, comments: string) => {
    setProvisioningRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: 'rejected', 
              approver: currentUser.name,
              approvedAt: new Date().toISOString(),
              comments 
            }
          : req
      )
    );

    // Add audit entry
    const request = provisioningRequests.find(r => r.id === requestId);
    if (request) {
      const auditEntry: AuditEntry = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: currentUser.name,
        action: 'reject',
        resourceType: request.resourceType,
        resourceName: request.description || 'Unnamed Resource',
        status: 'success',
        details: `Rejected provisioning request: ${comments}`,
        ipAddress: '192.168.1.100',
        userAgent: navigator.userAgent,
        cost: request.estimatedCost,
        tags: request.config?.tags
      };

      setAuditEntries(prev => [auditEntry, ...prev]);
    }
  };

  const handleExportAudit = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const dataStr = JSON.stringify(auditEntries, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-log-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } else {
      // CSV export logic
      const headers = ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource Name', 'Status', 'Details', 'Cost', 'Region'];
      const csvContent = [
        headers.join(','),
        ...auditEntries.map(entry => [
          entry.timestamp,
          entry.user,
          entry.action,
          entry.resourceType,
          entry.resourceName,
          entry.status,
          `"${entry.details}"`,
          entry.cost || '',
          entry.region || ''
        ].join(','))
      ].join('\n');

      const dataBlob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    }

    toast({
      title: 'Export Complete',
      description: `Audit log exported as ${format.toUpperCase()}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Resource Provisioning</h2>
          <p className="text-muted-foreground">
            Enterprise-grade cloud resource provisioning with approval workflows and compliance
          </p>
        </div>
        
        {notifications.length > 0 && (
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-1" />
            {notifications.length} Notification{notifications.length > 1 ? 's' : ''}
          </Button>
        )}
      </div>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Pending Approvals</p>
                <p className="text-2xl font-bold">
                  {provisioningRequests.filter(r => r.status === 'pending').length}
                </p>
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
                <p className="text-2xl font-bold">
                  {Object.values(quotaStatus).reduce((sum, quota) => sum + quota.used, 0)}
                </p>
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

      {/* Role-based Access Alert */}
      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          Logged in as <strong>{currentUser.name}</strong> with <strong>{currentUser.role}</strong> privileges.
          {currentUser.role === 'requestor' && ' High-cost resources require approval.'}
          {currentUser.role === 'viewer' && ' You have read-only access.'}
        </AlertDescription>
      </Alert>

      {/* Main Tabs */}
      <Tabs defaultValue="provision" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="provision">Provision</TabsTrigger>
          <TabsTrigger value="approvals">
            Approvals
            {provisioningRequests.filter(r => r.status === 'pending').length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {provisioningRequests.filter(r => r.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="provision">
          <ProvisioningRequest
            onSubmit={handleProvisioningRequest}
            userRole={currentUser.role}
            budgetRemaining={budgetRemaining}
            quotaStatus={quotaStatus}
          />
        </TabsContent>

        <TabsContent value="approvals">
          <ApprovalWorkflow
            requests={provisioningRequests}
            userRole={currentUser.role}
            onApprove={handleApproval}
            onReject={handleRejection}
          />
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Infrastructure Templates & Blueprints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    name: 'Standard Web App Stack',
                    description: 'Load balancer + Auto Scaling Group + RDS',
                    cost: '₹450/month',
                    compliance: 'CIS Level 1'
                  },
                  {
                    name: 'AI/ML Workspace',
                    description: 'GPU instances + Jupyter + TensorFlow',
                    cost: '₹1,200/month',
                    compliance: 'GDPR Ready'
                  },
                  {
                    name: 'Development Environment',
                    description: 'Small instances with 7-day TTL',
                    cost: '₹150/month',
                    compliance: 'Auto-approved'
                  }
                ].map((template, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">{template.cost}</Badge>
                          <Badge variant="secondary">{template.compliance}</Badge>
                        </div>
                        <Button size="sm" className="w-full">Deploy Template</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <AuditLog
            entries={auditEntries}
            onExport={handleExportAudit}
          />
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security & Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-tagging</p>
                    <p className="text-sm text-muted-foreground">Automatically tag resources with owner and cost center</p>
                  </div>
                  <Badge variant="default" className="bg-green-500">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">CIS Compliance</p>
                    <p className="text-sm text-muted-foreground">Enforce CIS benchmarks on all resources</p>
                  </div>
                  <Badge variant="default" className="bg-green-500">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Encryption at Rest</p>
                    <p className="text-sm text-muted-foreground">Require encryption for all storage resources</p>
                  </div>
                  <Badge variant="default" className="bg-green-500">Enabled</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Send email alerts for approvals and deployments</p>
                  </div>
                  <Badge variant="default" className="bg-green-500">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Slack Integration</p>
                    <p className="text-sm text-muted-foreground">Send notifications to #devops channel</p>
                  </div>
                  <Badge variant="default" className="bg-green-500">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SIEM Integration</p>
                    <p className="text-sm text-muted-foreground">Forward audit logs to security system</p>
                  </div>
                  <Badge variant="secondary">Disabled</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedResourceProvisioner;
