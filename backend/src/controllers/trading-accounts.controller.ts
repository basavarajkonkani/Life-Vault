import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('trading-accounts')
@UseGuards(JwtAuthGuard)
export class TradingAccountsController {
  @Get()
  async getAll() {
    return [];
  }

  @Post()
  async create(@Body() _dto: any) {
    return { id: 'todo' };
  }

  @Put(':id')
  async update(@Param('id') _id: string, @Body() _dto: any) {
    return { success: true };
  }

  @Delete(':id')
  async remove(@Param('id') _id: string) {
    return { success: true };
  }
} 