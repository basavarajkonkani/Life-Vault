import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto, LoginDto, VerifyOtpDto, VerifyPinDto } from '../dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: CreateUserDto) {
    return this.authService.register(body);
  }

  @Post('send-otp')
  async sendOtp(@Body() body: LoginDto) {
    const result = await this.authService.sendOtp(body);
    return { success: true, ...result };
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto) {
    const result = await this.authService.verifyOtp(body);
    return { success: true, ...result, requiresPin: true };
  }

  @Post('verify-pin')
  async verifyPin(@Body() body: VerifyPinDto) {
    const { user, token } = await this.authService.verifyPin(body);
    return { success: true, user, token };
  }
}
