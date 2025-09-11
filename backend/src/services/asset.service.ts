import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { CreateAssetDto, UpdateAssetDto } from '../dto/asset.dto';

@Injectable()
export class AssetService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  async create(createAssetDto: CreateAssetDto, userId: string): Promise<any> {
    const assetData = {
      user_id: userId,
      category: createAssetDto.category,
      institution: createAssetDto.institution,
      account_number: createAssetDto.accountNumber,
      current_value: createAssetDto.currentValue,
      status: createAssetDto.status || 'Active',
      notes: createAssetDto.notes,
      documents: createAssetDto.documents || [],
    };

    return await this.supabaseService.createAsset(assetData);
  }

  async findAll(userId: string): Promise<any[]> {
    return await this.supabaseService.getAssetsByUserId(userId);
  }

  async findOne(id: string, userId: string): Promise<any> {
    const assets = await this.supabaseService.getAssetsByUserId(userId);
    const asset = assets.find(a => a.id === id);
    
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    
    return asset;
  }

  async update(id: string, updateAssetDto: UpdateAssetDto, userId: string): Promise<any> {
    // First check if asset exists and belongs to user
    await this.findOne(id, userId);
    
    const updateData = {
      category: updateAssetDto.category,
      institution: updateAssetDto.institution,
      account_number: updateAssetDto.accountNumber,
      current_value: updateAssetDto.currentValue,
      status: updateAssetDto.status,
      notes: updateAssetDto.notes,
      documents: updateAssetDto.documents,
    };

    return await this.supabaseService.updateAsset(id, updateData);
  }

  async remove(id: string, userId: string): Promise<void> {
    // First check if asset exists and belongs to user
    await this.findOne(id, userId);
    
    await this.supabaseService.deleteAsset(id);
  }
}
