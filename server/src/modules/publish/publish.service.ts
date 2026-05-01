import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publish } from './entities/publish.entity';
import { CreatePublishDto, UpdatePublishDto } from './dto/publish.dto';

@Injectable()
export class PublishService {
  constructor(
    @InjectRepository(Publish)
    private publishRepository: Repository<Publish>,
  ) {}

  async findAll(status?: string, platform?: string): Promise<Publish[]> {
    const where: any = {};
    if (status) where.status = status;
    if (platform) where.platform = platform;
    return this.publishRepository.find({ where, order: { createTime: 'DESC' } });
  }

  async findOne(id: number): Promise<Publish | null> {
    return this.publishRepository.findOne({ where: { id } });
  }

  async create(dto: CreatePublishDto): Promise<Publish> {
    const publish = this.publishRepository.create(dto);
    return this.publishRepository.save(publish);
  }

  async update(id: number, dto: UpdatePublishDto): Promise<Publish | null> {
    await this.publishRepository.update(id, dto);
    return this.publishRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.publishRepository.delete(id);
  }

  async batchRemove(ids: number[]): Promise<void> {
    await this.publishRepository.delete(ids);
  }

  async getStats(): Promise<any> {
    const total = await this.publishRepository.count();
    const byStatus = await this.publishRepository
      .createQueryBuilder('publish')
      .select('publish.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('publish.status')
      .getRawMany();

    const byPlatform = await this.publishRepository
      .createQueryBuilder('publish')
      .select('publish.platform', 'platform')
      .addSelect('COUNT(*)', 'count')
      .groupBy('publish.platform')
      .getRawMany();

    return { total, byStatus, byPlatform };
  }
}
