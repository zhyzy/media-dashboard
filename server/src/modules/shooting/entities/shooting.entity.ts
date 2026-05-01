import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('shooting')
export class Shooting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'script_id', nullable: true })
  scriptId: number;

  @Column({ length: 200 })
  title: string;

  @Column({ name: 'shooting_date', length: 20, default: '' })
  shootingDate: string;

  @Column({ name: 'shooting_location', length: 200, default: '' })
  shootingLocation: string;

  @Column({ name: 'camera_man', length: 50, default: '' })
  cameraMan: string;

  @Column({ length: 50, default: '' })
  performer: string;

  @Column({ length: 50, default: '' })
  director: string;

  @Column({ length: 20, default: '待拍摄' })
  status: string;

  @Column({ name: 'video_url', length: 500, default: '' })
  videoUrl: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
