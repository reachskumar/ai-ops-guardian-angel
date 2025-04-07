import { supabase } from "@/integrations/supabase/client";
import { mockInsert, mockSelect, mockUpdate, mockDelete } from "./mockDatabaseService";

export type CloudProvider = 'aws' | 'azure' | 'gcp';

export interface CloudAccount {
  id: string;
  name: string;
  provider: CloudProvider;
  status: 'connected' | 'disconnected' | 'error';
  created_at: string;
  last_synced_at?: string;
  error_message?: string;
  metadata?: Record<string, any>;
}

export interface CloudResource {
  id: string;
  cloud_account_id: string;
  resource_id: string;
  name: string;
  type: string;
  region: string;
  status: string;
  created_at: string;
  updated_at: string;
  tags?: Record<string, string>;
  cost_per_day?: number;
  metadata?: Record<string, any>;
}

export interface ResourceMetric {
  name: string;
  data: Array<{
    timestamp: string;
    value: number;
  }>;
  unit: string;
  status?: string;
}

// Connect to cloud providers via Edge Function
export const connectCloudProvider = async (
  provider: CloudProvider,
  credentials: Record<string, string>,
  name: string
): Promise<{ success: boolean; accountId?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('connect-cloud-provider', {
      body: { provider, credentials, name }
    });

    if (error) throw error;
    
    return { 
      success: data.success, 
      accountId: data.accountId,
      error: data.error
    };
  } catch (error: any) {
    console.error(`Connect to ${provider} error:`, error);
    return { success: false, error: error.message || 'Failed to connect cloud provider' };
  }
};

// Get cloud accounts
export const getCloudAccounts = async (): Promise<CloudAccount[]> => {
  try {
    const { data, error } = mockSelect('cloud_accounts');

    if (error) throw error;
    
    return data as CloudAccount[];
  } catch (error) {
    console.error("Get cloud accounts error:", error);
    return [];
  }
};

// Sync cloud resources for an account
export const syncCloudResources = async (
  accountId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('sync-cloud-resources', {
      body: { accountId }
    });

    if (error) throw error;
    
    return { 
      success: data.success, 
      error: data.error
    };
  } catch (error: any) {
    console.error("Sync cloud resources error:", error);
    return { success: false, error: error.message || 'Failed to sync cloud resources' };
  }
};

// Get cloud resources with filtering options
export const getCloudResources = async (
  options?: {
    accountId?: string;
    provider?: CloudProvider;
    type?: string;
    region?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ resources: CloudResource[]; count: number }> => {
  try {
    const { accountId, type, region, status, limit = 100, offset = 0 } = options || {};
    
    let filters: Record<string, any> = {};
    if (accountId) filters.cloud_account_id = accountId;
    if (type) filters.type = type;
    if (region) filters.region = region;
    if (status) filters.status = status;
    
    const { data, count, error } = mockSelect('cloud_resources', filters);
    
    if (error) throw error;
    
    const paginatedData = data.slice(offset, offset + limit);
    
    return {
      resources: paginatedData as CloudResource[],
      count: count
    };
  } catch (error) {
    console.error("Get cloud resources error:", error);
    return { resources: [], count: 0 };
  }
};

// Provision a new cloud resource
export const provisionResource = async (
  accountId: string,
  resourceType: string,
  config: Record<string, any>
): Promise<{ success: boolean; resourceId?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('provision-resource', {
      body: { accountId, resourceType, config }
    });

    if (error) throw error;
    
    return { 
      success: data.success, 
      resourceId: data.resourceId,
      error: data.error
    };
  } catch (error: any) {
    console.error("Provision resource error:", error);
    return { success: false, error: error.message || 'Failed to provision resource' };
  }
};

// Get resource details including metrics
export const getResourceDetails = async (
  resourceId: string
): Promise<{ resource: CloudResource | null; metrics: any[]; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-resource-details', {
      body: { resourceId }
    });

    if (error) throw error;
    
    return { 
      resource: data.resource, 
      metrics: data.metrics
    };
  } catch (error: any) {
    console.error("Get resource details error:", error);
    return { 
      resource: null, 
      metrics: [],
      error: error.message || 'Failed to get resource details' 
    };
  }
};

