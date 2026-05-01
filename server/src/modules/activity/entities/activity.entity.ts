import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'staff_id' })
  staffId: number;

  @Column({ name: 'staff_name', length: 50 })
  staffName: string;

  @Column({ length: 20 })
  action: string;

  @Column({ length: 100 })
  target: string;

  @Column({ name: 'module_type', length: 50, default: 'data' })
  moduleType: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
