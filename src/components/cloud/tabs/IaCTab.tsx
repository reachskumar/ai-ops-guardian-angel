
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileCode, 
  Download, 
  Copy, 
  Play, 
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { 
  generateIaCTemplate,
  applyIaCTemplate
} from '@/services/cloud/infrastructureService';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useCloudResources } from '@/hooks/useCloudResources';

const IaCTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('terraform');
  const [templateCode, setTemplateCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyProgress, setApplyProgress] = useState(0);
  const [applyStatus, setApplyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [applyMessage, setApplyMessage] = useState('');
  const { toast } = useToast();
  const { resources } = useCloudResources();
  
  // Generate IaC template
  const handleGenerateTemplate = async () => {
    setIsGenerating(true);
    try {
      const resourceIds = resources.map(r => r.id);
      const result = await generateIaCTemplate(activeTab, resourceIds);
      
      if (result.success && result.template) {
        setTemplateCode(result.template);
        toast({
          title: 'Template Generated',
          description: `${activeTab} template has been generated successfully`,
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to generate template',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `An unexpected error occurred: ${error}`,
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Apply IaC template
  const handleApplyTemplate = async () => {
    if (!templateCode.trim()) {
      toast({
        title: 'Error',
        description: 'Template code cannot be empty',
        variant: 'destructive'
      });
      return;
    }
    
    setIsApplying(true);
    setApplyProgress(0);
    setApplyStatus('idle');
    setApplyMessage('');
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setApplyProgress(prev => {
        const next = prev + Math.random() * 15;
        return next < 90 ? next : prev; // Cap at 90% until complete
      });
    }, 800);
    
    try {
      const result = await applyIaCTemplate(activeTab, templateCode);
      
      clearInterval(progressInterval);
      
      if (result.success) {
        setApplyProgress(100);
        setApplyStatus('success');
        setApplyMessage(`Successfully applied template. ${result.resources?.length || 0} resources affected.`);
        
        toast({
          title: 'Template Applied',
          description: 'Infrastructure changes have been applied successfully',
        });
      } else {
        setApplyProgress(100);
        setApplyStatus('error');
        setApplyMessage(result.error || 'Failed to apply template');
        
        toast({
          title: 'Apply Failed',
          description: result.error || 'Failed to apply infrastructure changes',
          variant: 'destructive'
        });
      }
    } catch (error) {
      clearInterval(progressInterval);
      setApplyProgress(100);
      setApplyStatus('error');
      setApplyMessage(`Error: ${error}`);
      
      toast({
        title: 'Error',
        description: `An unexpected error occurred: ${error}`,
        variant: 'destructive'
      });
    } finally {
      setIsApplying(false);
    }
  };
  
  // Copy template to clipboard
  const handleCopyTemplate = () => {
    if (!templateCode) return;
    
    navigator.clipboard.writeText(templateCode).then(() => {
      toast({
        title: 'Copied',
        description: 'Template copied to clipboard',
      });
    });
  };
  
  // Download template as a file
  const handleDownloadTemplate = () => {
    if (!templateCode) return;
    
    let extension = '.tf';
    let filename = 'infrastructure';
    
    switch (activeTab) {
      case 'cloudformation':
        extension = '.json';
        filename = 'cloudformation-template';
        break;
      case 'arm':
        extension = '.json';
        filename = 'arm-template';
        break;
      default:
        extension = '.tf';
        filename = 'terraform-config';
    }
    
    const element = document.createElement('a');
    const file = new Blob([templateCode], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${filename}${extension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: 'Downloaded',
      description: `Template downloaded as ${filename}${extension}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Infrastructure as Code</h2>
        <div>
          <Button 
            onClick={handleGenerateTemplate} 
            disabled={isGenerating}
          >
            {isGenerating ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileCode className="mr-2 h-4 w-4" />
            )}
            Generate Template
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="terraform">Terraform</TabsTrigger>
          <TabsTrigger value="cloudformation">CloudFormation</TabsTrigger>
          <TabsTrigger value="arm">Azure ARM</TabsTrigger>
        </TabsList>
        
        <TabsContent value="terraform" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between">
                <span>Terraform Configuration</span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleCopyTemplate}
                    disabled={!templateCode}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleDownloadTemplate}
                    disabled={!templateCode}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                className="h-[400px] font-mono"
                placeholder="Generate a Terraform template for your infrastructure"
                value={templateCode}
                onChange={(e) => setTemplateCode(e.target.value)}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cloudformation" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between">
                <span>CloudFormation Template</span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleCopyTemplate}
                    disabled={!templateCode}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleDownloadTemplate}
                    disabled={!templateCode}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                className="h-[400px] font-mono"
                placeholder="Generate a CloudFormation template for your infrastructure"
                value={templateCode}
                onChange={(e) => setTemplateCode(e.target.value)}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="arm" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between">
                <span>Azure ARM Template</span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleCopyTemplate}
                    disabled={!templateCode}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleDownloadTemplate}
                    disabled={!templateCode}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                className="h-[400px] font-mono"
                placeholder="Generate an Azure ARM template for your infrastructure"
                value={templateCode}
                onChange={(e) => setTemplateCode(e.target.value)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Apply Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={handleApplyTemplate}
              disabled={isApplying || !templateCode}
              className="w-full"
            >
              {isApplying ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Apply {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Template
            </Button>
            
            {isApplying && (
              <div className="space-y-2">
                <Progress value={applyProgress} />
                <p className="text-sm text-center text-muted-foreground">
                  Applying infrastructure changes... {Math.round(applyProgress)}%
                </p>
              </div>
            )}
            
            {applyStatus === 'success' && (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  {applyMessage}
                </AlertDescription>
              </Alert>
            )}
            
            {applyStatus === 'error' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {applyMessage}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IaCTab;
