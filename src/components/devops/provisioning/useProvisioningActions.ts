
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/AuthProvider';
import { sendSecureProvisioningNotification, type SecureNotificationChannel } from '@/services/secureProvisioningService';
import type { ProvisioningNotification } from '@/services/provisioningNotificationService';
import type { ProvisioningConfig } from './ProvisioningRequest';
import type { ProvisioningRequest as ProvisioningRequestType } from './ApprovalWorkflow';
import type { AuditEntry } from './AuditLog';

export const useProvisioningActions = (
  provisioningRequests: ProvisioningRequestType[],
  setProvisioningRequests: React.Dispatch<React.SetStateAction<ProvisioningRequestType[]>>,
  setAuditEntries: React.Dispatch<React.SetStateAction<AuditEntry[]>>,
  notificationChannels: SecureNotificationChannel[]
) => {
  const { toast } = useToast();
  const { user, permissions } = useAuth();

  const currentUser = {
    name: 'John Doe',
    role: 'admin' as 'admin' | 'requestor' | 'viewer',
    email: 'john.doe@company.com'
  };

  const sendNotification = async (notification: any) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    if (!permissions.canManage) {
      toast({
        title: 'Permission Denied',
        description: 'You need operator access or higher to send notifications',
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await sendSecureProvisioningNotification(
        notification, 
        notificationChannels,
        user.id
      );
      
      if (result.success) {
        console.log('Secure notifications sent successfully');
      } else {
        console.warn('Some secure notifications failed:', result.errors);
        toast({
          title: 'Notification Warning',
          description: `Some notifications failed to send: ${result.errors.join(', ')}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to send secure notifications:', error);
      toast({
        title: 'Notification Error',
        description: 'Failed to send notifications due to security validation',
        variant: 'destructive'
      });
    }
  };

  const handleProvisioningRequest = async (config: ProvisioningConfig) => {
    const newRequest: ProvisioningRequestType = {
      id: `req-${Date.now()}`,
      requester: currentUser.name,
      resourceType: config.resourceType,
      estimatedCost: config.estimatedCost,
      description: config.description,
      businessJustification: config.businessJustification,
      status: config.estimatedCost < 500 ? 'auto-approved' : 'pending',
      submittedAt: new Date().toISOString(),
      config
    };

    setProvisioningRequests(prev => [newRequest, ...prev]);

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

    const notification: ProvisioningNotification = {
      type: newRequest.status === 'auto-approved' ? 'approved' : 'approval_required',
      requestId: newRequest.id,
      requester: newRequest.requester,
      resourceType: newRequest.resourceType,
      estimatedCost: newRequest.estimatedCost
    };

    await sendNotification(notification);

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

  const handleApproval = async (requestId: string, comments?: string) => {
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

      const notification: ProvisioningNotification = {
        type: 'approved',
        requestId: request.id,
        requester: request.requester,
        resourceType: request.resourceType,
        estimatedCost: request.estimatedCost,
        approver: currentUser.name,
        comments
      };

      await sendNotification(notification);
    }
  };

  const handleRejection = async (requestId: string, comments: string) => {
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

      const notification: ProvisioningNotification = {
        type: 'rejected',
        requestId: request.id,
        requester: request.requester,
        resourceType: request.resourceType,
        estimatedCost: request.estimatedCost,
        approver: currentUser.name,
        comments
      };

      await sendNotification(notification);
    }
  };

  const handleExportAudit = (format: 'json' | 'csv', auditEntries: AuditEntry[]) => {
    if (format === 'json') {
      const dataStr = JSON.stringify(auditEntries, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-log-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } else {
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

  return {
    handleProvisioningRequest,
    handleApproval,
    handleRejection,
    handleExportAudit,
    currentUser
  };
};
