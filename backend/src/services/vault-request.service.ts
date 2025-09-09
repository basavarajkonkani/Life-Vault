import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VaultRequest, VaultRequestStatus } from '../entities/vault-request.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateVaultRequestDto, UpdateVaultRequestDto, ApproveVaultRequestDto, RejectVaultRequestDto } from '../dto/vault-request.dto';
import { AuditService } from './audit.service';
import { AuditAction, AuditResource } from '../entities/audit-log.entity';

@Injectable()
export class VaultRequestService {
  constructor(
    @InjectRepository(VaultRequest)
    private readonly vaultRequestRepository: Repository<VaultRequest>,
    private readonly auditService: AuditService,
  ) {}

  async create(createVaultRequestDto: CreateVaultRequestDto, user: User): Promise<VaultRequest> {
    const vaultRequest = this.vaultRequestRepository.create({
      ...createVaultRequestDto,
      nomineeId: user.id, // For nominees, the user ID is the nominee ID
    });

    const savedVaultRequest = await this.vaultRequestRepository.save(vaultRequest);

    // Log the action
    await this.auditService.log(
      AuditAction.VAULT_REQUEST,
      AuditResource.VAULT_REQUEST,
      user.id,
      savedVaultRequest.id,
      `Vault request submitted: ${savedVaultRequest.nomineeName}`,
      { nomineeName: savedVaultRequest.nomineeName, relation: savedVaultRequest.relationToDeceased },
    );

    return savedVaultRequest;
  }

  async findAll(user: User): Promise<VaultRequest[]> {
    if (user.role === UserRole.NOMINEE) {
      // Nominees can only see their own requests
      return this.vaultRequestRepository.find({
        where: { nomineeId: user.id },
        order: { createdAt: 'DESC' },
      });
    } else if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
      // Admins can see all requests
      return this.vaultRequestRepository.find({
        order: { createdAt: 'DESC' },
      });
    } else {
      throw new ForbiddenException('Access denied');
    }
  }

  async findOne(id: string, user: User): Promise<VaultRequest> {
    const vaultRequest = await this.vaultRequestRepository.findOne({
      where: { id },
    });

    if (!vaultRequest) {
      throw new NotFoundException('Vault request not found');
    }

    // Check permissions
    if (user.role === UserRole.NOMINEE && vaultRequest.nomineeId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return vaultRequest;
  }

  async update(id: string, updateVaultRequestDto: UpdateVaultRequestDto, user: User): Promise<VaultRequest> {
    const vaultRequest = await this.findOne(id, user);

    // Only nominees can update their own requests (for document uploads)
    if (user.role === UserRole.NOMINEE && vaultRequest.nomineeId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    // Only admins can change status
    if (updateVaultRequestDto.status && user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only admins can change request status');
    }

    Object.assign(vaultRequest, updateVaultRequestDto);
    const updatedVaultRequest = await this.vaultRequestRepository.save(vaultRequest);

    // Log the action
    await this.auditService.log(
      AuditAction.UPDATE,
      AuditResource.VAULT_REQUEST,
      user.id,
      updatedVaultRequest.id,
      `Vault request updated: ${updatedVaultRequest.nomineeName}`,
      { status: updatedVaultRequest.status, nomineeName: updatedVaultRequest.nomineeName },
    );

    return updatedVaultRequest;
  }

  async approve(id: string, approveDto: ApproveVaultRequestDto, user: User): Promise<VaultRequest> {
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only admins can approve vault requests');
    }

    const vaultRequest = await this.findOne(id, user);

    vaultRequest.status = VaultRequestStatus.VERIFIED;
    vaultRequest.adminNotes = approveDto.adminNotes || null;
    vaultRequest.reviewedAt = new Date();
    vaultRequest.reviewedBy = user.id;
    vaultRequest.vaultOpenedAt = new Date();

    const approvedVaultRequest = await this.vaultRequestRepository.save(vaultRequest);

    // Log the action
    await this.auditService.log(
      AuditAction.VAULT_APPROVE,
      AuditResource.VAULT_REQUEST,
      user.id,
      approvedVaultRequest.id,
      `Vault request approved: ${approvedVaultRequest.nomineeName}`,
      { nomineeName: approvedVaultRequest.nomineeName, adminNotes: approveDto.adminNotes },
    );

    return approvedVaultRequest;
  }

  async reject(id: string, rejectDto: RejectVaultRequestDto, user: User): Promise<VaultRequest> {
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only admins can reject vault requests');
    }

    const vaultRequest = await this.findOne(id, user);

    vaultRequest.status = VaultRequestStatus.REJECTED;
    vaultRequest.adminNotes = rejectDto.adminNotes;
    vaultRequest.reviewedAt = new Date();
    vaultRequest.reviewedBy = user.id;

    const rejectedVaultRequest = await this.vaultRequestRepository.save(vaultRequest);

    // Log the action
    await this.auditService.log(
      AuditAction.VAULT_REJECT,
      AuditResource.VAULT_REQUEST,
      user.id,
      rejectedVaultRequest.id,
      `Vault request rejected: ${rejectedVaultRequest.nomineeName}`,
      { nomineeName: rejectedVaultRequest.nomineeName, adminNotes: rejectDto.adminNotes },
    );

    return rejectedVaultRequest;
  }

  async getDashboardStats(user: User): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
  }> {
    let requests: VaultRequest[];

    if (user.role === UserRole.NOMINEE) {
      requests = await this.vaultRequestRepository.find({
        where: { nomineeId: user.id },
      });
    } else if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
      requests = await this.vaultRequestRepository.find();
    } else {
      throw new ForbiddenException('Access denied');
    }

    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === VaultRequestStatus.PENDING).length;
    const approvedRequests = requests.filter(r => r.status === VaultRequestStatus.VERIFIED).length;
    const rejectedRequests = requests.filter(r => r.status === VaultRequestStatus.REJECTED).length;

    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
    };
  }
}
