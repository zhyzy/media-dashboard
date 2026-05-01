import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 20, default: 'admin' })
  role: string;

  @Column({ name: 'real_name', length: 50, default: '' })
  realName: string;

  @Column({ name: 'parent_id', default: 0 })
  parentId: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'simple-json', name: 'permissions', nullable: true })
  permissions: string[];

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
