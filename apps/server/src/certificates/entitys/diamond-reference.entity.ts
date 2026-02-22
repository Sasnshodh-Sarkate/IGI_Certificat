import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('diamond_references')
export class DiamondReference {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  certificateNumber!: string;

  @Column({ nullable: true })
  shape!: string;

  @Column({ nullable: true })
  carat!: string;

  @Column({ nullable: true })
  color!: string;

  @Column({ nullable: true })
  clarity!: string;

  @Column({ nullable: true })
  cut!: string;

  @Column({ nullable: true })
  polish!: string;

  @Column({ nullable: true })
  symmetry!: string;

  @Column({ nullable: true })
  fluorescence!: string;

  @Column({ nullable: true })
  measurement!: string;

  @Column({ nullable: true })
  location!: string;

  @Column({ type: 'text', nullable: true })
  fullData!: string; // JSON string for any extra details

  @Column({ type: 'bigint', nullable: true })
  stock_ID!: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
