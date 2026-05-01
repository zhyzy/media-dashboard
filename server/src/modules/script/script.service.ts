import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Script } from './entities/script.entity';
import { CreateScriptDto, UpdateScriptDto } from './dto/script.dto';

@Injectable()
export class ScriptService {
  constructor(
    @InjectRepository(Script)
    private scriptRepository: Repository<Script>,
  ) {}

  async findAll(status?: string): Promise<Script[]> {
    if (status) {
      return this.scriptRepository.find({ where: { status }, order: { createTime: 'DESC' } });
    }
    return this.scriptRepository.find({ order: { createTime: 'DESC' } });
  }

  async findOne(id: number): Promise<Script | null> {
    return this.scriptRepository.findOne({ where: { id } });
  }

  async create(dto: CreateScriptDto): Promise<Script> {
    const script = this.scriptRepository.create(dto);
    return this.scriptRepository.save(script);
  }

  async update(id: number, dto: UpdateScriptDto): Promise<Script | null> {
    await this.scriptRepository.update(id, dto);
    return this.scriptRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.scriptRepository.delete(id);
  }

  async batchRemove(ids: number[]): Promise<void> {
    await this.scriptRepository.delete(ids);
  }

  async getStats(): Promise<any> {
    const total = await this.scriptRepository.count();
    const byStatus = await this.scriptRepository
      .createQueryBuilder('script')
      .select('script.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('script.status')
      .getRawMany();

    return { total, byStatus };
  }
}
