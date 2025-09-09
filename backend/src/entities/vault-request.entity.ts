import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Nominee } from './nominee.entity';

export enum VaultRequestStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Entity('vault_requests')
export class VaultRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nomineeName: string;

  @Column({ type: 'varchar', length: 50 })
  relationToDeceased: string;

  @Column({ type: 'varchar', length: 15 })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'text', nullable: true })
  deathCertificateUrl: string; // Path to uploaded death certificate

  @Column({
    type: 'enum',
    enum: VaultRequestStatus,
    default: VaultRequestStatus.PENDING,
  })
  status: VaultRequestStatus;

  @Column({ type: 'text', nullable: true })
  adminNotes: string | null; // Admin review notes

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy: string; // Admin user ID

  @Column({ type: 'timestamp', nullable: true })
  vaultOpenedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Nominee, (nominee) => nominee.vaultRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nomineeId' })
  nominee: Nominee;

  @Column({ type: 'uuid' })
  nomineeId: string;
} 