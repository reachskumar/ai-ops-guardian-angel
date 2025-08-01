/**
 * Real Cloud Integration Service - Production-ready multi-cloud management
 * Connects to actual AWS, Azure, and GCP APIs for resource management
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from 'redis';

// Cloud provider SDKs
import AWS from 'aws-sdk';
import { DefaultAzureCredential, ClientSecretCredential } from '@azure/identity';
import { ResourceManagementClient } from '@azure/arm-resources';
import { ComputeManagementClient } from '@azure/arm-compute';
import { StorageManagementClient } from '@azure/arm-storage';
import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

const app = express();
const PORT = process.env.PORT || 8002;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Redis client for caching
const redis = createClient({
  url: process.env.REDIS_URI || 'redis://localhost:6379'
});

interface CloudAccount {
  id: string;
  provider: 'aws' | 'azure' | 'gcp';
  name: string;
  credentials: any;
  regions: string[];
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
}

interface CloudResource {
  id: string;
  name: string;
  type: string;
  provider: string;
  region: string;
  status: string;
  cost?: number;
  tags?: Record<string, string>;
  metadata?: any;
}

// In-memory storage for demo (in production, use database)
const cloudAccounts: Map<string, CloudAccount> = new Map();
const cloudResources: Map<string, CloudResource[]> = new Map();

class MultiCloudManager {
  
  // AWS Integration
  async connectAWS(credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    accountName: string;
  }): Promise<{ success: boolean; accountId?: string; error?: string }> {
    try {
      // Configure AWS SDK
      AWS.config.update({
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        region: credentials.region
      });

      // Test connection
      const sts = new AWS.STS();
      const identity = await sts.getCallerIdentity().promise();
      
      const accountId = `aws-${identity.Account}`;
      const account: CloudAccount = {
        id: accountId,
        provider: 'aws',
        name: credentials.accountName,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          region: credentials.region
        },
        regions: ['us-east-1', 'us-west-2', 'eu-west-1'],
        status: 'connected',
        lastSync: new Date()
      };

      cloudAccounts.set(accountId, account);
      
      // Sync resources
      await this.syncAWSResources(accountId);
      
      return { success: true, accountId };
      
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async syncAWSResources(accountId: string): Promise<CloudResource[]> {
    const account = cloudAccounts.get(accountId);
    if (!account || account.provider !== 'aws') {
      throw new Error('AWS account not found');
    }

    const resources: CloudResource[] = [];

    try {
      // Configure AWS with account credentials
      AWS.config.update(account.credentials);

      // Get EC2 instances
      const ec2 = new AWS.EC2();
      const instances = await ec2.describeInstances().promise();
      
      for (const reservation of instances.Reservations || []) {
        for (const instance of reservation.Instances || []) {
          resources.push({
            id: instance.InstanceId || '',
            name: this.getAWSTagValue(instance.Tags, 'Name') || instance.InstanceId || '',
            type: 'ec2',
            provider: 'aws',
            region: account.credentials.region,
            status: instance.State?.Name || 'unknown',
            metadata: {
              instanceType: instance.InstanceType,
              launchTime: instance.LaunchTime,
              publicIp: instance.PublicIpAddress,
              privateIp: instance.PrivateIpAddress,
              vpcId: instance.VpcId,
              subnetId: instance.SubnetId
            },
            tags: this.convertAWSTags(instance.Tags)
          });
        }
      }

      // Get EBS volumes
      const volumes = await ec2.describeVolumes().promise();
      for (const volume of volumes.Volumes || []) {
        resources.push({
          id: volume.VolumeId || '',
          name: this.getAWSTagValue(volume.Tags, 'Name') || volume.VolumeId || '',
          type: 'ebs',
          provider: 'aws',
          region: account.credentials.region,
          status: volume.State || 'unknown',
          metadata: {
            size: volume.Size,
            volumeType: volume.VolumeType,
            encrypted: volume.Encrypted,
            attachments: volume.Attachments
          },
          tags: this.convertAWSTags(volume.Tags)
        });
      }

      // Get S3 buckets
      const s3 = new AWS.S3();
      const buckets = await s3.listBuckets().promise();
      for (const bucket of buckets.Buckets || []) {
        resources.push({
          id: bucket.Name || '',
          name: bucket.Name || '',
          type: 's3',
          provider: 'aws',
          region: account.credentials.region,
          status: 'available',
          metadata: {
            creationDate: bucket.CreationDate
          }
        });
      }

      // Get RDS instances
      const rds = new AWS.RDS();
      const databases = await rds.describeDBInstances().promise();
      for (const db of databases.DBInstances || []) {
        resources.push({
          id: db.DBInstanceIdentifier || '',
          name: db.DBInstanceIdentifier || '',
          type: 'rds',
          provider: 'aws',
          region: account.credentials.region,
          status: db.DBInstanceStatus || 'unknown',
          metadata: {
            engine: db.Engine,
            instanceClass: db.DBInstanceClass,
            allocatedStorage: db.AllocatedStorage,
            endpoint: db.Endpoint?.Address,
            port: db.Endpoint?.Port
          }
        });
      }

      cloudResources.set(accountId, resources);
      account.lastSync = new Date();

      return resources;

    } catch (error) {
      console.error('Failed to sync AWS resources:', error);
      throw error;
    }
  }

  // Azure Integration
  async connectAzure(credentials: {
    clientId: string;
    clientSecret: string;
    tenantId: string;
    subscriptionId: string;
    accountName: string;
  }): Promise<{ success: boolean; accountId?: string; error?: string }> {
    try {
      // Create Azure credential
      const credential = new ClientSecretCredential(
        credentials.tenantId,
        credentials.clientId,
        credentials.clientSecret
      );

      // Test connection
      const resourceClient = new ResourceManagementClient(credential, credentials.subscriptionId);
      await resourceClient.resourceGroups.list().next();

      const accountId = `azure-${credentials.subscriptionId}`;
      const account: CloudAccount = {
        id: accountId,
        provider: 'azure',
        name: credentials.accountName,
        credentials: credentials,
        regions: ['eastus', 'westus2', 'westeurope'],
        status: 'connected',
        lastSync: new Date()
      };

      cloudAccounts.set(accountId, account);
      
      // Sync resources
      await this.syncAzureResources(accountId);
      
      return { success: true, accountId };
      
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async syncAzureResources(accountId: string): Promise<CloudResource[]> {
    const account = cloudAccounts.get(accountId);
    if (!account || account.provider !== 'azure') {
      throw new Error('Azure account not found');
    }

    const resources: CloudResource[] = [];

    try {
      const credential = new ClientSecretCredential(
        account.credentials.tenantId,
        account.credentials.clientId,
        account.credentials.clientSecret
      );

      // Get compute resources
      const computeClient = new ComputeManagementClient(credential, account.credentials.subscriptionId);
      const vms = computeClient.virtualMachines.listAll();

      for await (const vm of vms) {
        resources.push({
          id: vm.id || '',
          name: vm.name || '',
          type: 'vm',
          provider: 'azure',
          region: vm.location || '',
          status: vm.provisioningState || 'unknown',
          metadata: {
            vmSize: vm.hardwareProfile?.vmSize,
            osType: vm.storageProfile?.osDisk?.osType,
            resourceGroup: this.extractResourceGroup(vm.id)
          },
          tags: vm.tags
        });
      }

      // Get storage accounts
      const storageClient = new StorageManagementClient(credential, account.credentials.subscriptionId);
      const storageAccounts = storageClient.storageAccounts.list();

      for await (const storage of storageAccounts) {
        resources.push({
          id: storage.id || '',
          name: storage.name || '',
          type: 'storage',
          provider: 'azure',
          region: storage.location || '',
          status: storage.provisioningState || 'unknown',
          metadata: {
            kind: storage.kind,
            tier: storage.sku?.tier,
            resourceGroup: this.extractResourceGroup(storage.id)
          },
          tags: storage.tags
        });
      }

      cloudResources.set(accountId, resources);
      account.lastSync = new Date();

      return resources;

    } catch (error) {
      console.error('Failed to sync Azure resources:', error);
      throw error;
    }
  }

  // GCP Integration
  async connectGCP(credentials: {
    projectId: string;
    keyFile: string; // Service account key JSON
    accountName: string;
  }): Promise<{ success: boolean; accountId?: string; error?: string }> {
    try {
      // Parse service account key
      const serviceAccountKey = JSON.parse(credentials.keyFile);
      
      // Create auth client
      const auth = new GoogleAuth({
        credentials: serviceAccountKey,
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });

      // Test connection
      const compute = google.compute({ version: 'v1', auth });
      await compute.zones.list({ project: credentials.projectId });

      const accountId = `gcp-${credentials.projectId}`;
      const account: CloudAccount = {
        id: accountId,
        provider: 'gcp',
        name: credentials.accountName,
        credentials: {
          projectId: credentials.projectId,
          keyFile: serviceAccountKey
        },
        regions: ['us-central1', 'europe-west1', 'asia-southeast1'],
        status: 'connected',
        lastSync: new Date()
      };

      cloudAccounts.set(accountId, account);
      
      // Sync resources
      await this.syncGCPResources(accountId);
      
      return { success: true, accountId };
      
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async syncGCPResources(accountId: string): Promise<CloudResource[]> {
    const account = cloudAccounts.get(accountId);
    if (!account || account.provider !== 'gcp') {
      throw new Error('GCP account not found');
    }

    const resources: CloudResource[] = [];

    try {
      const auth = new GoogleAuth({
        credentials: account.credentials.keyFile,
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });

      // Get compute instances
      const compute = google.compute({ version: 'v1', auth });
      const zones = await compute.zones.list({ project: account.credentials.projectId });

      for (const zone of zones.data.items || []) {
        const instances = await compute.instances.list({
          project: account.credentials.projectId,
          zone: zone.name || ''
        });

        for (const instance of instances.data.items || []) {
          resources.push({
            id: instance.id || '',
            name: instance.name || '',
            type: 'compute',
            provider: 'gcp',
            region: zone.name || '',
            status: instance.status || 'unknown',
            metadata: {
              machineType: instance.machineType?.split('/').pop(),
              zone: zone.name,
              networkInterfaces: instance.networkInterfaces
            },
            tags: instance.labels
          });
        }
      }

      // Get storage buckets
      const storage = google.storage({ version: 'v1', auth });
      const buckets = await storage.buckets.list({ project: account.credentials.projectId });

      for (const bucket of buckets.data.items || []) {
        resources.push({
          id: bucket.id || '',
          name: bucket.name || '',
          type: 'storage',
          provider: 'gcp',
          region: bucket.location || '',
          status: 'available',
          metadata: {
            storageClass: bucket.storageClass,
            created: bucket.timeCreated
          },
          tags: bucket.labels
        });
      }

      cloudResources.set(accountId, resources);
      account.lastSync = new Date();

      return resources;

    } catch (error) {
      console.error('Failed to sync GCP resources:', error);
      throw error;
    }
  }

  // Resource Management
  async manageResource(accountId: string, resourceId: string, action: string): Promise<any> {
    const account = cloudAccounts.get(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    const resources = cloudResources.get(accountId) || [];
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) {
      throw new Error('Resource not found');
    }

    switch (account.provider) {
      case 'aws':
        return await this.manageAWSResource(account, resource, action);
      case 'azure':
        return await this.manageAzureResource(account, resource, action);
      case 'gcp':
        return await this.manageGCPResource(account, resource, action);
      default:
        throw new Error('Unsupported provider');
    }
  }

  private async manageAWSResource(account: CloudAccount, resource: CloudResource, action: string): Promise<any> {
    AWS.config.update(account.credentials);
    const ec2 = new AWS.EC2();

    switch (action) {
      case 'start':
        if (resource.type === 'ec2') {
          return await ec2.startInstances({ InstanceIds: [resource.id] }).promise();
        }
        break;
      case 'stop':
        if (resource.type === 'ec2') {
          return await ec2.stopInstances({ InstanceIds: [resource.id] }).promise();
        }
        break;
      case 'restart':
        if (resource.type === 'ec2') {
          return await ec2.rebootInstances({ InstanceIds: [resource.id] }).promise();
        }
        break;
      case 'terminate':
        if (resource.type === 'ec2') {
          return await ec2.terminateInstances({ InstanceIds: [resource.id] }).promise();
        }
        break;
    }
    throw new Error(`Action ${action} not supported for ${resource.type}`);
  }

  private async manageAzureResource(account: CloudAccount, resource: CloudResource, action: string): Promise<any> {
    const credential = new ClientSecretCredential(
      account.credentials.tenantId,
      account.credentials.clientId,
      account.credentials.clientSecret
    );
    const computeClient = new ComputeManagementClient(credential, account.credentials.subscriptionId);

    const resourceGroup = this.extractResourceGroup(resource.id);
    
    switch (action) {
      case 'start':
        if (resource.type === 'vm') {
          return await computeClient.virtualMachines.beginStart(resourceGroup, resource.name);
        }
        break;
      case 'stop':
        if (resource.type === 'vm') {
          return await computeClient.virtualMachines.beginPowerOff(resourceGroup, resource.name);
        }
        break;
      case 'restart':
        if (resource.type === 'vm') {
          return await computeClient.virtualMachines.beginRestart(resourceGroup, resource.name);
        }
        break;
    }
    throw new Error(`Action ${action} not supported for ${resource.type}`);
  }

  private async manageGCPResource(account: CloudAccount, resource: CloudResource, action: string): Promise<any> {
    const auth = new GoogleAuth({
      credentials: account.credentials.keyFile,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    const compute = google.compute({ version: 'v1', auth });

    switch (action) {
      case 'start':
        if (resource.type === 'compute') {
          return await compute.instances.start({
            project: account.credentials.projectId,
            zone: resource.region,
            instance: resource.name
          });
        }
        break;
      case 'stop':
        if (resource.type === 'compute') {
          return await compute.instances.stop({
            project: account.credentials.projectId,
            zone: resource.region,
            instance: resource.name
          });
        }
        break;
    }
    throw new Error(`Action ${action} not supported for ${resource.type}`);
  }

  // Utility methods
  private getAWSTagValue(tags: any[] | undefined, key: string): string | undefined {
    if (!tags) return undefined;
    const tag = tags.find(t => t.Key === key);
    return tag ? tag.Value : undefined;
  }

  private convertAWSTags(tags: any[] | undefined): Record<string, string> {
    if (!tags) return {};
    const result: Record<string, string> = {};
    tags.forEach(tag => {
      if (tag.Key && tag.Value) {
        result[tag.Key] = tag.Value;
      }
    });
    return result;
  }

  private extractResourceGroup(resourceId: string | undefined): string {
    if (!resourceId) return '';
    const parts = resourceId.split('/');
    const rgIndex = parts.indexOf('resourceGroups');
    return rgIndex !== -1 && rgIndex + 1 < parts.length ? parts[rgIndex + 1] : '';
  }
}

const cloudManager = new MultiCloudManager();

// API Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'inframind-cloud-integrations',
    version: '2.0.0'
  });
});

app.get('/providers', (req, res) => {
  const providers = Array.from(cloudAccounts.values()).reduce((acc, account) => {
    const existing = acc.find(p => p.id === account.provider);
    if (existing) {
      existing.accounts.push({
        id: account.id,
        name: account.name,
        status: account.status,
        lastSync: account.lastSync
      });
    } else {
      acc.push({
        id: account.provider,
        name: account.provider.toUpperCase(),
        status: account.status,
        regions: account.regions,
        accounts: [{
          id: account.id,
          name: account.name,
          status: account.status,
          lastSync: account.lastSync
        }]
      });
    }
    return acc;
  }, [] as any[]);

  res.json({ providers });
});

app.post('/connect/:provider', async (req, res) => {
  const { provider } = req.params;
  const credentials = req.body;

  try {
    let result;
    switch (provider) {
      case 'aws':
        result = await cloudManager.connectAWS(credentials);
        break;
      case 'azure':
        result = await cloudManager.connectAzure(credentials);
        break;
      case 'gcp':
        result = await cloudManager.connectGCP(credentials);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported provider' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/resources/:accountId', async (req, res) => {
  const { accountId } = req.params;
  
  try {
    const resources = cloudResources.get(accountId) || [];
    res.json({
      accountId,
      resources,
      total: resources.length,
      lastSync: cloudAccounts.get(accountId)?.lastSync
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/sync/:accountId', async (req, res) => {
  const { accountId } = req.params;
  
  try {
    const account = cloudAccounts.get(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    let resources;
    switch (account.provider) {
      case 'aws':
        resources = await cloudManager.syncAWSResources(accountId);
        break;
      case 'azure':
        resources = await cloudManager.syncAzureResources(accountId);
        break;
      case 'gcp':
        resources = await cloudManager.syncGCPResources(accountId);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported provider' });
    }

    res.json({
      success: true,
      resourceCount: resources.length,
      lastSync: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/manage/:accountId/:resourceId', async (req, res) => {
  const { accountId, resourceId } = req.params;
  const { action } = req.body;

  try {
    const result = await cloudManager.manageResource(accountId, resourceId, action);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`☁️ InfraMind Cloud Integrations running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log('🌩️ Multi-cloud management ready!');
}); 