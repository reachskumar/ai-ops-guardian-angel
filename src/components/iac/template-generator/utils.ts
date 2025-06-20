
export const getTemplateContent = (templateId: string, provider: string): string => {
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

export const generateTerraformTemplate = (templateName: string, templateDescription: string, templateContent: string): string => {
  return `# ${templateDescription} - ${templateName}
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

# ${templateDescription}
${templateContent}

output "resource_info" {
  description = "Information about created resources"
  value = {
    environment = var.environment
    region      = var.aws_region
  }
}`;
};
