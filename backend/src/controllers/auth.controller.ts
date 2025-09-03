import { Controller, Post, Body } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('send-otp')
  async sendOtp(@Body() body: { phone: string }) {
    // Mock OTP sending
    console.log(`Sending OTP to ${body.phone}`);
    return {
      success: true,
      message: 'OTP sent successfully',
      userId: 'mock-user-id'
    };
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { phone: string; otp: string }) {
    // Mock OTP verification
    if (body.otp === '123456') {
      return {
        success: true,
        message: 'OTP verified successfully',
        userId: 'mock-user-id'
      };
    }
    return {
      success: false,
      message: 'Invalid OTP'
    };
  }

  @Post('verify-pin')
  async verifyPin(@Body() body: { userId: string; pin: string }) {
    // Mock PIN verification
    if (body.pin === '1234') {
      return {
        success: true,
        user: {
          id: 'mock-user-id',
          name: 'John Doe',
          phone: '+91 9876543210',
          email: 'john.doe@example.com'
        },
        token: 'mock-jwt-token'
      };
    }
    return {
      success: false,
      message: 'Invalid PIN'
    };
  }
} 