// Update a cloud resource (e.g., start/stop instance)
export const updateResource = async (
  resourceId: string,
  action: string,
  params?: Record<string, any>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('update-resource', {
      body: { resourceId, action, params }
    });

    if (error) throw error;
    
    return { 
      success: data.success, 
      error: data.error
    };
  } catch (error: any) {
    console.error("Update resource error:", error);
    return { success: false, error: error.message || 'Failed to update resource' };
  }
};

// Delete a cloud resource
export const deleteResource = async (
  resourceId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('delete-resource', {
      body: { resourceId }
    });

    if (error) throw error;
    
    return { 
      success: data.success, 
      error: data.error
    };
  } catch (error: any) {
    console.error("Delete resource error:", error);
    return { success: false, error: error.message || 'Failed to delete resource' };
  }
};

// Get cost analysis for cloud resources
export const getResourceCosts = async (
  filters: {
    accountId?: string;
    resourceIds?: string[];
    startDate: string;
    endDate: string;
    groupBy?: 'day' | 'week' | 'month' | 'service' | 'region';
  }
): Promise<{ costs: any[]; totalCost: number; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-resource-costs', {
      body: filters
    });

    if (error) throw error;
    
    return { 
      costs: data.costs,
      totalCost: data.totalCost
    };
  } catch (error: any) {
    console.error("Get resource costs error:", error);
    return { 
      costs: [], 
      totalCost: 0,
      error: error.message || 'Failed to get resource costs' 
    };
  }
};

// Add a new function to get resource metrics
export const getResourceMetrics = async (
  resourceId: string,
  metricNames: string[] = ['cpu', 'memory', 'network', 'disk'],
  timeRange: string = '1h'
): Promise<ResourceMetric[]> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
  
  const now = new Date();
  const metrics: ResourceMetric[] = [];
  
  for (const metricName of metricNames) {
    const dataPoints = Array.from({ length: 12 }, (_, i) => {
      const timestamp = new Date(now.getTime() - ((11 - i) * 5 * 60 * 1000)); // 5 min intervals
      
      let value = 0;
      switch (metricName) {
        case 'cpu':
          value = Math.floor(Math.random() * 40) + 30; // 30-70%
          break;
        case 'memory':
          value = Math.floor(Math.random() * 30) + 50; // 50-80%
          break;
        case 'network':
          value = Math.floor(Math.random() * 100) + 20; // 20-120 Mbps
          break;
        case 'disk':
          value = Math.floor(Math.random() * 20) + 10; // 10-30 IOPS
          break;
        default:
          value = Math.floor(Math.random() * 100);
      }
      
      return {
        timestamp: timestamp.toISOString(),
        value
      };
    });
    
    const unit = metricName === 'cpu' || metricName === 'memory' ? 
                  '%' : 
                  metricName === 'network' ? 
                  'Mbps' : 'IOPS';
    
    let status = 'normal';
    const latestValue = dataPoints[dataPoints.length - 1].value;
    if (metricName === 'cpu' && latestValue > 80) status = 'warning';
    if (metricName === 'memory' && latestValue > 85) status = 'warning';
    if (metricName === 'disk' && latestValue > 25) status = 'warning';
    
    metrics.push({
      name: metricName.charAt(0).toUpperCase() + metricName.slice(1),
      data: dataPoints,
      unit,
      status
    });
  }
  
  return metrics;
};

