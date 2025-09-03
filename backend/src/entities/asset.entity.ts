import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum AssetCategory {
  BANK = 'Bank',
  LIC = 'LIC',
  PF = 'PF',
  PROPERTY = 'Property',
  STOCKS = 'Stocks',
  CRYPTO = 'Crypto',
}

export enum AssetStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  MATURED = 'Matured',
  CLOSED = 'Closed',
}

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AssetCategory,
  })
  category: AssetCategory;

  @Column({ type: 'varchar', length: 200 })
  institution: string;

  @Column({ type: 'text' })
  accountNumber: string; // Encrypted

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  currentValue: number;

  @Column({
    type: 'enum',
    enum: AssetStatus,
    default: AssetStatus.ACTIVE,
  })
  status: AssetStatus;

  @Column({ type: 'text', nullable: true })
  notes: string; // Encrypted

  @Column({ type: 'json', nullable: true })
  documents: string[]; // Array of document URLs/paths

  @Column({ type: 'date', nullable: true })
  maturityDate: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nominee: string; // For assets with specific nominees

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.assets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;
} 