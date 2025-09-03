import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, IsArray } from 'class-validator';
import { AssetCategory, AssetStatus } from '../entities/asset.entity';

export class CreateAssetDto {
  @IsEnum(AssetCategory)
  category: AssetCategory;

  @IsString()
  institution: string;

  @IsString()
  accountNumber: string;

  @IsNumber()
  currentValue: number;

  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @IsOptional()
  @IsDateString()
  maturityDate?: string;

  @IsOptional()
  @IsString()
  nominee?: string;
}

export class UpdateAssetDto {
  @IsOptional()
  @IsEnum(AssetCategory)
  category?: AssetCategory;

  @IsOptional()
  @IsString()
  institution?: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsNumber()
  currentValue?: number;

  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @IsOptional()
  @IsDateString()
  maturityDate?: string;

  @IsOptional()
  @IsString()
  nominee?: string;
}

export class AssetResponseDto {
  id: string;
  category: AssetCategory;
  institution: string;
  accountNumber: string;
  currentValue: number;
  status: AssetStatus;
  notes?: string;
  documents?: string[];
  maturityDate?: Date;
  nominee?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
} 