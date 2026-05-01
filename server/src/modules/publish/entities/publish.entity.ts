import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('publish')
export class Publish {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'shooting_id', nullable: true })
  shootingId: number;

  @Column({ name: 'script_id', nullable: true })
  scriptId: number;

  @Column({ length: 200 })
  title: string;

  @Column({ length: 50, default: '' })
  publisher: string;

  @Column({ length: 50, default: '' })
  platform: string;

  @Column({ name: 'publish_date', length: 20, default: '' })
  publishDate: string;

  @Column({ name: 'publish_url', length: 500, default: '' })
  publishUrl: string;

  @Column({ length: 20, default: '待发布' })
  status: string;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'like_count', default: 0 })
  likeCount: number;

  @Column({ name: 'comment_count', default: 0 })
  commentCount: number;

  @Column({ name: 'share_count', default: 0 })
  shareCount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
