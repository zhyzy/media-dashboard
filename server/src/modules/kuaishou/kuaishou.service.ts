import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { KuaishouData } from './entities/kuaishou-data.entity';
import { CreateKuaishouDto } from './dto/create-kuaishou.dto';
import { EventsGateway } from '../gateway/events.gateway';
import { DataHistoryService } from '../data-history/data-history.service';

@Injectable()
export class KuaishouService {
  constructor(
    @InjectRepository(KuaishouData)
    private kuaishouRepository: Repository<KuaishouData>,
    private eventsGateway: EventsGateway,
    private dataHistoryService: DataHistoryService,
  ) {}

  private async saveHistory(
    record: KuaishouData,
    recordDate: string = new Date().toISOString().split('T')[0],
  ) {
    await this.dataHistoryService.upsertByDate({
      platform: 'kuaishou',
      recordId: record.id,
      accountName: record.accountName,
      playCount: record.playCount,
      likeCount: record.likeCount,
      commentCount: record.commentCount,
      shareCount: record.shareCount,
      exposure: record.exposure,
      viewers: record.viewers,
      recordDate: new Date(recordDate),
    });
  }

  async create(dto: CreateKuaishouDto): Promise<KuaishouData> {
    const { recordDate, ...data } = dto;
    const record = this.kuaishouRepository.create(data);
    const saved = await this.kuaishouRepository.save(record);
    this.eventsGateway.emitDataUpdate('kuaishou', saved);
    await this.saveHistory(saved, recordDate);
    return saved;
  }

  async findAll(): Promise<KuaishouData[]> {
    const data = await this.kuaishouRepository.find({
      order: { createTime: 'DESC' },
    });

    for (const d of data) {
      const previous = await this.dataHistoryService.findPreviousDay(
        'kuaishou',
        d.id,
        new Date().toISOString().split('T')[0],
      );
      (d as any).playCountGrowth = previous
        ? d.playCount - (previous.playCount || 0)
        : 0;
      (d as any).likeCountGrowth = previous
        ? d.likeCount - (previous.likeCount || 0)
        : 0;
      (d as any).exposureGrowth = previous
        ? d.exposure - (previous.exposure || 0)
        : 0;
      (d as any).viewersGrowth = previous
        ? d.viewers - (previous.viewers || 0)
        : 0;
    }

    return data;
  }

  async findOne(id: number): Promise<KuaishouData | null> {
    return this.kuaishouRepository.findOne({ where: { id } });
  }

  async update(id: number, dto: CreateKuaishouDto): Promise<KuaishouData | null> {
    const { recordDate, ...data } = dto;
    await this.kuaishouRepository.update(id, data);
    const updated = await this.kuaishouRepository.findOne({ where: { id } });
    if (updated) {
      this.eventsGateway.emitDataUpdate('kuaishou', updated);
      await this.saveHistory(updated, recordDate);
    }
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.kuaishouRepository.delete(id);
    await this.dataHistoryService.removeByRecordId('kuaishou', id);
  }

  async batchRemove(ids: number[]): Promise<void> {
    await this.kuaishouRepository.delete({ id: In(ids) });
    await this.dataHistoryService.batchRemoveByRecordIds('kuaishou', ids);
  }

  async getAccounts(): Promise<string[]> {
    const result = await this.kuaishouRepository
      .createQueryBuilder('k')
      .select('DISTINCT k.account_name', 'accountName')
      .getRawMany();
    return result.map((r) => r.accountName).filter(Boolean);
  }

  async getSummary() {
    const result = await this.kuaishouRepository
      .createQueryBuilder('k')
      .select([
        'COALESCE(SUM(k.play_count), 0) as totalPlayCount',
        'COALESCE(SUM(k.like_count), 0) as totalLikeCount',
        'COALESCE(SUM(k.comment_count), 0) as totalCommentCount',
        'COALESCE(SUM(k.share_count), 0) as totalShareCount',
        'COALESCE(SUM(k.exposure), 0) as totalExposure',
        'COALESCE(SUM(k.viewers), 0) as totalViewers',
      ])
      .getRawOne();

    return {
      totalPlayCount: Number(result.totalPlayCount) || 0,
      totalLikeCount: Number(result.totalLikeCount) || 0,
      totalCommentCount: Number(result.totalCommentCount) || 0,
      totalShareCount: Number(result.totalShareCount) || 0,
      totalExposure: Number(result.totalExposure) || 0,
      totalViewers: Number(result.totalViewers) || 0,
    };
  }

  async getTrend(days: number = 7) {
    const dateCondition = `DATE(k.create_time) >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)`;
    return this.kuaishouRepository
      .createQueryBuilder('k')
      .select([
        'DATE(k.create_time) as date',
        'SUM(k.play_count) as playCount',
        'SUM(k.like_count) as likeCount',
        'SUM(k.exposure) as exposure',
        'SUM(k.viewers) as viewers',
      ])
      .where(dateCondition)
      .groupBy('DATE(k.create_time)')
      .orderBy('date', 'ASC')
      .getRawMany();
  }
}
