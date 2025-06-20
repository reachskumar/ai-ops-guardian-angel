
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  Circle, 
  AlertTriangle, 
  XCircle,
  Shield, 
  Zap, 
  Server, 
  Users,
  Settings,
  Database,
  Cloud,
  Monitor,
  FileText,
  Lock,
  Activity,
  Globe,
  AlertCircle
} from "lucide-react";

interface ReadinessItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'complete' | 'in-progress' | 'pending' | 'failed';
  requirements: string[];
  recommendations?: string[];
}

const ProductionReadiness: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const readinessItems: ReadinessItem[] = [
    // Security & Compliance
    {
      id: 'security-scan',
      title: 'Security Vulnerability Scan',
      description: 'Complete security assessment of all infrastructure components',
      category: 'security',
      priority: 'critical',
      status: 'complete',
      requirements: [
        'Run automated security scans on all services',
        'Resolve all critical and high severity vulnerabilities',
        'Implement security monitoring and alerting',
        'Enable encryption at rest and in transit'
      ]
    },
    {
      id: 'compliance-check',
      title: 'Compliance Validation',
      description: 'Ensure adherence to industry standards and regulations',
      category: 'security',
      priority: 'critical',
      status: 'in-progress',
      requirements: [
        'SOC 2 Type II compliance verification',
        'GDPR compliance assessment',
        'Data retention policy implementation',
        'Audit trail configuration'
      ]
    },
    {
      id: 'access-control',
      title: 'Access Control & IAM',
      description: 'Verify proper access controls and identity management',
      category: 'security',
      priority: 'critical',
      status: 'complete',
      requirements: [
        'Multi-factor authentication enabled',
        'Role-based access control implemented',
        'Principle of least privilege enforced',
        'Regular access review process established'
      ]
    },

    // Infrastructure & Performance
    {
      id: 'load-testing',
      title: 'Load & Performance Testing',
      description: 'Validate system performance under expected production load',
      category: 'performance',
      priority: 'critical',
      status: 'pending',
      requirements: [
        'Load testing with 150% expected traffic',
        'Database performance optimization',
        'CDN configuration and testing',
        'Auto-scaling policies validated'
      ]
    },
    {
      id: 'backup-recovery',
      title: 'Backup & Disaster Recovery',
      description: 'Ensure data protection and business continuity',
      category: 'infrastructure',
      priority: 'critical',
      status: 'in-progress',
      requirements: [
        'Automated backup schedule configured',
        'Disaster recovery plan tested',
        'Recovery time objective (RTO) validated',
        'Cross-region backup replication enabled'
      ]
    },
    {
      id: 'monitoring-alerting',
      title: 'Monitoring & Alerting',
      description: 'Comprehensive monitoring and incident response setup',
      category: 'operations',
      priority: 'high',
      status: 'complete',
      requirements: [
        'Application performance monitoring (APM)',
        'Infrastructure monitoring with alerts',
        'Log aggregation and analysis',
        'SLA monitoring and reporting'
      ]
    },

    // Operational Readiness
    {
      id: 'deployment-pipeline',
      title: 'CI/CD Pipeline',
      description: 'Production-ready deployment automation',
      category: 'operations',
      priority: 'high',
      status: 'complete',
      requirements: [
        'Automated testing in CI pipeline',
        'Blue-green deployment strategy',
        'Rollback procedures tested',
        'Environment parity validation'
      ]
    },
    {
      id: 'documentation',
      title: 'Documentation & Runbooks',
      description: 'Complete operational documentation',
      category: 'operations',
      priority: 'medium',
      status: 'in-progress',
      requirements: [
        'System architecture documentation',
        'Incident response runbooks',
        'Troubleshooting guides',
        'API documentation complete'
      ]
    },
    {
      id: 'team-training',
      title: 'Team Training & Support',
      description: 'Ensure team readiness for production operations',
      category: 'operations',
      priority: 'medium',
      status: 'pending',
      requirements: [
        'On-call rotation established',
        'Team trained on production systems',
        'Escalation procedures defined',
        'Support documentation available'
      ]
    }
  ];

  const toggleItem = (itemId: string) => {
    setCheckedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Activity className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <Circle className="h-5 w-5 text-gray-400" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security':
        return <Shield className="h-5 w-5" />;
      case 'performance':
        return <Zap className="h-5 w-5" />;
      case 'infrastructure':
        return <Server className="h-5 w-5" />;
      case 'operations':
        return <Settings className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getOverallReadiness = () => {
    const criticalItems = readinessItems.filter(item => item.priority === 'critical');
    const completeCritical = criticalItems.filter(item => item.status === 'complete').length;
    const totalComplete = readinessItems.filter(item => item.status === 'complete').length;
    
    return {
      criticalComplete: completeCritical,
      totalCritical: criticalItems.length,
      overallComplete: totalComplete,
      totalItems: readinessItems.length,
      percentage: Math.round((totalComplete / readinessItems.length) * 100)
    };
  };

  const readiness = getOverallReadiness();
  const isProductionReady = readiness.criticalComplete === readiness.totalCritical && readiness.percentage >= 90;

  const groupedItems = readinessItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ReadinessItem[]>);

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Production Rollout Readiness</CardTitle>
              <p className="text-muted-foreground mt-1">
                Comprehensive assessment of production readiness across all critical areas
              </p>
            </div>
            <div className="text-right">
              {isProductionReady ? (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Production Ready
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Not Ready
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {readiness.percentage}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Complete</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {readiness.criticalComplete}/{readiness.totalCritical}
              </div>
              <div className="text-sm text-muted-foreground">Critical Items</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {readiness.overallComplete}
              </div>
              <div className="text-sm text-muted-foreground">Items Complete</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600 mb-1">
                {readiness.totalItems - readiness.overallComplete}
              </div>
              <div className="text-sm text-muted-foreground">Remaining</div>
            </div>
          </div>
          
          <Progress value={readiness.percentage} className="h-3" />
        </CardContent>
      </Card>

      {/* Readiness Checklist by Category */}
      <Tabs defaultValue="security" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="infrastructure" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Infrastructure
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Operations
          </TabsTrigger>
        </TabsList>

        {Object.entries(groupedItems).map(([category, items]) => (
          <TabsContent key={category} value={category}>
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        {getCategoryIcon(item.category)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium">{item.title}</h3>
                            <Badge className={getPriorityColor(item.priority)}>
                              {item.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(item.status)}
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Requirements:</h4>
                      {item.requirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleItem(`${item.id}-${index}`)}
                            className="p-0 h-auto"
                          >
                            {checkedItems.includes(`${item.id}-${index}`) ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <span className={checkedItems.includes(`${item.id}-${index}`) ? 'line-through text-muted-foreground' : ''}>
                            {req}
                          </span>
                        </div>
                      ))}
                    </div>

                    {item.recommendations && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-sm text-blue-800 mb-2">Recommendations:</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          {item.recommendations.map((rec, index) => (
                            <li key={index}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Next Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {!isProductionReady && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">Action Required</h4>
                </div>
                <p className="text-sm text-yellow-700">
                  Complete all critical items before proceeding with production rollout.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button className="justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Generate Readiness Report
              </Button>
              <Button className="justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Schedule Review Meeting
              </Button>
              <Button className="justify-start" variant="outline">
                <Monitor className="h-4 w-4 mr-2" />
                Run System Health Check
              </Button>
              <Button className="justify-start" variant="outline">
                <Globe className="h-4 w-4 mr-2" />
                Initiate Go-Live Process
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionReadiness;
