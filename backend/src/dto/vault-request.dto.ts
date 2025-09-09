import { IsString, IsOptional, IsEnum, IsEmail } from 'class-validator';
import { VaultRequestStatus } from '../entities/vault-request.entity';

export class CreateVaultRequestDto {
  @IsString()
  nomineeName: string;

  @IsString()
  relationToDeceased: string;

  @IsString()
  phoneNumber: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  deathCertificateUrl?: string;
}

export class UpdateVaultRequestDto {
  @IsOptional()
  @IsEnum(VaultRequestStatus)
  status?: VaultRequestStatus;

  @IsOptional()
  @IsString()
  adminNotes?: string;

  @IsOptional()
  @IsString()
  deathCertificateUrl?: string;
}

export class ApproveVaultRequestDto {
  @IsOptional()
  @IsString()
  adminNotes?: string;
}

export class RejectVaultRequestDto {
  @IsString()
  adminNotes: string;
}
