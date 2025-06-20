
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CloudResource } from '@/services/cloud/types';
import { Settings, Save, RotateCcw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResourceConfigurationPanelProps {
  resource: CloudResource;
  onConfigurationChange: () => void;
}

const ResourceConfigurationPanel: React.FC<ResourceConfigurationPanelProps> = ({
  resource,
  onConfigurationChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    instanceType: resource.metadata?.instanceType || 't3.micro',
    storageSize: resource.metadata?.storageSize || '20',
    autoScaling: resource.metadata?.autoScaling || false,
    backupEnabled: resource.metadata?.backupEnabled || true,
    monitoringLevel: resource.metadata?.monitoringLevel || 'basic'
  });
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call to update resource configuration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Configuration Updated",
        description: "Resource configuration has been successfully updated.",
      });
      
      setIsEditing(false);
      onConfigurationChange();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update resource configuration.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setConfig({
      instanceType: resource.metadata?.instanceType || 't3.micro',
      storageSize: resource.metadata?.storageSize || '20',
      autoScaling: resource.metadata?.autoScaling || false,
      backupEnabled: resource.metadata?.backupEnabled || true,
      monitoringLevel: resource.metadata?.monitoringLevel || 'basic'
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Resource Configuration
            </CardTitle>
            <div className="flex gap-2">
              {isEditing && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleReset}
                    disabled={isSaving}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              )}
              {!isEditing && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                >
                  Edit Configuration
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Compute Configuration */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Compute Settings</h3>
              
              <div className="space-y-2">
                <Label htmlFor="instanceType">Instance Type</Label>
                {isEditing ? (
                  <Select 
                    value={config.instanceType} 
                    onValueChange={(value) => setConfig(prev => ({ ...prev, instanceType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="t3.micro">t3.micro (1 vCPU, 1GB RAM)</SelectItem>
                      <SelectItem value="t3.small">t3.small (2 vCPU, 2GB RAM)</SelectItem>
                      <SelectItem value="t3.medium">t3.medium (2 vCPU, 4GB RAM)</SelectItem>
                      <SelectItem value="t3.large">t3.large (2 vCPU, 8GB RAM)</SelectItem>
                      <SelectItem value="m5.large">m5.large (2 vCPU, 8GB RAM)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm font-medium">{config.instanceType}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="storageSize">Storage Size (GB)</Label>
                {isEditing ? (
                  <Input
                    id="storageSize"
                    type="number"
                    value={config.storageSize}
                    onChange={(e) => setConfig(prev => ({ ...prev, storageSize: e.target.value }))}
                    min="20"
                    max="1000"
                  />
                ) : (
                  <div className="text-sm font-medium">{config.storageSize} GB</div>
                )}
              </div>
            </div>

            {/* Advanced Configuration */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Advanced Settings</h3>
              
              <div className="space-y-2">
                <Label>Auto Scaling</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={config.autoScaling ? "default" : "secondary"}>
                    {config.autoScaling ? "Enabled" : "Disabled"}
                  </Badge>
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfig(prev => ({ ...prev, autoScaling: !prev.autoScaling }))}
                    >
                      Toggle
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Backup</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={config.backupEnabled ? "default" : "secondary"}>
                    {config.backupEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfig(prev => ({ ...prev, backupEnabled: !prev.backupEnabled }))}
                    >
                      Toggle
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monitoringLevel">Monitoring Level</Label>
                {isEditing ? (
                  <Select 
                    value={config.monitoringLevel} 
                    onValueChange={(value) => setConfig(prev => ({ ...prev, monitoringLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="enhanced">Enhanced</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm font-medium capitalize">{config.monitoringLevel}</div>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Configuration Changes</p>
                  <p className="text-yellow-700">
                    Some changes may require a resource restart and could cause temporary downtime.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceConfigurationPanel;
