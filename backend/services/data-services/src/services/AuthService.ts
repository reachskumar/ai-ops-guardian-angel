import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { CloudAccount } from '../models/CloudAccount';

export class AuthService {
  private jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organization: string;
  }): Promise<{ user: IUser; token: string }> {
    // Check if user exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Create user
    const user = new User({
      email: userData.email,
      password: hashedPassword,
      profile: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'member'
      },
      organization: userData.organization
    });

    await user.save();

    // Generate token
    const token = this.generateToken((user._id as any).toString(), user.profile.role);

    return { user, token };
  }

  async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken((user._id as any).toString(), user.profile.role);

    return { user, token };
  }

  generateToken(userId: string, role: string): string {
    return jwt.sign(
      { userId, role },
      this.jwtSecret,
      { expiresIn: '24h' }
    );
  }

  verifyToken(token: string): { userId: string; role: string } {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      return { userId: decoded.userId, role: decoded.role };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async getUserById(userId: string): Promise<IUser | null> {
    return await User.findById(userId);
  }

  async updateUserProfile(userId: string, profileData: Partial<IUser['profile']>): Promise<IUser> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { profile: profileData } },
      { new: true }
    );
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedNewPassword;
    await user.save();
  }
} 