import { Organization, IOrganization } from '../models/Organization';
import { User, IUser } from '../models/User';
import crypto from 'crypto';

export class OrganizationService {
  async createOrganization(orgData: {
    name: string;
    slug: string;
    ownerEmail: string;
    ownerFirstName: string;
    ownerLastName: string;
    plan?: 'free' | 'starter' | 'professional' | 'enterprise';
  }): Promise<{ organization: IOrganization; owner: IUser }> {
    // Check if organization slug already exists
    const existingOrg = await Organization.findOne({ slug: orgData.slug });
    if (existingOrg) {
      throw new Error('Organization slug already exists');
    }

    // Create organization
    const organization = new Organization({
      name: orgData.name,
      slug: orgData.slug,
      plan: orgData.plan || 'free',
      settings: this.getDefaultSettings(orgData.plan || 'free')
    });

    await organization.save();

    // Create organization owner
    const owner = new User({
      email: orgData.ownerEmail,
      password: crypto.randomBytes(32).toString('hex'), // Temporary password
      profile: {
        firstName: orgData.ownerFirstName,
        lastName: orgData.ownerLastName,
        role: 'owner'
      },
      organization: organization._id,
      organizationRole: 'owner',
      status: 'invited',
      emailVerified: false
    });

    await owner.save();

    return { organization, owner };
  }

  async getOrganizationBySlug(slug: string): Promise<IOrganization | null> {
    return await Organization.findOne({ slug, status: 'active' });
  }

  async getOrganizationById(id: string): Promise<IOrganization | null> {
    return await Organization.findById(id);
  }

  async updateOrganization(id: string, updates: Partial<IOrganization>): Promise<IOrganization> {
    const organization = await Organization.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    if (!organization) {
      throw new Error('Organization not found');
    }

    return organization;
  }

  async getOrganizationMembers(organizationId: string): Promise<IUser[]> {
    return await User.find({ 
      organization: organizationId,
      status: { $in: ['active', 'invited'] }
    }).populate('organization');
  }

  async inviteUser(organizationId: string, inviteData: {
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'member' | 'viewer';
  }): Promise<IUser> {
    // Check if user already exists in organization
    const existingUser = await User.findOne({ 
      email: inviteData.email,
      organization: organizationId
    });

    if (existingUser) {
      throw new Error('User already exists in this organization');
    }

    // Check organization limits
    const memberCount = await User.countDocuments({ 
      organization: organizationId,
      status: { $in: ['active', 'invited'] }
    });

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    if (memberCount >= organization.settings.maxUsers) {
      throw new Error('Organization has reached maximum user limit');
    }

    // Create invited user
    const user = new User({
      email: inviteData.email,
      password: crypto.randomBytes(32).toString('hex'), // Temporary password
      profile: {
        firstName: inviteData.firstName,
        lastName: inviteData.lastName,
        role: inviteData.role
      },
      organization: organizationId,
      organizationRole: inviteData.role,
      status: 'invited',
      emailVerified: false
    });

    await user.save();
    return user;
  }

  async updateUserRole(organizationId: string, userId: string, newRole: 'admin' | 'member' | 'viewer'): Promise<IUser> {
    const user = await User.findOneAndUpdate(
      { _id: userId, organization: organizationId },
      { 
        $set: { 
          organizationRole: newRole,
          'profile.role': newRole
        }
      },
      { new: true }
    );

    if (!user) {
      throw new Error('User not found in organization');
    }

    return user;
  }

  async removeUserFromOrganization(organizationId: string, userId: string): Promise<void> {
    const user = await User.findOneAndUpdate(
      { _id: userId, organization: organizationId },
      { $set: { status: 'deactivated' } }
    );

    if (!user) {
      throw new Error('User not found in organization');
    }
  }

  async getOrganizationUsage(organizationId: string): Promise<{
    users: number;
    projects: number;
    resources: number;
    limits: {
      maxUsers: number;
      maxProjects: number;
      maxResources: number;
    };
  }> {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    const userCount = await User.countDocuments({ 
      organization: organizationId,
      status: { $in: ['active', 'invited'] }
    });

    // TODO: Add project and resource counting logic
    const projectCount = 0;
    const resourceCount = 0;

    return {
      users: userCount,
      projects: projectCount,
      resources: resourceCount,
      limits: {
        maxUsers: organization.settings.maxUsers,
        maxProjects: organization.settings.maxProjects,
        maxResources: organization.settings.maxResources
      }
    };
  }

  private getDefaultSettings(plan: string) {
    const settings = {
      free: {
        maxUsers: 5,
        maxProjects: 3,
        maxResources: 100,
        features: ['basic_monitoring', 'cost_tracking']
      },
      starter: {
        maxUsers: 15,
        maxProjects: 10,
        maxResources: 500,
        features: ['basic_monitoring', 'cost_tracking', 'ai_insights', 'team_collaboration']
      },
      professional: {
        maxUsers: 50,
        maxProjects: 25,
        maxResources: 2000,
        features: ['basic_monitoring', 'cost_tracking', 'ai_insights', 'team_collaboration', 'advanced_analytics', 'custom_integrations']
      },
      enterprise: {
        maxUsers: 1000,
        maxProjects: 100,
        maxResources: 10000,
        features: ['basic_monitoring', 'cost_tracking', 'ai_insights', 'team_collaboration', 'advanced_analytics', 'custom_integrations', 'sso', 'custom_branding', 'priority_support']
      }
    };

    return settings[plan as keyof typeof settings] || settings.free;
  }
} 