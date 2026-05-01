import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('live_data')
export class LiveData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, default: '抖音直播' })
  platform: string;

  @Column({ name: 'account_name', length: 100, default: '' })
  accountName: string;

  @Column({ default: 0 })
  exposure: number;

  @Column({ default: 0 })
  viewers: number;

  @Column({ name: 'avg_stay_duration', length: 50, default: '0min' })
  avgStayDuration: string;

  @Column({ name: 'sales_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  salesAmount: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
