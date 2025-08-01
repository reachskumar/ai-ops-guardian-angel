import { Schema, model, Document } from 'mongoose';

export interface ICloudResource extends Document {
  resourceId: string;
  provider: 'aws' | 'azure' | 'gcp';
  resourceType: string;
  name: string;
  region: string;
  status: 'running' | 'stopped' | 'terminated' | 'pending';
  configuration: any;
  costs: Array<{
    date: Date;
    amount: number;
    currency: string;
  }>;
  metrics: Array<{
    timestamp: Date;
    cpu: number;
    memory: number;
    network: number;
    storage: number;
  }>;
  tags: Map<string, string>;
  accountId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const cloudResourceSchema = new Schema<ICloudResource>({
  resourceId: { type: String, required: true },
  provider: { type: String, enum: ['aws', 'azure', 'gcp'], required: true },
  resourceType: { type: String, required: true },
  name: { type: String, required: true },
  region: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['running', 'stopped', 'terminated', 'pending'], 
    default: 'pending' 
  },
  configuration: Schema.Types.Mixed,
  costs: [{
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  }],
  metrics: [{
    timestamp: { type: Date, required: true },
    cpu: Number,
    memory: Number,
    network: Number,
    storage: Number
  }],
  tags: { type: Map, of: String },
  accountId: { type: Schema.Types.ObjectId, ref: 'CloudAccount', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

// Indexes for efficient queries
cloudResourceSchema.index({ provider: 1, resourceType: 1, userId: 1 });
cloudResourceSchema.index({ accountId: 1, status: 1 });
cloudResourceSchema.index({ 'costs.date': 1 });
cloudResourceSchema.index({ 'metrics.timestamp': 1 });

export const CloudResource = model<ICloudResource>('CloudResource', cloudResourceSchema); 