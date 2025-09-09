import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction, AuditResource } from '../entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(
    action: AuditAction,
    resource: AuditResource,
    userId?: string,
    resourceId?: string,
    description?: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const auditLog = this.auditLogRepository.create({
      action,
      resource,
      userId,
      resourceId,
      description,
      metadata,
      ipAddress,
      userAgent,
    });

    await this.auditLogRepository.save(auditLog);
  }

  async getAuditLogs(
    userId?: string,
    resource?: AuditResource,
    action?: AuditAction,
    limit: number = 100,
    offset: number = 0,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('auditLog')
      .leftJoinAndSelect('auditLog.user', 'user')
      .orderBy('auditLog.createdAt', 'DESC')
      .limit(limit)
      .offset(offset);

    if (userId) {
      queryBuilder.andWhere('auditLog.userId = :userId', { userId });
    }

    if (resource) {
      queryBuilder.andWhere('auditLog.resource = :resource', { resource });
    }

    if (action) {
      queryBuilder.andWhere('auditLog.action = :action', { action });
    }

    const [logs, total] = await queryBuilder.getManyAndCount();

    return { logs, total };
  }
}
