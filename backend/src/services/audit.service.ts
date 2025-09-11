import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum AuditResource {
  USER = 'USER',
  ASSET = 'ASSET',
  NOMINEE = 'NOMINEE',
  TRADING_ACCOUNT = 'TRADING_ACCOUNT',
  VAULT_REQUEST = 'VAULT_REQUEST',
}

@Injectable()
export class AuditService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  async log(action: AuditAction, resource: AuditResource, userId: string, details?: any): Promise<void> {
    try {
      const auditData = {
        user_id: userId,
        action: action,
        resource: resource,
        details: details || {},
        timestamp: new Date().toISOString(),
      };

      await this.supabaseService.getClient()
        .from('audit_logs')
        .insert(auditData);
    } catch (error) {
      // Log audit errors but don't throw to avoid breaking the main operation
      console.error('Audit logging failed:', error);
    }
  }
}
