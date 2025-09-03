import { IsString, IsEmail, IsNumber, IsEnum, IsOptional, IsBoolean, IsPhoneNumber, Min, Max } from 'class-validator';
import { NomineeRelation } from '../entities/nominee.entity';

export class CreateNomineeDto {
  @IsString()
  name: string;

  @IsEnum(NomineeRelation)
  relation: NomineeRelation;

  @IsPhoneNumber('IN')
  phone: string;

  @IsEmail()
  email: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  allocationPercentage: number;

  @IsOptional()
  @IsBoolean()
  isExecutor?: boolean;

  @IsOptional()
  @IsBoolean()
  isBackup?: boolean;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  idProofType?: string;

  @IsOptional()
  @IsString()
  idProofNumber?: string;
}

export class UpdateNomineeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(NomineeRelation)
  relation?: NomineeRelation;

  @IsOptional()
  @IsPhoneNumber('IN')
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  allocationPercentage?: number;

  @IsOptional()
  @IsBoolean()
  isExecutor?: boolean;

  @IsOptional()
  @IsBoolean()
  isBackup?: boolean;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  idProofType?: string;

  @IsOptional()
  @IsString()
  idProofNumber?: string;
}

export class NomineeResponseDto {
  id: string;
  name: string;
  relation: NomineeRelation;
  phone: string;
  email: string;
  allocationPercentage: number;
  isExecutor: boolean;
  isBackup: boolean;
  address?: string;
  idProofType?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
} 