import { Schema, model, Document } from 'mongoose';

export interface ICloudAccount extends Document {
  name: string;
  provider: 'aws' | 'azure' | 'gcp' | 'digitalocean' | 'linode';
  accountId: string;
  credentials: {
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
    subscriptionId?: string;
    tenantId?: string;
    clientId?: string;
    clientSecret?: string;
    projectId?: string;
    serviceAccountKey?: string;
  };
  status: 'active' | 'inactive' | 'error';
  lastSyncAt?: Date;
  organization: Schema.Types.ObjectId;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const cloudAccountSchema = new Schema<ICloudAccount>({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  provider: { 
    type: String, 
    enum: ['aws', 'azure', 'gcp', 'digitalocean', 'linode'], 
    required: true 
  },
  accountId: { 
    type: String, 
    required: true 
  },
  credentials: {
    accessKeyId: String,
    secretAccessKey: String,
    region: String,
    subscriptionId: String,
    tenantId: String,
    clientId: String,
    clientSecret: String,
    projectId: String,
    serviceAccountKey: String
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'error'], 
    default: 'inactive' 
  },
  lastSyncAt: Date,
  organization: { 
    type: Schema.Types.ObjectId, 
    ref: 'Organization', 
    required: true 
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, {
  timestamps: true
});

// Indexes
cloudAccountSchema.index({ organization: 1 });
cloudAccountSchema.index({ provider: 1 });
cloudAccountSchema.index({ status: 1 });
cloudAccountSchema.index({ createdBy: 1 });

export const CloudAccount = model<ICloudAccount>('CloudAccount', cloudAccountSchema); 