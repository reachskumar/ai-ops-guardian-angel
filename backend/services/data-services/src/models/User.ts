import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    title?: string;
    department?: string;
  };
  organization: Schema.Types.ObjectId;
  organizationRole: 'owner' | 'admin' | 'member' | 'viewer';
  preferences: {
    theme: string;
    notifications: boolean;
    dashboard: any;
    timezone: string;
    language: string;
  };
  status: 'active' | 'invited' | 'suspended' | 'deactivated';
  lastLoginAt?: Date;
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  cloudAccounts: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8
  },
  profile: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    avatar: String,
    role: { 
      type: String, 
      enum: ['owner', 'admin', 'member', 'viewer'], 
      default: 'member' 
    },
    title: String,
    department: String
  },
  organization: { 
    type: Schema.Types.ObjectId, 
    ref: 'Organization', 
    required: true 
  },
  organizationRole: { 
    type: String, 
    enum: ['owner', 'admin', 'member', 'viewer'], 
    default: 'member' 
  },
  preferences: {
    theme: { type: String, default: 'light' },
    notifications: { type: Boolean, default: true },
    dashboard: Schema.Types.Mixed,
    timezone: { type: String, default: 'UTC' },
    language: { type: String, default: 'en' }
  },
  status: { 
    type: String, 
    enum: ['active', 'invited', 'suspended', 'deactivated'], 
    default: 'invited' 
  },
  lastLoginAt: Date,
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  cloudAccounts: [{ type: Schema.Types.ObjectId, ref: 'CloudAccount' }]
}, {
  timestamps: true
});

// Indexes for efficient queries (removed email: 1 as it's already unique)
userSchema.index({ organization: 1 });
userSchema.index({ organizationRole: 1 });
userSchema.index({ status: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });

export const User = model<IUser>('User', userSchema); 