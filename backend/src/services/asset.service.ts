import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../entities/asset.entity';
import { User } from '../entities/user.entity';
import { CreateAssetDto, UpdateAssetDto } from '../dto/asset.dto';
import { AuditService } from './audit.service';
import { AuditAction, AuditResource } from '../entities/audit-log.entity';

@Injectable()
export class AssetService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    private readonly auditService: AuditService,
  ) {}

  async create(createAssetDto: CreateAssetDto, user: User): Promise<Asset> {
    const asset = this.assetRepository.create({
      ...createAssetDto,
      userId: user.id,
    });

    const savedAsset = await this.assetRepository.save(asset);

    // Log the action
    await this.auditService.log(
      AuditAction.CREATE,
      AuditResource.ASSET,
      user.id,
      savedAsset.id,
      `Asset created: ${savedAsset.category} - ${savedAsset.institution}`,
      { category: savedAsset.category, institution: savedAsset.institution },
    );

    return savedAsset;
  }

  async findAll(user: User): Promise<Asset[]> {
    return this.assetRepository.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User): Promise<Asset> {
    const asset = await this.assetRepository.findOne({
      where: { id, userId: user.id },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  async update(id: string, updateAssetDto: UpdateAssetDto, user: User): Promise<Asset> {
    const asset = await this.findOne(id, user);

    Object.assign(asset, updateAssetDto);
    const updatedAsset = await this.assetRepository.save(asset);

    // Log the action
    await this.auditService.log(
      AuditAction.UPDATE,
      AuditResource.ASSET,
      user.id,
      updatedAsset.id,
      `Asset updated: ${updatedAsset.category} - ${updatedAsset.institution}`,
      { category: updatedAsset.category, institution: updatedAsset.institution },
    );

    return updatedAsset;
  }

  async remove(id: string, user: User): Promise<void> {
    const asset = await this.findOne(id, user);

    await this.assetRepository.remove(asset);

    // Log the action
    await this.auditService.log(
      AuditAction.DELETE,
      AuditResource.ASSET,
      user.id,
      id,
      `Asset deleted: ${asset.category} - ${asset.institution}`,
      { category: asset.category, institution: asset.institution },
    );
  }

  async getDashboardStats(user: User): Promise<{
    totalAssets: number;
    totalValue: number;
    assetAllocation: Array<{ name: string; value: number; amount: number; color: string }>;
  }> {
    const assets = await this.findAll(user);
    
    const totalAssets = assets.length;
    const totalValue = assets.reduce((sum, asset) => sum + Number(asset.currentValue), 0);

    // Group by category
    const categoryMap = new Map<string, { count: number; value: number }>();
    
    assets.forEach(asset => {
      const category = asset.category;
      if (categoryMap.has(category)) {
        const existing = categoryMap.get(category)!;
        existing.count += 1;
        existing.value += Number(asset.currentValue);
      } else {
        categoryMap.set(category, { count: 1, value: Number(asset.currentValue) });
      }
    });

    // Convert to array with colors
    const colors = ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#EFF6FF'];
    const assetAllocation = Array.from(categoryMap.entries()).map(([name, data], index) => ({
      name,
      value: totalValue > 0 ? Math.round((data.value / totalValue) * 100) : 0,
      amount: data.value,
      color: colors[index % colors.length],
    }));

    return {
      totalAssets,
      totalValue,
      assetAllocation,
    };
  }
}
