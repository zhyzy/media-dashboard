import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('script')
export class Script {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'script_type', length: 50, default: '短视频' })
  scriptType: string;

  @Column({ name: 'author', length: 50, default: '' })
  author: string;

  @Column({ name: 'performer', length: 50, default: '' })
  performer: string;

  @Column({ name: 'camera_man', length: 50, default: '' })
  cameraMan: string;

  @Column({ length: 20, default: '草稿' })
  status: string;

  @Column({ name: 'platform_target', length: 200, default: '' })
  platformTarget: string;

  @Column({ name: 'estimated_duration', length: 50, default: '' })
  estimatedDuration: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
