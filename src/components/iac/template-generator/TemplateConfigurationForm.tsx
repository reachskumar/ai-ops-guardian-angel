
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import { templates } from './constants';
import { TemplateGeneratorState } from './types';

interface TemplateConfigurationFormProps {
  state: TemplateGeneratorState;
  onStateChange: (updates: Partial<TemplateGeneratorState>) => void;
  onGenerate: () => void;
}

const TemplateConfigurationForm: React.FC<TemplateConfigurationFormProps> = ({
  state,
  onStateChange,
  onGenerate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="template-name">Template Name</Label>
          <Input
            id="template-name"
            placeholder="Enter template name"
            value={state.templateName}
            onChange={(e) => onStateChange({ templateName: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="provider">Cloud Provider</Label>
          <Select 
            value={state.selectedProvider} 
            onValueChange={(value) => onStateChange({ selectedProvider: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aws">Amazon Web Services</SelectItem>
              <SelectItem value="azure">Microsoft Azure</SelectItem>
              <SelectItem value="gcp">Google Cloud Platform</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="template">Template Type</Label>
          <Select 
            value={state.selectedTemplate} 
            onValueChange={(value) => onStateChange({ selectedTemplate: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {templates[state.selectedProvider]?.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {state.selectedTemplate && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              {templates[state.selectedProvider]
                ?.find(t => t.id === state.selectedTemplate)?.description}
            </p>
          </div>
        )}

        <Button onClick={onGenerate} className="w-full">
          <FileText className="mr-2 h-4 w-4" />
          Generate Template
        </Button>
      </CardContent>
    </Card>
  );
};

export default TemplateConfigurationForm;
