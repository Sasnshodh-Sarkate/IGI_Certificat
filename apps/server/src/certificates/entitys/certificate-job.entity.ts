import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('certificate_jobs')
export class CertificateJob {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  userId!: number;

  @Column()
  fileName!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ default: 0 })
  totalStones!: number;

  @Column({ default: 0 })
  successCount!: number;

  @Column({ default: 0 })
  failedCount!: number;

  @Column({ default: 'PENDING' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  certificateNumbers!: string; // Stored as a comma-separated list or JSON string

  @Column()
  uploadedFilePath!: string;

  @Column({ nullable: true })
  generatedFilePath!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;
}
