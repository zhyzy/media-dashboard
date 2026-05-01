import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('data_history')
export class DataHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'platform', length: 50 })
  platform: string; // 'douyin', 'kuaishou', 'video_account', 'media', 'live'

  @Column({ name: 'record_id' })
  recordId: number; // 关联的记录 id

  @Column({ name: 'account_name', length: 100, nullable: true })
  accountName: string;

  @Column({ name: 'title', length: 255, nullable: true })
  title: string;

  @Column({ name: 'play_count', default: 0, nullable: true })
  playCount: number;

  @Column({ name: 'like_count', default: 0, nullable: true })
  likeCount: number;

  @Column({ name: 'comment_count', default: 0, nullable: true })
  commentCount: number;

  @Column({ name: 'share_count', default: 0, nullable: true })
  shareCount: number;

  @Column({ name: 'read_count', default: 0, nullable: true })
  readCount: number;

  @Column({ name: 'exposure', default: 0, nullable: true })
  exposure: number;

  @Column({ name: 'viewers', default: 0, nullable: true })
  viewers: number;

  @Column({ name: 'sales_amount', type: 'decimal', precision: 10, scale: 2, default: 0, nullable: true })
  salesAmount: number;

  @Column({ name: 'record_date', type: 'date' })
  recordDate: Date; // 这条数据对应的日期（例如 2026-04-30）

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
