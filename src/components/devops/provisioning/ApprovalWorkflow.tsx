
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  DollarSign,
  Calendar,
  MessageSquare,
  Mail,
  Slack
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface ProvisioningRequest {
  id: string;
  requester: string;
  resourceType: string;
  estimatedCost: number;
  description: string;
  businessJustification: string;
  status: 'pending' | 'approved' | 'rejected' | 'auto-approved';
  submittedAt: string;
  approver?: string;
  approvedAt?: string;
  comments?: string;
  config: any;
}

interface ApprovalWorkflowProps {
  requests: ProvisioningRequest[];
  userRole: 'admin' | 'requestor' | 'viewer';
  onApprove: (requestId: string, comments?: string) => void;
  onReject: (requestId: string, comments: string) => void;
}

const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({
  requests,
  userRole,
  onApprove,
  onReject
}) => {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [comments, setComments] = useState('');
  const [notificationMethod, setNotificationMethod] = useState<'email' | 'slack'>('email');
  const { toast } = useToast();

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const completedRequests = requests.filter(r => r.status !== 'pending');

  const handleApprove = (requestId: string) => {
    onApprove(requestId, comments);
    setComments('');
    setSelectedRequest(null);
    
    toast({
      title: 'Request Approved',
      description: 'The provisioning request has been approved and deployment will begin.',
    });
  };

  const handleReject = (requestId: string) => {
    if (!comments.trim()) {
      toast({
        title: 'Comments Required',
        description: 'Please provide a reason for rejection.',
        variant: 'destructive'
      });
      return;
    }
    
    onReject(requestId, comments);
    setComments('');
    setSelectedRequest(null);
    
    toast({
      title: 'Request Rejected',
      description: 'The provisioning request has been rejected.',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'auto-approved':
        return <Badge variant="default" className="bg-blue-500"><CheckCircle className="h-3 w-3 mr-1" />Auto-Approved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  if (userRole === 'viewer') {
    return (
      <Alert>
        <MessageSquare className="h-4 w-4" />
        <AlertDescription>
          You have read-only access to approval workflows.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Approvals ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{request.resourceType}</h4>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Requested by: {request.requester}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Cost: {formatCurrency(request.estimatedCost)}/month
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <p className="text-sm">{request.description}</p>
                      
                      {request.businessJustification && (
                        <div className="text-sm">
                          <strong>Business Justification:</strong>
                          <p className="mt-1 text-muted-foreground">{request.businessJustification}</p>
                        </div>
                      )}
                    </div>
                    
                    {userRole === 'admin' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedRequest(selectedRequest === request.id ? null : request.id)}
                        >
                          Review
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {selectedRequest === request.id && userRole === 'admin' && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Comments</label>
                        <Textarea
                          placeholder="Add comments for the requester..."
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(request.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRequest(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          Email notification will be sent
                        </div>
                        <div className="flex items-center gap-1">
                          <Slack className="h-3 w-3" />
                          Slack notification available
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto-Approval Policies */}
      <Card>
        <CardHeader>
          <CardTitle>Auto-Approval Policies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">Low-Cost Instances</p>
                <p className="text-sm text-muted-foreground">Auto-approve instances under ₹500/month</p>
              </div>
              <Badge variant="default" className="bg-green-500">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">Development Environment</p>
                <p className="text-sm text-muted-foreground">Auto-approve dev resources with TTL ≤ 7 days</p>
              </div>
              <Badge variant="default" className="bg-green-500">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">Standard Templates</p>
                <p className="text-sm text-muted-foreground">Auto-approve pre-approved blueprint deployments</p>
              </div>
              <Badge variant="default" className="bg-green-500">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {completedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{request.resourceType}</span>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      by {request.requester} • {formatCurrency(request.estimatedCost)}/month
                    </div>
                    {request.comments && (
                      <p className="text-sm text-muted-foreground italic">"{request.comments}"</p>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {request.approvedAt ? new Date(request.approvedAt).toLocaleDateString() : new Date(request.submittedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApprovalWorkflow;
