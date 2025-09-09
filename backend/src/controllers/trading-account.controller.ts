import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TradingAccountService } from '../services/trading-account.service';
import { CreateTradingAccountDto, UpdateTradingAccountDto } from '../dto/trading-account.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User, UserRole } from '../entities/user.entity';

@Controller('trading-accounts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class TradingAccountController {
  constructor(private readonly tradingAccountService: TradingAccountService) {}

  @Post()
  create(
    @Body() createTradingAccountDto: CreateTradingAccountDto,
    @CurrentUser() user: User,
  ) {
    return this.tradingAccountService.create(createTradingAccountDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.tradingAccountService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tradingAccountService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTradingAccountDto: UpdateTradingAccountDto,
    @CurrentUser() user: User,
  ) {
    return this.tradingAccountService.update(id, updateTradingAccountDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tradingAccountService.remove(id, user);
  }
}
