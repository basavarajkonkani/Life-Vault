import { IsString, IsEmail, IsOptional, IsPhoneNumber, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @IsPhoneNumber('IN')
  phone: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  @Length(4, 4)
  pin: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class LoginDto {
  @IsPhoneNumber('IN')
  phone: string;
}

export class VerifyOtpDto {
  @IsPhoneNumber('IN')
  phone: string;

  @IsString()
  @Length(6, 6)
  otp: string;
}

export class VerifyPinDto {
  @IsString()
  userId: string;

  @IsString()
  @Length(4, 4)
  pin: string;
}

export class UserResponseDto {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  isActive: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
} 