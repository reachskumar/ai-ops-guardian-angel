
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  TemplateConfigurationForm,
  TemplateOutput,
  QuickTemplates,
  TemplateGeneratorState
} from './template-generator';
import { templates } from './template-generator/constants';
import { generateTerraformTemplate, getTemplateContent } from './template-generator/utils';

const TemplateGenerator: React.FC = () => {
  const [state, setState] = useState<TemplateGeneratorState>({
    selectedProvider: 'aws',
    selectedTemplate: '',
    generatedTemplate: '',
    templateName: ''
  });
  const { toast } = useToast();

  const handleStateChange = (updates: Partial<TemplateGeneratorState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const generateTemplate = () => {
    if (!state.selectedTemplate || !state.templateName) {
      toast({
        title: 'Missing Information',
        description: 'Please select a template and provide a name',
        variant: 'destructive'
      });
      return;
    }

    const template = templates[state.selectedProvider]
      .find(t => t.id === state.selectedTemplate);

    if (!template) return;

    const templateContent = getTemplateContent(state.selectedTemplate, state.selectedProvider);
    const generated = generateTerraformTemplate(state.templateName, template.name, templateContent);

    setState(prev => ({ ...prev, generatedTemplate: generated }));
    
    toast({
      title: 'Template Generated',
      description: `${template.name} template has been generated successfully`,
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(state.generatedTemplate);
    toast({
      title: 'Copied',
      description: 'Template copied to clipboard',
    });
  };

  const downloadTemplate = () => {
    const element = document.createElement('a');
    const file = new Blob([state.generatedTemplate], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${state.templateName || 'infrastructure'}.tf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Infrastructure Template Generator</h2>
        <Badge variant="outline">Terraform & CloudFormation</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TemplateConfigurationForm
          state={state}
          onStateChange={handleStateChange}
          onGenerate={generateTemplate}
        />

        <TemplateOutput
          generatedTemplate={state.generatedTemplate}
          templateName={state.templateName}
          onCopy={copyToClipboard}
          onDownload={downloadTemplate}
        />
      </div>

      <QuickTemplates />
    </div>
  );
};

export default TemplateGenerator;
