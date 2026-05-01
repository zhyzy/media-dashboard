import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
  ) {}

  async findAll(): Promise<Todo[]> {
    return this.todoRepository.find({
      order: { createTime: 'DESC' },
    });
  }

  async create(data: Partial<Todo>): Promise<Todo> {
    const todo = this.todoRepository.create(data);
    return this.todoRepository.save(todo);
  }

  async update(id: number, data: Partial<Todo>): Promise<Todo | null> {
    await this.todoRepository.update(id, data);
    return this.todoRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.todoRepository.delete(id);
  }

  async toggle(id: number): Promise<Todo | null> {
    const todo = await this.todoRepository.findOne({ where: { id } });
    if (!todo) return null;
    todo.completed = !todo.completed;
    return this.todoRepository.save(todo);
  }
}
