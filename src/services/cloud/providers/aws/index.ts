
export * from './resourceService';

// AWS-specific functions for provider factory
export const getAwsResourceTypes = () => [
  'EC2 Instance',
  'RDS MySQL',
  'S3 Bucket',
  'Lambda Function'
];

export const getAwsInstanceSizes = () => [
  { id: 't3.micro', name: 't3.micro', vcpus: 2, memory: 1 },
  { id: 't3.small', name: 't3.small', vcpus: 2, memory: 2 },
  { id: 't3.medium', name: 't3.medium', vcpus: 2, memory: 4 },
  { id: 't3.large', name: 't3.large', vcpus: 2, memory: 8 }
];

export const getAwsRegions = () => [
  { id: 'us-east-1', name: 'US East (N. Virginia)' },
  { id: 'us-west-2', name: 'US West (Oregon)' },
  { id: 'eu-west-1', name: 'Europe (Ireland)' },
  { id: 'ap-southeast-1', name: 'Asia Pacific (Singapore)' }
];
