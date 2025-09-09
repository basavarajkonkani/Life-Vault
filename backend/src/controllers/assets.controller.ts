import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../entities/asset.entity';
import { CreateAssetDto, UpdateAssetDto } from '../dto/asset.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
  ) {}

  @Get()
  async getAll(@Req() req: any) {
    return this.assetRepository.find({ where: { userId: req.user.userId } });
  }

  @Post()
  async create(@Body() dto: CreateAssetDto, @Req() req: any) {
    const asset = this.assetRepository.create({ ...dto, userId: req.user.userId });
    return this.assetRepository.save(asset);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAssetDto, @Req() req: any) {
    const asset = await this.assetRepository.findOne({ where: { id, userId: req.user.userId } });
    if (!asset) return { success: false, message: 'Not found' };
    Object.assign(asset, dto);
    return this.assetRepository.save(asset);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.assetRepository.delete({ id, userId: req.user.userId });
    return { success: true };
  }
} 