import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('kuaishou_data')
export class KuaishouData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'account_name', length: 100, default: '' })
  accountName: string;

  @Column({ name: 'play_count', default: 0 })
  playCount: number;

  @Column({ name: 'like_count', default: 0 })
  likeCount: number;

  @Column({ name: 'comment_count', default: 0 })
  commentCount: number;

  @Column({ name: 'share_count', default: 0 })
  shareCount: number;

  @Column({ default: 0 })
  exposure: number;

  @Column({ default: 0 })
  viewers: number;

  @Column({ length: 50, default: '0min' })
  duration: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
