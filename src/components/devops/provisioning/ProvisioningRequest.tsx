
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Cloud, DollarSign, Activity } from 'lucide-react';
import type { UserRole } from './ApprovalWorkflow';

interface ProvisioningRequestProps {
  onSubmit: (config: any) => Promise<{ success: boolean; error?: string }>;
  userRole: UserRole;
  budgetRemaining: number;
  quotaStatus: Record<string, { used: number; limit: number }>;
}

const ProvisioningRequest: React.FC<ProvisioningRequestProps> = ({
  onSubmit,
  userRole,
  budgetRemaining,
  quotaStatus
}) => {
  const [formData, setFormData] = useState({
    name: '',
    resourceType: '',
    cloudProvider: 'aws',
    region: 'us-east-1',
    instanceType: 't3.micro',
    description: '',
    businessJustification: '',
    estimatedCost: 0,
    tags: {}
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const result = await onSubmit(formData);
      setSubmitResult(result);
      
      if (result.success) {
        // Reset form on success
        setFormData({
          name: '',
          resourceType: '',
          cloudProvider: 'aws',
          region: 'us-east-1',
          instanceType: 't3.micro',
          description: '',
          businessJustification: '',
          estimatedCost: 0,
          tags: {}
        });
      }
    } catch (error: any) {
      setSubmitResult({ success: false, error: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = userRole === 'admin' || userRole === 'developer' || userRole === 'operator';

  if (!canSubmit) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Cloud className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>You don't have permission to submit provisioning requests.</p>
            <p className="text-sm mt-2">Contact your administrator for access.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget and Quota Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Budget Remaining</p>
                <p className="text-lg font-bold text-green-600">${budgetRemaining}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {Object.entries(quotaStatus).map(([resource, quota]) => (
          <Card key={resource}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium capitalize">{resource.replace('-', ' ')}</p>
                  <p className="text-lg font-bold">
                    {quota.used}/{quota.limit}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(quota.used / quota.limit) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Provisioning Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Request New Resource
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Resource Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="my-web-server"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="resourceType">Resource Type</Label>
                <Select 
                  value={formData.resourceType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, resourceType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select resource type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EC2 Instance">EC2 Instance</SelectItem>
                    <SelectItem value="RDS Database">RDS Database</SelectItem>
                    <SelectItem value="S3 Bucket">S3 Bucket</SelectItem>
                    <SelectItem value="Lambda Function">Lambda Function</SelectItem>
                    <SelectItem value="EKS Cluster">EKS Cluster</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cloudProvider">Cloud Provider</Label>
                <Select 
                  value={formData.cloudProvider} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, cloudProvider: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aws">AWS</SelectItem>
                    <SelectItem value="azure">Azure</SelectItem>
                    <SelectItem value="gcp">Google Cloud</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="region">Region</Label>
                <Select 
                  value={formData.region} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                    <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                    <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                    <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="instanceType">Instance Size</Label>
                <Select 
                  value={formData.instanceType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, instanceType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="t3.micro">t3.micro (1 vCPU, 1GB RAM)</SelectItem>
                    <SelectItem value="t3.small">t3.small (2 vCPU, 2GB RAM)</SelectItem>
                    <SelectItem value="t3.medium">t3.medium (2 vCPU, 4GB RAM)</SelectItem>
                    <SelectItem value="t3.large">t3.large (2 vCPU, 8GB RAM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the resource"
                required
              />
            </div>

            <div>
              <Label htmlFor="businessJustification">Business Justification</Label>
              <Textarea
                id="businessJustification"
                value={formData.businessJustification}
                onChange={(e) => setFormData(prev => ({ ...prev, businessJustification: e.target.value }))}
                placeholder="Explain why this resource is needed..."
                required
              />
            </div>

            <div>
              <Label htmlFor="estimatedCost">Estimated Monthly Cost ($)</Label>
              <Input
                id="estimatedCost"
                type="number"
                value={formData.estimatedCost}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            {submitResult && (
              <Alert variant={submitResult.success ? "default" : "destructive"}>
                <AlertDescription>
                  {submitResult.success 
                    ? "Provisioning request submitted successfully and is pending approval."
                    : `Failed to submit request: ${submitResult.error}`
                  }
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Provisioning Request'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProvisioningRequest;
