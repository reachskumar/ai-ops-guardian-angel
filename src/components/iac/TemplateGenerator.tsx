
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Download, 
  Copy, 
  Settings, 
  Cloud,
  Database,
  Server,
  Network
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TemplateGenerator: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState('aws');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [generatedTemplate, setGeneratedTemplate] = useState('');
  const [templateName, setTemplateName] = useState('');
  const { toast } = useToast();

  const templates = {
    aws: [
      { id: 'ec2-basic', name: 'Basic EC2 Instance', description: 'Simple EC2 with security group' },
      { id: 'vpc-complete', name: 'Complete VPC Setup', description: 'VPC with subnets, IGW, and route tables' },
      { id: 'rds-mysql', name: 'RDS MySQL Database', description: 'MySQL RDS instance with backup' },
      { id: 's3-static', name: 'S3 Static Website', description: 'S3 bucket configured for static hosting' }
    ],
    azure: [
      { id: 'vm-basic', name: 'Basic Virtual Machine', description: 'VM with network security group' },
      { id: 'vnet-complete', name: 'Complete Virtual Network', description: 'VNet with subnets and NSGs' },
      { id: 'sql-database', name: 'SQL Database', description: 'Azure SQL Database with firewall rules' }
    ],
    gcp: [
      { id: 'compute-basic', name: 'Basic Compute Instance', description: 'VM instance with firewall' },
      { id: 'vpc-network', name: 'VPC Network Setup', description: 'Custom VPC with subnets' },
      { id: 'cloud-sql', name: 'Cloud SQL Instance', description: 'MySQL Cloud SQL instance' }
    ]
  };

  const generateTemplate = () => {
    if (!selectedTemplate || !templateName) {
      toast({
        title: 'Missing Information',
        description: 'Please select a template and provide a name',
        variant: 'destructive'
      });
      return;
    }

    const template = templates[selectedProvider as keyof typeof templates]
      .find(t => t.id === selectedTemplate);

    if (!template) return;

    let generated = '';

    if (selectedProvider === 'aws') {
      generated = `# ${template.name} - ${templateName}
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

# ${template.description}
${getTemplateContent(selectedTemplate, selectedProvider)}

output "resource_info" {
  description = "Information about created resources"
  value = {
    environment = var.environment
    region      = var.aws_region
  }
}`;
    }

    setGeneratedTemplate(generated);
    
    toast({
      title: 'Template Generated',
      description: `${template.name} template has been generated successfully`,
    });
  };

  const getTemplateContent = (templateId: string, provider: string) => {
    const templates: Record<string, string> = {
      'ec2-basic': `
resource "aws_security_group" "main" {
  name_prefix = "\${var.environment}-sg"
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name        = "\${var.environment}-security-group"
    Environment = var.environment
  }
}

resource "aws_instance" "main" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"
  
  vpc_security_group_ids = [aws_security_group.main.id]
  
  tags = {
    Name        = "\${var.environment}-instance"
    Environment = var.environment
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]
  
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }
}`,
      'vpc-complete': `
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name        = "\${var.environment}-vpc"
    Environment = var.environment
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name        = "\${var.environment}-igw"
    Environment = var.environment
  }
}

resource "aws_subnet" "public" {
  count = 2
  
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.\${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name        = "\${var.environment}-public-subnet-\${count.index + 1}"
    Environment = var.environment
    Type        = "Public"
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}`
    };

    return templates[templateId] || '# Template content will be generated here';
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedTemplate);
    toast({
      title: 'Copied',
      description: 'Template copied to clipboard',
    });
  };

  const downloadTemplate = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedTemplate], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${templateName || 'infrastructure'}.tf`;
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
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="provider">Cloud Provider</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
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
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates[selectedProvider as keyof typeof templates]?.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {templates[selectedProvider as keyof typeof templates]
                    ?.find(t => t.id === selectedTemplate)?.description}
                </p>
              </div>
            )}

            <Button onClick={generateTemplate} className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Generate Template
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Template</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={copyToClipboard}
                disabled={!generatedTemplate}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={downloadTemplate}
                disabled={!generatedTemplate}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Generated template will appear here..."
              value={generatedTemplate}
              readOnly
              className="min-h-[400px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col">
              <Server className="h-6 w-6 mb-2" />
              Compute Instance
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Database className="h-6 w-6 mb-2" />
              Database Setup
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Network className="h-6 w-6 mb-2" />
              Network Config
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Cloud className="h-6 w-6 mb-2" />
              Full Stack
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateGenerator;
