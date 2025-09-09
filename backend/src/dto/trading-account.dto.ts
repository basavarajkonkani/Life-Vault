import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsArray } from 'class-validator';
import { TradingAccountStatus } from '../entities/trading-account.entity';

export class CreateTradingAccountDto {
  @IsString()
  brokerName: string;

  @IsString()
  accountNumber: string;

  @IsOptional()
  @IsString()
  dematAccountNumber?: string;

  @IsNumber()
  currentValue: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @IsOptional()
  @IsDateString()
  openedDate?: string;
}

export class UpdateTradingAccountDto {
  @IsOptional()
  @IsString()
  brokerName?: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  dematAccountNumber?: string;

  @IsOptional()
  @IsNumber()
  currentValue?: number;

  @IsOptional()
  @IsEnum(TradingAccountStatus)
  status?: TradingAccountStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @IsOptional()
  @IsDateString()
  openedDate?: string;
}
