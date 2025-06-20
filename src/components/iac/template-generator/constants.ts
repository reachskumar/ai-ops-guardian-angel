
import { TemplatesByProvider } from './types';

export const templates: TemplatesByProvider = {
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
