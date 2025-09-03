import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { CreateUserDto, LoginDto, VerifyOtpDto, VerifyPinDto } from '../dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { phone: createUserDto.phone },
        { email: createUserDto.email }
      ]
    });

    if (existingUser) {
      throw new ConflictException('User with this phone or email already exists');
    }

    // Hash the PIN
    const pinHash = await bcrypt.hash(createUserDto.pin, 10);

    // Create user
    const user = this.userRepository.create({
      ...createUserDto,
      pinHash,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const token = this.generateToken(savedUser);

    // Remove sensitive data
    delete savedUser.pinHash;
    delete savedUser.encryptionKey;

    return { user: savedUser, token };
  }

  async sendOtp(loginDto: LoginDto): Promise<{ message: string; userId?: string }> {
    // Find user by phone
    const user = await this.userRepository.findOne({
      where: { phone: loginDto.phone }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // In production, integrate with Firebase Auth or Twilio
    // For now, return success message
    console.log(`Sending OTP to ${loginDto.phone}`);

    return { 
      message: 'OTP sent successfully',
      userId: user.id 
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ message: string; userId: string }> {
    // Find user by phone
    const user = await this.userRepository.findOne({
      where: { phone: verifyOtpDto.phone }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // In production, verify with Firebase Auth or Twilio
    // For demo purposes, accept '123456' as valid OTP
    if (verifyOtpDto.otp !== '123456') {
      throw new UnauthorizedException('Invalid OTP');
    }

    return { 
      message: 'OTP verified successfully',
      userId: user.id 
    };
  }

  async verifyPin(verifyPinDto: VerifyPinDto): Promise<{ user: User; token: string }> {
    // Find user by ID
    const user = await this.userRepository.findOne({
      where: { id: verifyPinDto.userId }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify PIN
    const isPinValid = await bcrypt.compare(verifyPinDto.pin, user.pinHash);
    if (!isPinValid) {
      throw new UnauthorizedException('Invalid PIN');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Remove sensitive data
    delete user.pinHash;
    delete user.encryptionKey;

    return { user, token };
  }

  private generateToken(user: User): string {
    const payload = { 
      sub: user.id, 
      phone: user.phone,
      role: user.role 
    };
    return this.jwtService.sign(payload);
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true }
    });

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    delete user.pinHash;
    delete user.encryptionKey;
    
    return user;
  }
} 