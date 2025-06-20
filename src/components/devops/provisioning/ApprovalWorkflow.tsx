
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, AlertCircle, Cloud } from 'lucide-react';

export type ProvisioningStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'auto-approved'
  | 'deployed'
  | 'failed'
  | 'provisioning';

export type UserRole = 'admin' | 'requestor' | 'viewer' | 'developer' | 'operator';

export interface ProvisioningRequest {
  id: string;
  requester: string;
  resourceType: string;
  estimatedCost: number;
  description: string;
  businessJustification: string;
  status: ProvisioningStatus;
  submittedAt: string;
  approver?: string;
  approvedAt?: string;
  rejectedAt?: string;
  comments?: string;
  config: any;
  resourceId?: string;
  deployedAt?: string;
  errorMessage?: string;
}

interface ApprovalWorkflowProps {
  requests: ProvisioningRequest[];
  userRole: UserRole;
  onApprove: (requestId: string, comments?: string) => void;
  onReject: (requestId: string, reason: string) => void;
}

const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({
  requests,
  userRole,
  onApprove,
  onReject
}) => {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const getStatusIcon = (status: ProvisioningStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
      case 'auto-approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'deployed':
        return <Cloud className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'provisioning':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: ProvisioningStatus) => {
    const variants = {
      pending: 'secondary',
      approved: 'default',
      'auto-approved': 'default',
      rejected: 'destructive',
      deployed: 'default',
      failed: 'destructive',
      provisioning: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status] || 'secondary'} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleApprove = (requestId: string) => {
    onApprove(requestId, comments);
    setComments('');
    setSelectedRequest(null);
  };

  const handleReject = (requestId: string) => {
    if (rejectionReason.trim()) {
      onReject(requestId, rejectionReason);
      setRejectionReason('');
      setSelectedRequest(null);
    }
  };

  const canApprove = userRole === 'admin' || userRole === 'operator';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Provisioning Requests</h3>
        <Badge variant="outline">
          {requests.filter(r => r.status === 'pending').length} Pending
        </Badge>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              No provisioning requests found.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {request.resourceType} - {request.description}
                  </CardTitle>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Requester:</strong> {request.requester}</p>
                    <p><strong>Estimated Cost:</strong> ${request.estimatedCost}/month</p>
                    <p><strong>Submitted:</strong> {new Date(request.submittedAt).toLocaleDateString()}</p>
                    {request.resourceId && (
                      <p><strong>Resource ID:</strong> {request.resourceId}</p>
                    )}
                  </div>
                  <div>
                    <p><strong>Business Justification:</strong></p>
                    <p className="text-muted-foreground">{request.businessJustification}</p>
                    {request.errorMessage && (
                      <p className="text-red-600 mt-2"><strong>Error:</strong> {request.errorMessage}</p>
                    )}
                  </div>
                </div>

                {request.status === 'pending' && canApprove && (
                  <div className="mt-4 space-y-4">
                    {selectedRequest === request.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Comments (optional)</label>
                          <Textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Add any comments..."
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Rejection Reason</label>
                          <Textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Provide reason for rejection..."
                            className="mt-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(request.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(request.id)}
                            variant="destructive"
                            disabled={!rejectionReason.trim()}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            onClick={() => setSelectedRequest(null)}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setSelectedRequest(request.id)}
                        variant="outline"
                      >
                        Review Request
                      </Button>
                    )}
                  </div>
                )}

                {(request.approver || request.comments) && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm">
                      <strong>
                        {request.status === 'approved' ? 'Approved' : 'Rejected'} by:
                      </strong> {request.approver}
                    </p>
                    {request.comments && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Comments:</strong> {request.comments}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovalWorkflow;
