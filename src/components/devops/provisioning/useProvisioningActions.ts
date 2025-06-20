
import { useState } from 'react';
import { provisionCloudResource, ProvisioningConfig } from '@/services/cloud/realProvisioningService';
import { getCloudAccounts } from '@/services/cloud/accountService';
import { useToast } from '@/hooks/use-toast';
import type { ProvisioningRequest, UserRole } from './ApprovalWorkflow';
import type { AuditEntry } from './AuditLog';
import type { SecureNotificationChannel } from '@/services/secureProvisioningService';

export const useProvisioningActions = (
  provisioningRequests: ProvisioningRequest[],
  setProvisioningRequests: React.Dispatch<React.SetStateAction<ProvisioningRequest[]>>,
  setAuditEntries: React.Dispatch<React.SetStateAction<AuditEntry[]>>,
  notificationChannels: SecureNotificationChannel[]
) => {
  const { toast } = useToast();
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Mock current user for demo purposes
  const currentUser = {
    name: 'John Doe',
    role: 'developer' as UserRole,
    email: 'john.doe@company.com'
  };

  const handleProvisioningRequest = async (config: any) => {
    try {
      setIsProvisioning(true);
      
      // Create the provisioning request
      const newRequest: ProvisioningRequest = {
        id: `req-${Date.now()}`,
        requester: currentUser.name,
        resourceType: config.resourceType,
        estimatedCost: config.estimatedCost,
        description: config.description,
        businessJustification: config.businessJustification,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        config
      };

      // Add to requests list
      setProvisioningRequests(prev => [newRequest, ...prev]);

      // Add audit entry
      const auditEntry: AuditEntry = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: currentUser.name,
        action: 'submit',
        resourceType: config.resourceType,
        resourceName: config.name,
        status: 'pending',
        details: `Submitted provisioning request for ${config.resourceType}: ${config.name}`,
        ipAddress: '192.168.1.100',
        userAgent: navigator.userAgent,
        cost: config.estimatedCost,
        region: config.region,
        tags: config.tags
      };

      setAuditEntries(prev => [auditEntry, ...prev]);

      // Send notifications
      await sendNotifications(notificationChannels, {
        type: 'new_request',
        request: newRequest,
        user: currentUser.name
      });

      toast({
        title: "Request Submitted",
        description: `Provisioning request for ${config.resourceType} has been submitted for approval.`
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error submitting provisioning request:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit provisioning request",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleApproval = async (requestId: string, comments?: string) => {
    try {
      const request = provisioningRequests.find(r => r.id === requestId);
      if (!request) return;

      // Update request status to approved
      setProvisioningRequests(prev =>
        prev.map(r => r.id === requestId ? {
          ...r,
          status: 'approved' as const,
          approver: currentUser.name,
          approvedAt: new Date().toISOString(),
          comments
        } : r)
      );

      // Add audit entry for approval
      const approvalAuditEntry: AuditEntry = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: currentUser.name,
        action: 'approve',
        resourceType: request.resourceType,
        resourceName: request.config.name,
        status: 'success',
        details: `Approved provisioning request: ${comments || 'No comments'}`,
        ipAddress: '192.168.1.100',
        userAgent: navigator.userAgent,
        cost: request.estimatedCost,
        region: request.config.region,
        tags: request.config.tags
      };

      setAuditEntries(prev => [approvalAuditEntry, ...prev]);

      // Start actual provisioning process
      await startRealProvisioning(request);

      toast({
        title: "Request Approved",
        description: `Provisioning request has been approved and deployment started.`
      });
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve request",
        variant: "destructive"
      });
    }
  };

  const startRealProvisioning = async (request: ProvisioningRequest) => {
    try {
      // Get the cloud account for this request
      const accounts = await getCloudAccounts();
      const account = accounts.find(a => a.provider === request.config.cloudProvider);
      
      if (!account) {
        throw new Error(`No ${request.config.cloudProvider} account found`);
      }

      // Prepare provisioning configuration
      const provisioningConfig: ProvisioningConfig = {
        name: request.config.name || request.description,
        resourceType: request.resourceType,
        region: request.config.region,
        size: request.config.instanceType,
        tags: request.config.tags,
        description: request.description,
        businessJustification: request.businessJustification,
        vpc: request.config.vpc,
        subnet: request.config.subnet,
        securityGroups: request.config.securityGroups,
        storageSize: request.config.storageSize,
        encryption: request.config.encryption,
        ttl: request.config.ttl,
        autoDeprovision: request.config.autoDeprovision
      };

      // Call real provisioning service
      const result = await provisionCloudResource(
        account.id,
        account.provider,
        provisioningConfig
      );

      if (result.success) {
        // Update request status to deployed
        setProvisioningRequests(prev =>
          prev.map(r => r.id === request.id ? {
            ...r,
            status: 'deployed' as const,
            resourceId: result.resourceId,
            deployedAt: new Date().toISOString()
          } : r)
        );

        // Add deployment audit entry
        const deploymentAuditEntry: AuditEntry = {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: 'System',
          action: 'deploy',
          resourceType: request.resourceType,
          resourceName: request.config.name,
          status: 'success',
          details: `Successfully deployed ${request.resourceType} with ID: ${result.resourceId}`,
          ipAddress: '0.0.0.0',
          userAgent: 'System/Provisioning',
          cost: request.estimatedCost,
          region: request.config.region,
          tags: request.config.tags
        };

        setAuditEntries(prev => [deploymentAuditEntry, ...prev]);

        toast({
          title: "Deployment Successful",
          description: `${request.resourceType} has been successfully deployed.`
        });
      } else {
        // Update request status to failed
        setProvisioningRequests(prev =>
          prev.map(r => r.id === request.id ? {
            ...r,
            status: 'failed' as const,
            errorMessage: result.error
          } : r)
        );

        // Add failure audit entry
        const failureAuditEntry: AuditEntry = {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: 'System',
          action: 'deploy',
          resourceType: request.resourceType,
          resourceName: request.config.name,
          status: 'failed',
          details: `Failed to deploy ${request.resourceType}: ${result.error}`,
          ipAddress: '0.0.0.0',
          userAgent: 'System/Provisioning',
          cost: request.estimatedCost,
          region: request.config.region,
          tags: request.config.tags
        };

        setAuditEntries(prev => [failureAuditEntry, ...prev]);

        toast({
          title: "Deployment Failed",
          description: result.error || "Failed to deploy resource",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error during real provisioning:', error);
      
      // Update request status to failed
      setProvisioningRequests(prev =>
        prev.map(r => r.id === request.id ? {
          ...r,
          status: 'failed' as const,
          errorMessage: error.message
        } : r)
      );

      toast({
        title: "Deployment Error",
        description: error.message || "An error occurred during deployment",
        variant: "destructive"
      });
    }
  };

  const handleRejection = async (requestId: string, reason: string) => {
    setProvisioningRequests(prev =>
      prev.map(r => r.id === requestId ? {
        ...r,
        status: 'rejected' as const,
        approver: currentUser.name,
        rejectedAt: new Date().toISOString(),
        comments: reason
      } : r)
    );

    const request = provisioningRequests.find(r => r.id === requestId);
    if (request) {
      const auditEntry: AuditEntry = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: currentUser.name,
        action: 'reject',
        resourceType: request.resourceType,
        resourceName: request.config.name,
        status: 'rejected',
        details: `Rejected provisioning request: ${reason}`,
        ipAddress: '192.168.1.100',
        userAgent: navigator.userAgent,
        cost: request.estimatedCost,
        region: request.config.region,
        tags: request.config.tags
      };

      setAuditEntries(prev => [auditEntry, ...prev]);
    }

    toast({
      title: "Request Rejected",
      description: "Provisioning request has been rejected."
    });
  };

  const handleExportAudit = async (format: string, entries: AuditEntry[]) => {
    const data = format === 'json' ? JSON.stringify(entries, null, 2) : 
                 entries.map(e => `${e.timestamp},${e.user},${e.action},${e.resourceType},${e.status}`).join('\n');
    
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Send notifications helper
  const sendNotifications = async (channels: SecureNotificationChannel[], notification: any) => {
    console.log('Sending notifications:', notification);
  };

  return {
    handleProvisioningRequest,
    handleApproval,
    handleRejection,
    handleExportAudit,
    currentUser,
    isProvisioning
  };
};
