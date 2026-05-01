import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Script } from '../script/entities/script.entity';
import { Shooting } from '../shooting/entities/shooting.entity';
import { Publish } from '../publish/entities/publish.entity';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(Script)
    private scriptRepository: Repository<Script>,
    @InjectRepository(Shooting)
    private shootingRepository: Repository<Shooting>,
    @InjectRepository(Publish)
    private publishRepository: Repository<Publish>,
  ) {}

  async getOverview(): Promise<any> {
    const scriptTotal = await this.scriptRepository.count();
    const scriptByStatus = await this.scriptRepository
      .createQueryBuilder('s')
      .select('s.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('s.status')
      .getRawMany();

    const shootingTotal = await this.shootingRepository.count();
    const shootingByStatus = await this.shootingRepository
      .createQueryBuilder('s')
      .select('s.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('s.status')
      .getRawMany();

    const publishTotal = await this.publishRepository.count();
    const publishByStatus = await this.publishRepository
      .createQueryBuilder('p')
      .select('p.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('p.status')
      .getRawMany();
    const publishByPlatform = await this.publishRepository
      .createQueryBuilder('p')
      .select('p.platform', 'platform')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(p.viewCount)', 'totalViews')
      .addSelect('SUM(p.likeCount)', 'totalLikes')
      .addSelect('SUM(p.shareCount)', 'totalShares')
      .groupBy('p.platform')
      .getRawMany();

    const totalViews = await this.publishRepository
      .createQueryBuilder('p')
      .select('SUM(p.viewCount)', 'total')
      .getRawOne();

    const totalLikes = await this.publishRepository
      .createQueryBuilder('p')
      .select('SUM(p.likeCount)', 'total')
      .getRawOne();

    const totalShares = await this.publishRepository
      .createQueryBuilder('p')
      .select('SUM(p.shareCount)', 'total')
      .getRawOne();

    return {
      script: { total: scriptTotal, byStatus: scriptByStatus },
      shooting: { total: shootingTotal, byStatus: shootingByStatus },
      publish: { total: publishTotal, byStatus: publishByStatus, byPlatform: publishByPlatform },
      traffic: {
        totalViews: Number(totalViews?.total) || 0,
        totalLikes: Number(totalLikes?.total) || 0,
        totalShares: Number(totalShares?.total) || 0,
      },
    };
  }

  async getRecentScripts(limit: number = 5): Promise<Script[]> {
    return this.scriptRepository.find({ order: { createTime: 'DESC' }, take: limit });
  }

  async getRecentShootings(limit: number = 5): Promise<Shooting[]> {
    return this.shootingRepository.find({ order: { createTime: 'DESC' }, take: limit });
  }

  async getRecentPublishes(limit: number = 5): Promise<Publish[]> {
    return this.publishRepository.find({ order: { createTime: 'DESC' }, take: limit });
  }
}
