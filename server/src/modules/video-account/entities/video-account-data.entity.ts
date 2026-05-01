import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('video_account_data')
export class VideoAccountData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'account_name', length: 100 })
  accountName: string;

  @Column({ name: 'play_count', default: 0 })
  playCount: number;

  @Column({ name: 'like_count', default: 0 })
  likeCount: number;

  @Column({ name: 'comment_count', default: 0 })
  commentCount: number;

  @Column({ name: 'share_count', default: 0 })
  shareCount: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
