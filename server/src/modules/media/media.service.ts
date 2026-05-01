import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MediaData } from './entities/media-data.entity';
import { CreateMediaDto } from './dto/create-media.dto';
import { EventsGateway } from '../gateway/events.gateway';
import { DataHistoryService } from '../data-history/data-history.service';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaData)
    private mediaRepository: Repository<MediaData>,
    private eventsGateway: EventsGateway,
    private dataHistoryService: DataHistoryService,
  ) {}

  private async saveHistory(
    record: MediaData,
    recordDate: string = new Date().toISOString().split('T')[0],
  ) {
    await this.dataHistoryService.upsertByDate({
      platform: 'media',
      recordId: record.id,
      title: record.title,
      readCount: record.readCount,
      likeCount: record.likeCount,
      commentCount: record.commentCount,
      shareCount: record.shareCount || 0,
      recordDate: new Date(recordDate),
    });
  }

  async create(dto: CreateMediaDto): Promise<MediaData> {
    const { recordDate, ...data } = dto;
    const record = this.mediaRepository.create(data);
    const saved = await this.mediaRepository.save(record);
    this.eventsGateway.emitDataUpdate('media', saved);
    await this.saveHistory(saved, recordDate);
    return saved;
  }

  async findAll(platform?: string): Promise<MediaData[]> {
    let data: MediaData[];
    if (platform) {
      data = await this.mediaRepository.find({
        where: { platform },
        order: { createTime: 'DESC' },
      });
    } else {
      data = await this.mediaRepository.find({
        order: { createTime: 'DESC' },
      });
    }

    for (const d of data) {
      const previous = await this.dataHistoryService.findPreviousDay(
        'media',
        d.id,
        new Date().toISOString().split('T')[0],
      );
      (d as any).readCountGrowth = previous
        ? d.readCount - (previous.readCount || 0)
        : 0;
      (d as any).likeCountGrowth = previous
        ? d.likeCount - (previous.likeCount || 0)
        : 0;
    }

    return data;
  }

  async findOne(id: number): Promise<MediaData | null> {
    return this.mediaRepository.findOne({ where: { id } });
  }

  async update(id: number, dto: CreateMediaDto): Promise<MediaData | null> {
    const { recordDate, ...data } = dto;
    await this.mediaRepository.update(id, data);
    const updated = await this.mediaRepository.findOne({ where: { id } });
    if (updated) {
      this.eventsGateway.emitDataUpdate('media', updated);
      await this.saveHistory(updated, recordDate);
    }
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.mediaRepository.delete(id);
    await this.dataHistoryService.removeByRecordId('media', id);
  }

  async batchRemove(ids: number[]): Promise<void> {
    await this.mediaRepository.delete({ id: In(ids) });
    await this.dataHistoryService.batchRemoveByRecordIds('media', ids);
  }

  async getSummary(): Promise<{ totalReadCount: number; totalLikeCount: number; totalCommentCount: number; totalShareCount: number }> {
    const result = await this.mediaRepository
      .createQueryBuilder('m')
      .select([
        'COALESCE(SUM(m.read_count), 0) as totalReadCount',
        'COALESCE(SUM(m.like_count), 0) as totalLikeCount',
        'COALESCE(SUM(m.comment_count), 0) as totalCommentCount',
        'COALESCE(SUM(m.share_count), 0) as totalShareCount',
      ])
      .getRawOne();

    return {
      totalReadCount: Number(result.totalReadCount) || 0,
      totalLikeCount: Number(result.totalLikeCount) || 0,
      totalCommentCount: Number(result.totalCommentCount) || 0,
      totalShareCount: Number(result.totalShareCount) || 0,
    };
  }

  async getPlatformDistribution() {
    return this.mediaRepository
      .createQueryBuilder('m')
      .select([
        'm.platform as platform',
        'SUM(m.read_count) as totalReadCount',
        'SUM(m.like_count) as totalLikeCount',
        'SUM(m.comment_count) as totalCommentCount',
      ])
      .groupBy('m.platform')
      .getRawMany();
  }

  async getArticleRanking(limit: number = 10) {
    return this.mediaRepository.find({
      order: { readCount: 'DESC' },
      take: limit,
    });
  }

  async getTrend(days: number = 7) {
    const dateCondition = `DATE(m.create_time) >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)`;
    return this.mediaRepository
      .createQueryBuilder('m')
      .select([
        'DATE(m.create_time) as date',
        'SUM(m.read_count) as readCount',
        'SUM(m.like_count) as likeCount',
        'SUM(m.comment_count) as commentCount',
      ])
      .where(dateCondition)
      .groupBy('DATE(m.create_time)')
      .orderBy('date', 'ASC')
      .getRawMany();
  }
}
