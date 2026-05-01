import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'department', length: 50, default: '推广部' })
  department: string;

  @Column({ name: 'category', length: 50 })
  category: string;

  @Column({ length: 255 })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount: number;

  @Column({ name: 'expense_date', length: 20 })
  expenseDate: string;

  @Column({ name: 'created_by', length: 100, default: '' })
  createdBy: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
