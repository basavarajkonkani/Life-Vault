import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsEmail, Min, Max } from 'class-validator';
import { NomineeRelation } from '../entities/nominee.entity';

export class CreateNomineeDto {
  @IsString()
  name: string;

  @IsEnum(NomineeRelation)
  relation: NomineeRelation;

  @IsString()
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
  @IsString()
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
