import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DouyinData } from './entities/douyin-data.entity';
import { CreateDouyinDto } from './dto/create-douyin.dto';
import { EventsGateway } from '../gateway/events.gateway';
import { DataHistoryService } from '../data-history/data-history.service';

@Injectable()
export class DouyinService {
  constructor(
    @InjectRepository(DouyinData)
    private douyinRepository: Repository<DouyinData>,
    private eventsGateway: EventsGateway,
    private dataHistoryService: DataHistoryService,
  ) {}

  private async saveHistory(
    record: DouyinData,
    recordDate: string = new Date().toISOString().split('T')[0],
  ) {
    await this.dataHistoryService.upsertByDate({
      platform: 'douyin',
      recordId: record.id,
      accountName: record.accountName,
      playCount: record.playCount,
      likeCount: record.likeCount,
      commentCount: record.commentCount,
      shareCount: record.shareCount,
      recordDate: new Date(recordDate),
    });
  }

  async create(dto: CreateDouyinDto): Promise<DouyinData> {
    const { recordDate, ...data } = dto;
    const record = this.douyinRepository.create(data);
    const saved = await this.douyinRepository.save(record);
    this.eventsGateway.emitDataUpdate('douyin', saved);
    await this.saveHistory(saved, recordDate);
    return saved;
  }

  async findAll(): Promise<DouyinData[]> {
    const data = await this.douyinRepository.find({
      order: { createTime: 'DESC' },
    });

    // 为每个数据附加增长值
    for (const d of data) {
      const previous = await this.dataHistoryService.findPreviousDay(
        'douyin',
        d.id,
        new Date().toISOString().split('T')[0],
      );
      (d as any).playCountGrowth = previous
        ? d.playCount - (previous.playCount || 0)
        : 0;
    }

    return data;
  }

  async findOne(id: number): Promise<DouyinData | null> {
    return this.douyinRepository.findOne({ where: { id } });
  }

  async update(id: number, dto: CreateDouyinDto): Promise<DouyinData | null> {
    const { recordDate, ...data } = dto;
    await this.douyinRepository.update(id, data);
    const updated = await this.douyinRepository.findOne({ where: { id } });
    if (updated) {
      this.eventsGateway.emitDataUpdate('douyin', updated);
      await this.saveHistory(updated, recordDate);
    }
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.douyinRepository.delete(id);
    await this.dataHistoryService.removeByRecordId('douyin', id);
  }

  async batchRemove(ids: number[]): Promise<void> {
    await this.douyinRepository.delete({ id: In(ids) });
    await this.dataHistoryService.batchRemoveByRecordIds('douyin', ids);
  }

  async getAccountNames(): Promise<string[]> {
    const result = await this.douyinRepository
      .createQueryBuilder('d')
      .select('DISTINCT d.accountName', 'accountName')
      .getRawMany();
    return result.map((r) => r.accountName);
  }

  async getSummary() {
    const result = await this.douyinRepository
      .createQueryBuilder('d')
      .select([
        'COALESCE(SUM(d.play_count), 0) as totalPlayCount',
        'COALESCE(SUM(d.like_count), 0) as totalLikeCount',
        'COALESCE(SUM(d.comment_count), 0) as totalCommentCount',
        'COALESCE(SUM(d.share_count), 0) as totalShareCount',
      ])
      .getRawOne();

    return {
      totalPlayCount: Number(result.totalPlayCount) || 0,
      totalLikeCount: Number(result.totalLikeCount) || 0,
      totalCommentCount: Number(result.totalCommentCount) || 0,
      totalShareCount: Number(result.totalShareCount) || 0,
    };
  }

  async getRanking(limit: number = 10) {
    return this.douyinRepository.find({
      order: { playCount: 'DESC' },
      take: limit,
    });
  }

  async getTrend(days: number = 7) {
    const dateCondition = `DATE(d.create_time) >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)`;
    return this.douyinRepository
      .createQueryBuilder('d')
      .select([
        'DATE(d.create_time) as date',
        'SUM(d.play_count) as playCount',
        'SUM(d.like_count) as likeCount',
        'SUM(d.comment_count) as commentCount',
      ])
      .where(dateCondition)
      .groupBy('DATE(d.create_time)')
      .orderBy('date', 'ASC')
      .getRawMany();
  }
}
