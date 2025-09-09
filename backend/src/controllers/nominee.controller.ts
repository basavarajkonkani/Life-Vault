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
import { NomineeService } from '../services/nominee.service';
import { CreateNomineeDto, UpdateNomineeDto } from '../dto/nominee.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User, UserRole } from '../entities/user.entity';

@Controller('nominees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class NomineeController {
  constructor(private readonly nomineeService: NomineeService) {}

  @Post()
  create(
    @Body() createNomineeDto: CreateNomineeDto,
    @CurrentUser() user: User,
  ) {
    return this.nomineeService.create(createNomineeDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.nomineeService.findAll(user);
  }

  @Get('dashboard-stats')
  getDashboardStats(@CurrentUser() user: User) {
    return this.nomineeService.getDashboardStats(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.nomineeService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNomineeDto: UpdateNomineeDto,
    @CurrentUser() user: User,
  ) {
    return this.nomineeService.update(id, updateNomineeDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.nomineeService.remove(id, user);
  }
}
