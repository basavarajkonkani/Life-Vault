import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { CreateVaultRequestDto, UpdateVaultRequestDto } from '../dto/vault-request.dto';

@Injectable()
export class VaultRequestService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  async create(createVaultRequestDto: CreateVaultRequestDto): Promise<any> {
    const vaultRequestData = {
      nominee_id: createVaultRequestDto.nomineeId,
      nominee_name: createVaultRequestDto.nomineeName,
      relation_to_deceased: createVaultRequestDto.relationToDeceased,
      phone_number: createVaultRequestDto.phoneNumber,
      email: createVaultRequestDto.email,
      death_certificate_url: createVaultRequestDto.deathCertificateUrl,
      status: createVaultRequestDto.status || 'pending',
    };

    return await this.supabaseService.createVaultRequest(vaultRequestData);
  }

  async findAll(): Promise<any[]> {
    return await this.supabaseService.getVaultRequests();
  }

  async findOne(id: string): Promise<any> {
    const vaultRequests = await this.supabaseService.getVaultRequests();
    const vaultRequest = vaultRequests.find(vr => vr.id === id);
    
    if (!vaultRequest) {
      throw new NotFoundException('Vault request not found');
    }
    
    return vaultRequest;
  }

  async update(id: string, updateVaultRequestDto: UpdateVaultRequestDto): Promise<any> {
    const updateData = {
      nominee_name: updateVaultRequestDto.nomineeName,
      relation_to_deceased: updateVaultRequestDto.relationToDeceased,
      phone_number: updateVaultRequestDto.phoneNumber,
      email: updateVaultRequestDto.email,
      death_certificate_url: updateVaultRequestDto.deathCertificateUrl,
      status: updateVaultRequestDto.status,
    };

    return await this.supabaseService.updateVaultRequest(id, updateData);
  }

  async remove(id: string): Promise<void> {
    await this.supabaseService.getClient()
      .from('vault_requests')
      .delete()
      .eq('id', id);
  }
}
