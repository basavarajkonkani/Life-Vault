import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { VaultRequest } from './vault-request.entity';

export enum NomineeRelation {
  SPOUSE = 'Spouse',
  CHILD = 'Child',
  PARENT = 'Parent',
  SIBLING = 'Sibling',
  OTHER = 'Other',
}

@Entity('nominees')
export class Nominee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: NomineeRelation,
  })
  relation: NomineeRelation;

  @Column({ type: 'varchar', length: 15 })
  phone: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  allocationPercentage: number; // 0.00 to 100.00

  @Column({ type: 'boolean', default: false })
  isExecutor: boolean;

  @Column({ type: 'boolean', default: false })
  isBackup: boolean;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  idProofType: string; // Aadhar, PAN, etc.

  @Column({ type: 'text', nullable: true })
  idProofNumber: string; // Encrypted

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.nominees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToMany(() => VaultRequest, (vaultRequest) => vaultRequest.nominee)
  vaultRequests: VaultRequest[];
} 