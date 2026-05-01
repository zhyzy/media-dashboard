import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('todo')
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  content: string;

  @Column({ length: 20, default: 'low' })
  priority: string;

  @Column({ default: false })
  completed: boolean;

  @Column({ name: 'assignee', length: 50, default: '' })
  assignee: string;

  @Column({ name: 'created_by', length: 50, default: '' })
  createdBy: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
