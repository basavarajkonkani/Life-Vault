import { Controller, Get, Post, Put, Body, Param, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VaultRequest, VaultRequestStatus } from '../entities/vault-request.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('vault/requests')
@UseGuards(JwtAuthGuard)
export class VaultController {
  constructor(
    @InjectRepository(VaultRequest)
    private readonly vaultRepository: Repository<VaultRequest>,
  ) {}

  @Get()
  async list(@Req() req: any) {
    // Owners see requests for their nominees; nominees see their own; admins see all
    const role = req.user.role;
    if (role === 'admin' || role === 'super-admin') {
      return this.vaultRepository.find();
    }
    // For MVP, return all for now; can join nominee.userId later
    return this.vaultRepository.find();
  }

  @Post()
  async create(@Body() body: any, @Req() _req: any) {
    const vr = this.vaultRepository.create({
      nomineeName: body.nomineeName,
      relationToDeceased: body.relationToDeceased,
      phoneNumber: body.phoneNumber,
      email: body.email,
      deathCertificateUrl: body.deathCertificate,
      status: VaultRequestStatus.PENDING,
      nomineeId: body.nomineeId,
    });
    return this.vaultRepository.save(vr);
  }

  @Put(':id')
  async updateStatus(@Param('id') id: string, @Body() body: { status: VaultRequestStatus; notes?: string }, @Req() req: any) {
    const role = req.user.role;
    if (!(role === 'admin' || role === 'super-admin')) {
      return { success: false, message: 'Forbidden' };
    }
    const v = await this.vaultRepository.findOne({ where: { id } });
    if (!v) return { success: false, message: 'Not found' };
    v.status = body.status;
    v.adminNotes = body.notes || null;
    if (body.status === VaultRequestStatus.VERIFIED) {
      v.vaultOpenedAt = new Date();
      v.reviewedAt = new Date();
      if (req.user.userId) {
        v.reviewedBy = String(req.user.userId);
      }
    }
    await this.vaultRepository.save(v);
    return { success: true };
  }
} 