import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('media_data')
export class MediaData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  platform: string;

  @Column({ length: 255 })
  title: string;

  @Column({ name: 'publisher', length: 100, default: '' })
  publisher: string;

  @Column({ name: 'publish_status', length: 20, default: '已发布' })
  publishStatus: string;

  @Column({ name: 'publish_date', length: 20, nullable: true })
  publishDate: string;

  @Column({ name: 'read_count', default: 0 })
  readCount: number;

  @Column({ name: 'like_count', default: 0 })
  likeCount: number;

  @Column({ name: 'comment_count', default: 0 })
  commentCount: number;

  @Column({ name: 'share_count', default: 0 })
  shareCount: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
