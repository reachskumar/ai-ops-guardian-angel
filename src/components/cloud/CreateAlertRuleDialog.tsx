
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createAlertRule } from '@/services/cloud/monitoringService';
import { AlertRule } from '@/services/cloud/types';

interface CreateAlertRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreateAlertRuleDialog: React.FC<CreateAlertRuleDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    resource_type: 'EC2 Instance',
    metric: 'cpu_utilization',
    operator: 'gt' as 'gt' | 'lt' | 'eq',
    threshold: 80,
    duration: 300,
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    enabled: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createAlertRule(formData);
      
      if (result.success) {
        toast({
          title: "Alert Rule Created",
          description: `Successfully created alert rule: ${formData.name}`
        });
        onOpenChange(false);
        setFormData({
          name: '',
          description: '',
          resource_type: 'EC2 Instance',
          metric: 'cpu_utilization',
          operator: 'gt',
          threshold: 80,
          duration: 300,
          severity: 'medium',
          enabled: true
        });
        if (onSuccess) onSuccess();
      } else {
        toast({
          title: "Failed to Create Alert Rule",
          description: result.error || "An error occurred",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create alert rule",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Alert Rule</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="High CPU Alert"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Alert when CPU usage is high"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Resource Type</Label>
              <Select
                value={formData.resource_type}
                onValueChange={(value) => setFormData({ ...formData, resource_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EC2 Instance">EC2 Instance</SelectItem>
                  <SelectItem value="RDS MySQL">RDS MySQL</SelectItem>
                  <SelectItem value="S3 Bucket">S3 Bucket</SelectItem>
                  <SelectItem value="Lambda Function">Lambda Function</SelectItem>
                  <SelectItem value="Virtual Machine">Virtual Machine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Metric</Label>
              <Select
                value={formData.metric}
                onValueChange={(value) => setFormData({ ...formData, metric: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpu_utilization">CPU Utilization</SelectItem>
                  <SelectItem value="memory_utilization">Memory Utilization</SelectItem>
                  <SelectItem value="disk_utilization">Disk Utilization</SelectItem>
                  <SelectItem value="network_in">Network In</SelectItem>
                  <SelectItem value="network_out">Network Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Operator</Label>
              <Select
                value={formData.operator}
                onValueChange={(value) => setFormData({ ...formData, operator: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gt">Greater than</SelectItem>
                  <SelectItem value="lt">Less than</SelectItem>
                  <SelectItem value="eq">Equal to</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold">Threshold</Label>
              <Input
                id="threshold"
                type="number"
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })}
                min="0"
                max="100"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (s)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                min="60"
                step="60"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Severity</Label>
            <Select
              value={formData.severity}
              onValueChange={(value) => setFormData({ ...formData, severity: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAlertRuleDialog;
