import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Plus, Settings, BarChart3, Shield } from 'lucide-react';

interface TagPolicy {
  id: string;
  name: string;
  description: string;
  policy_type: string;
  severity: string;
  auto_remediate: boolean;
  enabled: boolean;
  required_tags?: string[];
  cost_centers?: string[];
  allowed_values?: Record<string, string[]>;
}

interface TagViolation {
  resource_id: string;
  resource_name: string;
  resource_type: string;
  cloud_provider: string;
  policy_id: string;
  violation_type: string;
  description: string;
  severity: string;
  current_tags: Record<string, string>;
  missing_tags: string[];
  invalid_tags: string[];
  suggested_tags: Record<string, string>;
  auto_remediated: boolean;
  status: string;
}

interface ComplianceReport {
  tenant_id: string;
  total_resources: number;
  compliant_resources: number;
  non_compliant_resources: number;
  total_violations: number;
  auto_remediated: number;
  manual_remediation_needed: number;
  compliance_score: number;
  violations_by_policy: Record<string, number>;
  violations_by_severity: Record<string, number>;
}

const TagPolicyDashboard: React.FC = () => {
  const [tenantId, setTenantId] = useState<string>('default');
  const [policies, setPolicies] = useState<TagPolicy[]>([]);
  const [violations, setViolations] = useState<TagViolation[]>([]);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  const mockPolicies: TagPolicy[] = [
    {
      id: 'required_tags',
      name: 'Required Tags',
      description: 'Resources must have owner, team, and project tags',
      policy_type: 'required',
      severity: 'high',
      auto_remediate: true,
      enabled: true,
      required_tags: ['owner', 'team', 'project']
    },
    {
      id: 'cost_allocation',
      name: 'Cost Allocation Tags',
      description: 'Resources must have cost center tags for billing',
      policy_type: 'cost_allocation',
      severity: 'medium',
      auto_remediate: true,
      enabled: true,
      cost_centers: ['engineering', 'marketing', 'sales', 'operations', 'infrastructure']
    },
    {
      id: 'environment_tag',
      name: 'Environment Tag',
      description: 'Resources must have environment tag',
      policy_type: 'value',
      severity: 'medium',
      auto_remediate: true,
      enabled: true,
      allowed_values: { environment: ['dev', 'staging', 'prod', 'test'] }
    },
    {
      id: 'format_standards',
      name: 'Tag Format Standards',
      description: 'Tags must follow naming conventions',
      policy_type: 'format',
      severity: 'low',
      auto_remediate: false,
      enabled: true
    }
  ];

  const mockViolations: TagViolation[] = [
    {
      resource_id: 'i-1234567890abcdef0',
      resource_name: 'web-server-01',
      resource_type: 'ec2_instance',
      cloud_provider: 'aws',
      policy_id: 'required_tags',
      violation_type: 'missing_required_tags',
      description: 'Missing required tags: cost_center',
      severity: 'medium',
      current_tags: {
        owner: 'john.doe',
        team: 'frontend',
        project: 'web-app'
      },
      missing_tags: ['cost_center'],
      invalid_tags: [],
      suggested_tags: {
        cost_center: 'engineering'
      },
      auto_remediated: false,
      status: 'open'
    },
    {
      resource_id: 'vm-prod-web-001',
      resource_name: 'web-server-prod',
      resource_type: 'vm',
      cloud_provider: 'azure',
      policy_id: 'format_standards',
      violation_type: 'invalid_tag_format',
      description: 'Tags with invalid format: owner',
      severity: 'low',
      current_tags: {
        owner: 'Bob Wilson',
        team: 'frontend',
        project: 'web-app'
      },
      missing_tags: [],
      invalid_tags: ['owner'],
      suggested_tags: {
        owner: 'bob.wilson'
      },
      auto_remediated: false,
      status: 'open'
    }
  ];

  const mockComplianceReport: ComplianceReport = {
    tenant_id: 'default',
    total_resources: 156,
    compliant_resources: 142,
    non_compliant_resources: 14,
    total_violations: 23,
    auto_remediated: 15,
    manual_remediation_needed: 8,
    compliance_score: 91.0,
    violations_by_policy: {
      'required_tags': 8,
      'cost_allocation': 12,
      'environment_tag': 3
    },
    violations_by_severity: {
      'high': 2,
      'medium': 15,
      'low': 6
    }
  };

  useEffect(() => {
    // Load mock data
    setPolicies(mockPolicies);
    setViolations(mockViolations);
    setComplianceReport(mockComplianceReport);
  }, []);

  const getPolicyTypeIcon = (type: string) => {
    switch (type) {
      case 'required':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cost_allocation':
        return <BarChart3 className="h-4 w-4 text-blue-600" />;
      case 'value':
        return <Settings className="h-4 w-4 text-purple-600" />;
      case 'format':
        return <Shield className="h-4 w-4 text-orange-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const severityColors: Record<string, string> = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge className={severityColors[severity] || 'bg-gray-100 text-gray-800'}>
        {severity}
      </Badge>
    );
  };

  const getViolationStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      open: 'bg-red-100 text-red-800',
      remediated: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handlePolicyToggle = (policyId: string) => {
    setPolicies(prev => prev.map(policy => 
      policy.id === policyId 
        ? { ...policy, enabled: !policy.enabled }
        : policy
    ));
  };

  const handleBulkRemediate = () => {
    // Implement bulk remediation logic
    console.log('Bulk remediating violations...');
  };

  const handleRefreshCompliance = () => {
    // Implement compliance refresh logic
    console.log('Refreshing compliance report...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tag Policy Management</h1>
          <p className="text-muted-foreground">
            Manage tag policies and monitor compliance across resources
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={tenantId} onValueChange={setTenantId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Tenant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Tenant</SelectItem>
              <SelectItem value="tenant-1">Tenant 1</SelectItem>
              <SelectItem value="tenant-2">Tenant 2</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefreshCompliance}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getComplianceScoreColor(complianceReport?.compliance_score || 0)}`}>
              {complianceReport?.compliance_score || 0}%
            </div>
            <Progress value={complianceReport?.compliance_score || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {complianceReport?.compliant_resources || 0} of {complianceReport?.total_resources || 0} resources compliant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {complianceReport?.total_violations || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Policy violations detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Remediated</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {complianceReport?.auto_remediated || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Automatically fixed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manual Required</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {complianceReport?.manual_remediation_needed || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Need manual intervention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Violations by Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Violations by Policy</CardTitle>
              <CardDescription>Number of violations per policy type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {complianceReport?.violations_by_policy && Object.entries(complianceReport.violations_by_policy).map(([policyId, count]) => {
                  const policy = policies.find(p => p.id === policyId);
                  return (
                    <div key={policyId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getPolicyTypeIcon(policy?.policy_type || '')}
                        <span className="font-medium">{policy?.name || policyId}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full"
                            style={{
                              width: `${(count / (complianceReport?.total_violations || 1)) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Violations by Severity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Violations by Severity</CardTitle>
                <CardDescription>Distribution of violations by risk level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceReport?.violations_by_severity && Object.entries(complianceReport.violations_by_severity).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getSeverityBadge(severity)}
                        <span className="capitalize">{severity}</span>
                      </div>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common policy management tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={handleBulkRemediate}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Bulk Remediate Violations
                </Button>
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Policy
                </Button>
                <Button className="w-full" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Export Compliance Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tag Policies</CardTitle>
                  <CardDescription>Manage tag compliance policies</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Policy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Auto-Remediate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{policy.name}</div>
                          <div className="text-sm text-muted-foreground">{policy.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getPolicyTypeIcon(policy.policy_type)}
                          <span className="capitalize">{policy.policy_type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getSeverityBadge(policy.severity)}</TableCell>
                      <TableCell>
                        <Badge variant={policy.auto_remediate ? 'default' : 'secondary'}>
                          {policy.auto_remediate ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={policy.enabled ? 'default' : 'secondary'}>
                          {policy.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePolicyToggle(policy.id)}
                          >
                            {policy.enabled ? 'Disable' : 'Enable'}
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Violations Tab */}
        <TabsContent value="violations" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Policy Violations</CardTitle>
                  <CardDescription>Resources that violate tag policies</CardDescription>
                </div>
                <Button onClick={handleBulkRemediate}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Bulk Remediate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource</TableHead>
                    <TableHead>Policy</TableHead>
                    <TableHead>Violation</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violations.map((violation) => (
                    <TableRow key={`${violation.resource_id}-${violation.policy_id}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{violation.resource_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {violation.resource_type} • {violation.cloud_provider}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {policies.find(p => p.id === violation.policy_id)?.name || violation.policy_id}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="text-sm">{violation.description}</div>
                          {violation.missing_tags.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Missing: {violation.missing_tags.join(', ')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getSeverityBadge(violation.severity)}</TableCell>
                      <TableCell>{getViolationStatusBadge(violation.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            Remediate
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
              <CardDescription>Detailed compliance analysis and trends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Compliance Score Breakdown */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Compliance Score Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {complianceReport?.compliant_resources || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Compliant Resources</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {complianceReport?.non_compliant_resources || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Non-Compliant Resources</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {complianceReport?.total_resources || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Resources</div>
                  </div>
                </div>
              </div>

              {/* Remediation Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Remediation Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Auto-Remediated</span>
                      <span className="text-sm text-muted-foreground">
                        {complianceReport?.auto_remediated || 0} of {complianceReport?.total_violations || 0}
                      </span>
                    </div>
                    <Progress 
                      value={complianceReport ? (complianceReport.auto_remediated / complianceReport.total_violations) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Manual Remediation Needed</span>
                      <span className="text-sm text-muted-foreground">
                        {complianceReport?.manual_remediation_needed || 0}
                      </span>
                    </div>
                    <Progress 
                      value={complianceReport ? (complianceReport.manual_remediation_needed / complianceReport.total_violations) * 100 : 0} 
                      className="h-2 bg-red-200"
                    />
                  </div>
                </div>
              </div>

              {/* Export Options */}
              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Schedule Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alerts */}
      {complianceReport && complianceReport.compliance_score < 90 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Compliance score is below 90%. Review and remediate policy violations to improve overall compliance.
          </AlertDescription>
        </Alert>
      )}

      {complianceReport && complianceReport.public_resources > 0 && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            {complianceReport.public_resources} resources are publicly exposed. Review security settings and apply appropriate access controls.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TagPolicyDashboard;
