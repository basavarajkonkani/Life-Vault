import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AssetService } from '../services/asset.service';
import { CreateAssetDto, UpdateAssetDto } from '../dto/asset.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User, UserRole } from '../entities/user.entity';

@Controller('assets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  create(
    @Body() createAssetDto: CreateAssetDto,
    @CurrentUser() user: User,
  ) {
    return this.assetService.create(createAssetDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.assetService.findAll(user);
  }

  @Get('dashboard-stats')
  getDashboardStats(@CurrentUser() user: User) {
    return this.assetService.getDashboardStats(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.assetService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto,
    @CurrentUser() user: User,
  ) {
    return this.assetService.update(id, updateAssetDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.assetService.remove(id, user);
  }
}
