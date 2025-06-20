
import { useState } from 'react';
import type { ProvisioningRequest as ProvisioningRequestType } from './ApprovalWorkflow';
import type { AuditEntry } from './AuditLog';

export const useProvisioningState = () => {
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

  return {
    provisioningRequests,
    setProvisioningRequests,
    auditEntries,
    setAuditEntries,
    budgetRemaining,
    quotaStatus,
    notifications,
    setNotifications
  };
};