// Generate IaC template for existing resources
export const generateIaCTemplate = async (
  templateType: string, // 'terraform', 'cloudformation', 'arm'
  resources?: string[] // Optional array of resource IDs to include
): Promise<{ 
  success: boolean; 
  template?: string; 
  error?: string 
}> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    
    let template = '';
    
    if (templateType === 'terraform') {
      template = `provider "aws" {
  region = "us-west-2"
}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "Main VPC"
    Environment = "Production"
  }
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  map_public_ip_on_launch = true
  tags = {
    Name = "Public Subnet"
  }
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.public.id
  tags = {
    Name = "Web Server"
  }
}`;
    } else if (templateType === 'cloudformation') {
      template = `{
  "AWSTemplateFormatVersion": "2010-09-09",
  "Resources": {
    "MainVPC": {
      "Type": "AWS::EC2::VPC",
      "Properties": {
        "CidrBlock": "10.0.0.0/16",
        "Tags": [
          {
            "Key": "Name",
            "Value": "Main VPC"
          },
          {
            "Key": "Environment",
            "Value": "Production"
          }
        ]
      }
    },
    "PublicSubnet": {
      "Type": "AWS::EC2::Subnet",
      "Properties": {
        "VpcId": { "Ref": "MainVPC" },
        "CidrBlock": "10.0.1.0/24",
        "MapPublicIpOnLaunch": true,
        "Tags": [
          {
            "Key": "Name",
            "Value": "Public Subnet"
          }
        ]
      }
    },
    "WebServer": {
      "Type": "AWS::EC2::Instance",
      "Properties": {
        "InstanceType": "t2.micro",
        "ImageId": "ami-0c55b159cbfafe1f0",
        "SubnetId": { "Ref": "PublicSubnet" },
        "Tags": [
          {
            "Key": "Name",
            "Value": "Web Server"
          }
        ]
      }
    }
  }
}`;
    } else if (templateType === 'arm') {
      template = `{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "resources": [
    {
      "type": "Microsoft.Network/virtualNetworks",
      "apiVersion": "2020-05-01",
      "name": "MainVNet",
      "location": "[resourceGroup().location]",
      "properties": {
        "addressSpace": {
          "addressPrefixes": [
            "10.0.0.0/16"
          ]
        },
        "subnets": [
          {
            "name": "default",
            "properties": {
              "addressPrefix": "10.0.0.0/24"
            }
          }
        ]
      },
      "tags": {
        "displayName": "Main Virtual Network",
        "Environment": "Production"
      }
    },
    {
      "type": "Microsoft.Compute/virtualMachines",
      "apiVersion": "2019-07-01",
      "name": "WebServer",
      "location": "[resourceGroup().location]",
      "dependsOn": [
        "[resourceId('Microsoft.Network/virtualNetworks', 'MainVNet')]"
      ],
      "properties": {
        "hardwareProfile": {
          "vmSize": "Standard_B1s"
        },
        "storageProfile": {
          "imageReference": {
            "publisher": "Canonical",
            "offer": "UbuntuServer",
            "sku": "18.04-LTS",
            "version": "latest"
          }
        },
        "networkProfile": {
          "networkInterfaces": [
            {
              "id": "[resourceId('Microsoft.Network/networkInterfaces', 'nic1')]"
            }
          ]
        }
      },
      "tags": {
        "displayName": "Web Server VM"
      }
    }
  ]
}`;
    } else {
      throw new Error(`Unsupported template type: ${templateType}`);
    }
    
    return {
      success: true,
      template
    };
  } catch (error: any) {
    console.error(`Generate ${templateType} template error:`, error);
    return { 
      success: false, 
      error: error.message || `Failed to generate ${templateType} template` 
    };
  }
};

// Apply IaC template to provision or update resources
export const applyIaCTemplate = async (
  templateType: string, // 'terraform', 'cloudformation', 'arm'
  templateContent: string
): Promise<{ 
  success: boolean; 
  resources?: string[]; // IDs of created/updated resources
  error?: string 
}> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate API delay
    
    if (templateContent.trim() === '') {
      throw new Error('Template cannot be empty');
    }
    
    const mockResourceIds = [
      `resource-${Math.random().toString(36).substring(2, 10)}`,
      `resource-${Math.random().toString(36).substring(2, 10)}`,
      `resource-${Math.random().toString(36).substring(2, 10)}`
    ];
    
    if (Math.random() < 0.1) {
      throw new Error(`Failed to apply ${templateType} template: Syntax error on line 15`);
    }
    
    return {
      success: true,
      resources: mockResourceIds
    };
  } catch (error: any) {
    console.error(`Apply ${templateType} template error:`, error);
    return { 
      success: false, 
      error: error.message || `Failed to apply ${templateType} template` 
    };
  }
};
