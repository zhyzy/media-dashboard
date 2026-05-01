import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('dataease_config')
export class DataeaseConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 64 })
  apiKey: string;

  @Column({ length: 100, default: '默认数据源' })
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'simple-json', nullable: true })
  allowedTables: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
