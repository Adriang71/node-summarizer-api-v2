import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { UserRegistration, UserLogin, AuthResponse, JwtPayload } from '../types';
import { AIConfigService } from './aiConfigService';

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly JWT_EXPIRES_IN = '7d';

  /**
   * Register a new user
   */
  static async register(userData: UserRegistration): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await UserModel.findOne({ email: userData.email });
      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists'
        };
      }

      // Create new user
      const user = new UserModel(userData);
      await user.save();

      // Create default AI configuration for new user
      await AIConfigService.createDefaultConfig(user._id!.toString());

      // Generate JWT token
      const token = this.generateToken(user._id!.toString(), user.email);

      return {
        success: true,
        data: {
          user: {
            id: user._id!.toString(),
            email: user.email,
            name: user.name
          },
          token
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  /**
   * Login user
   */
  static async login(loginData: UserLogin): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await UserModel.findOne({ email: loginData.email });
      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Check password
      const isPasswordValid = await user.comparePassword(loginData.password);
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Generate JWT token
      const token = this.generateToken(user._id!.toString(), user.email);

      return {
        success: true,
        data: {
          user: {
            id: user._id!.toString(),
            email: user.email,
            name: user.name
          },
          token
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JwtPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate JWT token
   */
  private static generateToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string) {
    try {
      return await UserModel.findById(userId).select('-password');
    } catch (error) {
      return null;
    }
  }
} 