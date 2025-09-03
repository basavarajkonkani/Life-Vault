import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Asset } from './asset.entity';
import { Nominee } from './nominee.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 15, unique: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 255 })
  pinHash: string; // Encrypted 4-digit PIN

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 20, default: 'user' })
  role: string;

  @Column({ type: 'text', nullable: true })
  encryptionKey: string; // User-specific encryption key

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Asset, (asset) => asset.user)
  assets: Asset[];

  @OneToMany(() => Nominee, (nominee) => nominee.user)
  nominees: Nominee[];
} 