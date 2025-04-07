import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Download,
  Upload,
  Play,
  CheckCircle2,
  AlertCircle,
  Code,
  Copy,
  FileCode,
  RefreshCw
} from 'lucide-react';
import { generateIaCTemplate, applyIaCTemplate } from '@/services/cloud';

const templateTypes = [
  { id: 'terraform', name: 'Terraform', language: 'hcl' },
  { id: 'cloudformation', name: 'CloudFormation', language: 'json' },
  { id: 'arm', name: 'Azure ARM', language: 'json' }
];

type IaCTemplateStatus = 'idle' | 'generating' | 'generated' | 'applying' | 'success' | 'error';

const InfrastructureAsCodePanel = () => {
  const [activeTab, setActiveTab] = useState('terraform');
  const [templateContent, setTemplateContent] = useState<Record<string, string>>({
    terraform: '',
    cloudformation: '',
    arm: ''
  });
  const [templateStatus, setTemplateStatus] = useState<Record<string, IaCTemplateStatus>>({
    terraform: 'idle',
    cloudformation: 'idle',
    arm: 'idle'
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const generateTemplate = async (type: string) => {
    setTemplateStatus(prev => ({ ...prev, [type]: 'generating' }));
    setErrorMessage(null);
    
    try {
      const result = await generateIaCTemplate(type);
      
      if (result.success) {
        setTemplateContent(prev => ({ ...prev, [type]: result.template }));
        setTemplateStatus(prev => ({ ...prev, [type]: 'generated' }));
        toast({
          title: "Template Generated",
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} template successfully generated`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      setTemplateStatus(prev => ({ ...prev, [type]: 'error' }));
      setErrorMessage(error.message || `Failed to generate ${type} template`);
      toast({
        title: "Generation Failed",
        description: error.message || `Failed to generate ${type} template`,
        variant: "destructive"
      });
    }
  };

  const applyTemplate = async (type: string) => {
    if (!templateContent[type]) {
      toast({
        title: "No Template",
        description: "Please generate or write a template first",
        variant: "destructive"
      });
      return;
    }
    
    setTemplateStatus(prev => ({ ...prev, [type]: 'applying' }));
    setErrorMessage(null);
    
    try {
      const result = await applyIaCTemplate(type, templateContent[type]);
      
      if (result.success) {
        setTemplateStatus(prev => ({ ...prev, [type]: 'success' }));
        toast({
          title: "Template Applied",
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} template successfully applied`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      setTemplateStatus(prev => ({ ...prev, [type]: 'error' }));
      setErrorMessage(error.message || `Failed to apply ${type} template`);
      toast({
        title: "Deployment Failed",
        description: error.message || `Failed to apply ${type} template`,
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Template content copied to clipboard",
    });
  };

  const downloadTemplate = (type: string, content: string) => {
    const fileExtension = type === 'terraform' ? 'tf' : 'json';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTemplateChange = (type: string, content: string) => {
    setTemplateContent(prev => ({ ...prev, [type]: content }));
    
    if (templateStatus[type] === 'error') {
      setTemplateStatus(prev => ({ ...prev, [type]: 'idle' }));
      setErrorMessage(null);
    }
  };

  const renderStatusBadge = (status: IaCTemplateStatus) => {
    switch (status) {
      case 'generating':
      case 'applying':
        return <Badge variant="outline" className="animate-pulse"><RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Processing</Badge>;
      case 'generated':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Template Ready</Badge>;
      case 'success':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"><CheckCircle2 className="h-3 w-3 mr-1" /> Applied</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Error</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Infrastructure as Code</CardTitle>
            <CardDescription>Generate and apply infrastructure templates</CardDescription>
          </div>
          {renderStatusBadge(templateStatus[activeTab])}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            {templateTypes.map(type => (
              <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-1">
                <FileCode className="h-4 w-4" />
                {type.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {templateTypes.map(type => (
            <TabsContent key={type.id} value={type.id} className="space-y-4">
              <div className="grid gap-4">
                <div className="flex justify-between">
                  <Button 
                    onClick={() => generateTemplate(type.id)}
                    disabled={templateStatus[type.id] === 'generating' || templateStatus[type.id] === 'applying'}
                    className="gap-1"
                  >
                    <Code className="h-4 w-4" /> Generate Template
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(templateContent[type.id])}
                      disabled={!templateContent[type.id]}
                      className="gap-1"
                    >
                      <Copy className="h-4 w-4" /> Copy
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => downloadTemplate(type.id, templateContent[type.id])}
                      disabled={!templateContent[type.id]}
                      className="gap-1"
                    >
                      <Download className="h-4 w-4" /> Download
                    </Button>
                    
                    <Button
                      variant="default"
                      onClick={() => applyTemplate(type.id)}
                      disabled={!templateContent[type.id] || templateStatus[type.id] === 'generating' || templateStatus[type.id] === 'applying'}
                      className="gap-1"
                    >
                      <Play className="h-4 w-4" /> Apply
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor={`${type.id}-template`}>Template</Label>
                  <Textarea
                    id={`${type.id}-template`}
                    className="font-mono h-96 mt-2 whitespace-pre"
                    value={templateContent[type.id]}
                    onChange={(e) => handleTemplateChange(type.id, e.target.value)}
                    placeholder={`Enter your ${type.name} template here...`}
                  />
                </div>
                
                {errorMessage && templateStatus[type.id] === 'error' && (
                  <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-md text-sm text-red-600 dark:text-red-400">
                    {errorMessage}
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InfrastructureAsCodePanel;
