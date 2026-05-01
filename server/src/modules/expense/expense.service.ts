import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  async create(dto: CreateExpenseDto): Promise<Expense> {
    const record = this.expenseRepository.create(dto);
    return this.expenseRepository.save(record);
  }

  async findAll(department?: string, category?: string): Promise<Expense[]> {
    const qb = this.expenseRepository.createQueryBuilder('e').orderBy('e.createTime', 'DESC');
    if (department) qb.andWhere('e.department = :department', { department });
    if (category) qb.andWhere('e.category = :category', { category });
    return qb.getMany();
  }

  async findOne(id: number): Promise<Expense | null> {
    return this.expenseRepository.findOne({ where: { id } });
  }

  async update(id: number, dto: CreateExpenseDto): Promise<Expense | null> {
    await this.expenseRepository.update(id, dto);
    return this.expenseRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.expenseRepository.delete(id);
  }

  async batchRemove(ids: number[]): Promise<void> {
    await this.expenseRepository.delete({ id: In(ids) });
  }

  async getSummary() {
    const total = await this.expenseRepository
      .createQueryBuilder('e')
      .select('COALESCE(SUM(e.amount), 0)', 'totalAmount')
      .getRawOne();

    const byCategory = await this.expenseRepository
      .createQueryBuilder('e')
      .select(['e.category as category', 'COALESCE(SUM(e.amount), 0) as totalAmount'])
      .groupBy('e.category')
      .getRawMany();

    const byMonth = await this.expenseRepository
      .createQueryBuilder('e')
      .select([
        "DATE_FORMAT(e.expense_date, '%Y-%m') as month",
        'COALESCE(SUM(e.amount), 0) as totalAmount',
      ])
      .groupBy("DATE_FORMAT(e.expense_date, '%Y-%m')")
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      totalAmount: Number(total.totalAmount) || 0,
      byCategory: byCategory.map((c) => ({
        category: c.category,
        totalAmount: Number(c.totalAmount) || 0,
      })),
      byMonth: byMonth.map((m) => ({
        month: m.month,
        totalAmount: Number(m.totalAmount) || 0,
      })),
    };
  }
}
