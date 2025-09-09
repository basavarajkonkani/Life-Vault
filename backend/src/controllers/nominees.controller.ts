import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nominee } from '../entities/nominee.entity';
import { CreateNomineeDto, UpdateNomineeDto } from '../dto/nominee.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('nominees')
@UseGuards(JwtAuthGuard)
export class NomineesController {
  constructor(
    @InjectRepository(Nominee)
    private readonly nomineeRepository: Repository<Nominee>,
  ) {}

  @Get()
  async getAll(@Req() req: any) {
    return this.nomineeRepository.find({ where: { userId: req.user.userId } });
  }

  @Post()
  async create(@Body() dto: CreateNomineeDto, @Req() req: any) {
    const nominee = this.nomineeRepository.create({ ...dto, userId: req.user.userId });
    return this.nomineeRepository.save(nominee);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateNomineeDto, @Req() req: any) {
    const nominee = await this.nomineeRepository.findOne({ where: { id, userId: req.user.userId } });
    if (!nominee) return { success: false, message: 'Not found' };
    Object.assign(nominee, dto);
    return this.nomineeRepository.save(nominee);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.nomineeRepository.delete({ id, userId: req.user.userId });
    return { success: true };
  }
} 