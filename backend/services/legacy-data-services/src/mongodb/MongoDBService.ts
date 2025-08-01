import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { logger } from '../utils/logger';

export interface MongoDBConfig {
  uri: string;
  database: string;
  options?: {
    maxPoolSize?: number;
    minPoolSize?: number;
    maxIdleTimeMS?: number;
    serverSelectionTimeoutMS?: number;
  };
}

export class MongoDBService {
  private client: MongoClient;
  private db: Db;
  private isConnected: boolean = false;

  constructor(private config: MongoDBConfig) {
    this.client = new MongoClient(config.uri, {
      maxPoolSize: config.options?.maxPoolSize || 100,
      minPoolSize: config.options?.minPoolSize || 5,
      maxIdleTimeMS: config.options?.maxIdleTimeMS || 30000,
      serverSelectionTimeoutMS: config.options?.serverSelectionTimeoutMS || 5000,
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db(this.config.database);
      this.isConnected = true;
      logger.info(`Connected to MongoDB database: ${this.config.database}`);
    } catch (error) {
      logger.error(`Failed to connect to MongoDB: ${error}`);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.close();
      this.isConnected = false;
      logger.info('Disconnected from MongoDB');
    } catch (error) {
      logger.error(`Error disconnecting from MongoDB: ${error}`);
      throw error;
    }
  }

  getCollection(name: string): Collection {
    if (!this.isConnected) {
      throw new Error('MongoDB connection not established');
    }
    return this.db.collection(name);
  }

  // User Management
  async createUser(userData: {
    email: string;
    profile: {
      fullName: string;
      role: string;
      permissions: string[];
      preferences: any;
    };
    auth: {
      hashedPassword: string;
      mfaEnabled: boolean;
    };
    organizations: ObjectId[];
  }) {
    const users = this.getCollection('users');
    const result = await users.insertOne({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return result;
  }

  async findUser(query: any) {
    const users = this.getCollection('users');
    return await users.findOne(query);
  }

  async updateUser(userId: ObjectId, updateData: any) {
    const users = this.getCollection('users');
    return await users.updateOne(
      { _id: userId },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date() 
        }
      }
    );
  }

  // Cloud Accounts Management
  async createCloudAccount(accountData: {
    userId: ObjectId;
    organizationId: ObjectId;
    provider: string;
    accountName: string;
    accountIdentifier: string;
    status: string;
    credentials: {
      encryptedData: string;
      keyId: string;
    };
    connectionDetails: any;
    regions: string[];
  }) {
    const accounts = this.getCollection('cloudAccounts');
    const result = await accounts.insertOne({
      ...accountData,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSync: null
    });
    return result;
  }

  async findCloudAccounts(query: any, options?: {
    limit?: number;
    skip?: number;
    sort?: any;
  }) {
    const accounts = this.getCollection('cloudAccounts');
    let cursor = accounts.find(query);
    
    if (options?.sort) cursor = cursor.sort(options.sort);
    if (options?.skip) cursor = cursor.skip(options.skip);
    if (options?.limit) cursor = cursor.limit(options.limit);
    
    return await cursor.toArray();
  }

  async updateCloudAccount(accountId: ObjectId, updateData: any) {
    const accounts = this.getCollection('cloudAccounts');
    return await accounts.updateOne(
      { _id: accountId },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date() 
        }
      }
    );
  }

  // Cloud Resources Management
  async createCloudResource(resourceData: {
    accountId: ObjectId;
    resourceId: string;
    name: string;
    type: string;
    subtype: string;
    provider: string;
    region: string;
    status: string;
    details: any;
    tags: any;
    costs: {
      monthly: number;
      hourly: number;
      currency: string;
    };
  }) {
    const resources = this.getCollection('cloudResources');
    const result = await resources.insertOne({
      ...resourceData,
      metrics: [],
      createdAt: new Date(),
      lastUpdated: new Date()
    });
    return result;
  }

  async findCloudResources(query: any, options?: {
    limit?: number;
    skip?: number;
    sort?: any;
    projection?: any;
  }) {
    const resources = this.getCollection('cloudResources');
    let cursor = resources.find(query, { projection: options?.projection });
    
    if (options?.sort) cursor = cursor.sort(options.sort);
    if (options?.skip) cursor = cursor.skip(options.skip);
    if (options?.limit) cursor = cursor.limit(options.limit);
    
    return await cursor.toArray();
  }

  async updateCloudResource(resourceId: ObjectId, updateData: any) {
    const resources = this.getCollection('cloudResources');
    return await resources.updateOne(
      { _id: resourceId },
      { 
        $set: { 
          ...updateData, 
          lastUpdated: new Date() 
        }
      }
    );
  }

  async bulkUpdateCloudResources(operations: any[]) {
    const resources = this.getCollection('cloudResources');
    return await resources.bulkWrite(operations);
  }

  // Add metrics to cloud resource (time-series data)
  async addResourceMetrics(resourceId: ObjectId, metrics: {
    timestamp: Date;
    cpu?: number;
    memory?: number;
    network?: any;
    custom?: any;
  }) {
    const resources = this.getCollection('cloudResources');
    return await resources.updateOne(
      { _id: resourceId },
      { 
        $push: { metrics: metrics },
        $set: { lastUpdated: new Date() }
      }
    );
  }

  // AI Conversations Management
  async createAIConversation(conversationData: {
    userId: ObjectId;
    sessionId: string;
    agentType: string;
    messages: Array<{
      role: string;
      content: string;
      timestamp: Date;
      metadata?: any;
    }>;
    context: {
      resources: ObjectId[];
      topics: string[];
      actions: any[];
    };
  }) {
    const conversations = this.getCollection('aiConversations');
    const result = await conversations.insertOne({
      ...conversationData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return result;
  }

  async findAIConversations(query: any, options?: {
    limit?: number;
    skip?: number;
    sort?: any;
  }) {
    const conversations = this.getCollection('aiConversations');
    let cursor = conversations.find(query);
    
    if (options?.sort) cursor = cursor.sort(options.sort);
    if (options?.skip) cursor = cursor.skip(options.skip);
    if (options?.limit) cursor = cursor.limit(options.limit);
    
    return await cursor.toArray();
  }

  async addMessageToConversation(conversationId: ObjectId, message: {
    role: string;
    content: string;
    timestamp: Date;
    metadata?: any;
  }) {
    const conversations = this.getCollection('aiConversations');
    return await conversations.updateOne(
      { _id: conversationId },
      { 
        $push: { messages: message },
        $set: { updatedAt: new Date() }
      }
    );
  }

  // Cost Optimizations Management
  async createCostOptimization(optimizationData: {
    userId: ObjectId;
    accountId: ObjectId;
    resourceId?: ObjectId;
    type: string;
    title: string;
    description: string;
    currentCost: number;
    optimizedCost: number;
    monthlySavings: number;
    confidence: string;
    effort: string;
    status: string;
    aiGenerated: boolean;
    agentId?: string;
    details: any;
  }) {
    const optimizations = this.getCollection('costOptimizations');
    const result = await optimizations.insertOne({
      ...optimizationData,
      createdAt: new Date(),
      appliedAt: null
    });
    return result;
  }

  async findCostOptimizations(query: any, options?: {
    limit?: number;
    skip?: number;
    sort?: any;
  }) {
    const optimizations = this.getCollection('costOptimizations');
    let cursor = optimizations.find(query);
    
    if (options?.sort) cursor = cursor.sort(options.sort);
    if (options?.skip) cursor = cursor.skip(options.skip);
    if (options?.limit) cursor = cursor.limit(options.limit);
    
    return await cursor.toArray();
  }

  async updateCostOptimization(optimizationId: ObjectId, updateData: any) {
    const optimizations = this.getCollection('costOptimizations');
    return await optimizations.updateOne(
      { _id: optimizationId },
      { $set: updateData }
    );
  }

  // Aggregation Queries
  async getCostSummaryByUser(userId: ObjectId, timeRange: {
    start: Date;
    end: Date;
  }) {
    const resources = this.getCollection('cloudResources');
    return await resources.aggregate([
      {
        $lookup: {
          from: 'cloudAccounts',
          localField: 'accountId',
          foreignField: '_id',
          as: 'account'
        }
      },
      {
        $match: {
          'account.userId': userId,
          lastUpdated: { $gte: timeRange.start, $lte: timeRange.end }
        }
      },
      {
        $group: {
          _id: '$provider',
          totalMonthlyCost: { $sum: '$costs.monthly' },
          resourceCount: { $sum: 1 },
          avgCostPerResource: { $avg: '$costs.monthly' }
        }
      }
    ]).toArray();
  }

  async getResourceMetricsSummary(resourceId: ObjectId, timeRange: {
    start: Date;
    end: Date;
  }) {
    const resources = this.getCollection('cloudResources');
    return await resources.aggregate([
      { $match: { _id: resourceId } },
      { $unwind: '$metrics' },
      {
        $match: {
          'metrics.timestamp': { $gte: timeRange.start, $lte: timeRange.end }
        }
      },
      {
        $group: {
          _id: null,
          avgCpu: { $avg: '$metrics.cpu' },
          maxCpu: { $max: '$metrics.cpu' },
          avgMemory: { $avg: '$metrics.memory' },
          maxMemory: { $max: '$metrics.memory' },
          dataPoints: { $sum: 1 }
        }
      }
    ]).toArray();
  }

  // Index Management
  async createIndexes() {
    try {
      // Users indexes
      await this.getCollection('users').createIndex({ email: 1 }, { unique: true });
      await this.getCollection('users').createIndex({ 'organizations': 1 });

      // Cloud Accounts indexes
      await this.getCollection('cloudAccounts').createIndex({ userId: 1, provider: 1 });
      await this.getCollection('cloudAccounts').createIndex({ status: 1 });
      await this.getCollection('cloudAccounts').createIndex({ lastSync: -1 });

      // Cloud Resources indexes
      await this.getCollection('cloudResources').createIndex({ 
        accountId: 1, 
        type: 1, 
        lastUpdated: -1 
      });
      await this.getCollection('cloudResources').createIndex({ provider: 1, region: 1 });
      await this.getCollection('cloudResources').createIndex({ 'costs.monthly': -1 });
      await this.getCollection('cloudResources').createIndex({ tags: 1 });

      // AI Conversations indexes
      await this.getCollection('aiConversations').createIndex({ 
        userId: 1, 
        createdAt: -1 
      });
      await this.getCollection('aiConversations').createIndex({ sessionId: 1 });

      // Cost Optimizations indexes
      await this.getCollection('costOptimizations').createIndex({ 
        userId: 1, 
        status: 1, 
        monthlySavings: -1 
      });
      await this.getCollection('costOptimizations').createIndex({ 
        accountId: 1, 
        createdAt: -1 
      });

      logger.info('MongoDB indexes created successfully');
    } catch (error) {
      logger.error(`Error creating indexes: ${error}`);
      throw error;
    }
  }

  // Health Check
  async ping(): Promise<boolean> {
    try {
      await this.db.admin().ping();
      return true;
    } catch (error) {
      logger.error(`MongoDB ping failed: ${error}`);
      return false;
    }
  }
} 