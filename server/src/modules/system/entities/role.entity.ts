import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn()
  roleId: number;

  @Column({ name: 'role_name', length: 50 })
  roleName: string;

  @Column({ name: 'role_code', length: 50, unique: true })
  roleCode: string;

  @Column({ length: 200, default: '' })
  description: string;

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
