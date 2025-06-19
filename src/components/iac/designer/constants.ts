
import { 
  Server, 
  Database, 
  Network, 
  Cloud, 
  Shield, 
  HardDrive
} from 'lucide-react';
import { ResourceType } from './types';

export const resourceTypes: ResourceType[] = [
  { type: 'ec2', label: 'EC2 Instance', icon: Server, color: 'bg-orange-100 text-orange-800' },
  { type: 'rds', label: 'RDS Database', icon: Database, color: 'bg-blue-100 text-blue-800' },
  { type: 'vpc', label: 'VPC Network', icon: Network, color: 'bg-green-100 text-green-800' },
  { type: 's3', label: 'S3 Bucket', icon: Cloud, color: 'bg-purple-100 text-purple-800' },
  { type: 'sg', label: 'Security Group', icon: Shield, color: 'bg-red-100 text-red-800' },
  { type: 'ebs', label: 'EBS Volume', icon: HardDrive, color: 'bg-gray-100 text-gray-800' }
];
