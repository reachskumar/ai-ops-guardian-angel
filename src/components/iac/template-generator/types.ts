
export interface Template {
  id: string;
  name: string;
  description: string;
}

export interface TemplatesByProvider {
  [key: string]: Template[];
}

export interface TemplateGeneratorState {
  selectedProvider: string;
  selectedTemplate: string;
  generatedTemplate: string;
  templateName: string;
}
