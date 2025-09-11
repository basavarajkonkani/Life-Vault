import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SupabaseService } from './supabase.service';
import { CreateUserDto, LoginDto, VerifyOtpDto, VerifyPinDto } from '../dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
  ) {}

  private excludeSensitiveData(user: any): any {
    const { pin_hash, encryption_key, ...userWithoutSensitiveData } = user;
    return userWithoutSensitiveData;
  }

  async register(createUserDto: CreateUserDto): Promise<{ user: any; token: string }> {
    try {
      // Check if user already exists
      const existingUser = await this.supabaseService.getUserByPhone(createUserDto.phone);
      
      if (existingUser) {
        throw new ConflictException('User with this phone number already exists');
      }

      // Hash the PIN
      const pinHash = await bcrypt.hash(createUserDto.pin, 10);

      // Create user data
      const userData = {
        name: createUserDto.name,
        phone: createUserDto.phone,
        email: createUserDto.email,
        address: createUserDto.address,
        pin_hash: pinHash,
        role: createUserDto.role || 'user',
        is_active: true,
      };

      // Create user in Supabase
      const user = await this.supabaseService.createUser(userData);

      // Generate JWT token
      const token = this.jwtService.sign({ 
        sub: user.id, 
        phone: user.phone,
        role: user.role 
      });

      return {
        user: this.excludeSensitiveData(user),
        token,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new UnauthorizedException('Registration failed');
    }
  }

  async login(loginDto: LoginDto): Promise<{ user: any; token: string }> {
    try {
      // Find user by phone
      const user = await this.supabaseService.getUserByPhone(loginDto.phone);
      
      if (!user) {
        throw new UnauthorizedException('Invalid phone number');
      }

      if (!user.is_active) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // For demo purposes, accept any OTP
      // In production, you would verify the OTP here
      if (!loginDto.otp || loginDto.otp.length !== 6) {
        throw new UnauthorizedException('Invalid OTP');
      }

      // Generate JWT token
      const token = this.jwtService.sign({ 
        sub: user.id, 
        phone: user.phone,
        role: user.role 
      });

      return {
        user: this.excludeSensitiveData(user),
        token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Login failed');
    }
  }

  async verifyPin(verifyPinDto: VerifyPinDto, userId: string): Promise<{ user: any; token: string }> {
    try {
      // Get user from Supabase
      const user = await this.supabaseService.getUserById(userId);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Verify PIN
      const isPinValid = await bcrypt.compare(verifyPinDto.pin, user.pin_hash);
      
      if (!isPinValid) {
        throw new UnauthorizedException('Invalid PIN');
      }

      // Generate JWT token
      const token = this.jwtService.sign({ 
        sub: user.id, 
        phone: user.phone,
        role: user.role 
      });

      return {
        user: this.excludeSensitiveData(user),
        token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('PIN verification failed');
    }
  }

  async getProfile(userId: string): Promise<any> {
    try {
      const user = await this.supabaseService.getUserById(userId);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.excludeSensitiveData(user);
    } catch (error) {
      throw new UnauthorizedException('Failed to get profile');
    }
  }

  async updateProfile(userId: string, updateData: any): Promise<any> {
    try {
      const user = await this.supabaseService.getUserById(userId);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Update user data
      const updatedUser = await this.supabaseService.getClient()
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (updatedUser.error) {
        throw new UnauthorizedException('Failed to update profile');
      }

      return this.excludeSensitiveData(updatedUser.data);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to update profile');
    }
  }

  // Demo user creation for testing
  async createDemoUser(): Promise<{ user: any; token: string }> {
    try {
      const demoUserData = {
        name: 'Demo User',
        phone: '+91 9876543210',
        email: 'demo@example.com',
        address: 'Demo Address',
        pin_hash: await bcrypt.hash('1234', 10),
        role: 'user',
        is_active: true,
      };

      // Check if demo user already exists
      try {
        const existingUser = await this.supabaseService.getUserByPhone(demoUserData.phone);
        if (existingUser) {
          const token = this.jwtService.sign({ 
            sub: existingUser.id, 
            phone: existingUser.phone,
            role: existingUser.role 
          });
          return {
            user: this.excludeSensitiveData(existingUser),
            token,
          };
        }
      } catch (error) {
        // User doesn't exist, create it
      }

      const user = await this.supabaseService.createUser(demoUserData);
      const token = this.jwtService.sign({ 
        sub: user.id, 
        phone: user.phone,
        role: user.role 
      });

      return {
        user: this.excludeSensitiveData(user),
        token,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to create demo user');
    }
  }
}
