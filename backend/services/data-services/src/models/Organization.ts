import { Schema, model, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  slug: string;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  settings: {
    maxUsers: number;
    maxProjects: number;
    maxResources: number;
    features: string[];
    branding: {
      logo?: string;
      primaryColor?: string;
      customDomain?: string;
    };
  };
  billing: {
    stripeCustomerId?: string;
    subscriptionId?: string;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    nextBillingDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  plan: { 
    type: String, 
    enum: ['free', 'starter', 'professional', 'enterprise'], 
    default: 'free' 
  },
  status: { 
    type: String, 
    enum: ['active', 'suspended', 'cancelled'], 
    default: 'active' 
  },
  settings: {
    maxUsers: { type: Number, default: 5 },
    maxProjects: { type: Number, default: 3 },
    maxResources: { type: Number, default: 100 },
    features: [{ type: String }],
    branding: {
      logo: String,
      primaryColor: { type: String, default: '#3B82F6' },
      customDomain: String
    }
  },
  billing: {
    stripeCustomerId: String,
    subscriptionId: String,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    nextBillingDate: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
organizationSchema.index({ slug: 1 });
organizationSchema.index({ status: 1 });
organizationSchema.index({ 'billing.stripeCustomerId': 1 });

export const Organization = model<IOrganization>('Organization', organizationSchema); 