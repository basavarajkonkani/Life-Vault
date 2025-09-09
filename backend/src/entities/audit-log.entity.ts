import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PIN_VERIFY = 'PIN_VERIFY',
  OTP_SEND = 'OTP_SEND',
  OTP_VERIFY = 'OTP_VERIFY',
  VAULT_REQUEST = 'VAULT_REQUEST',
  VAULT_APPROVE = 'VAULT_APPROVE',
  VAULT_REJECT = 'VAULT_REJECT',
  FILE_UPLOAD = 'FILE_UPLOAD',
  FILE_DOWNLOAD = 'FILE_DOWNLOAD',
}

export enum AuditResource {
  USER = 'USER',
  ASSET = 'ASSET',
  NOMINEE = 'NOMINEE',
  VAULT_REQUEST = 'VAULT_REQUEST',
  DOCUMENT = 'DOCUMENT',
  TRADING_ACCOUNT = 'TRADING_ACCOUNT',
  AUTH = 'AUTH',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({
    type: 'enum',
    enum: AuditResource,
  })
  resource: AuditResource;

  @Column({ type: 'uuid', nullable: true })
  resourceId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  userId: string;
}
