import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { VideoAccountData } from './entities/video-account-data.entity';
import { CreateVideoAccountDto } from './dto/create-video-account.dto';
import { EventsGateway } from '../gateway/events.gateway';
import { DataHistoryService } from '../data-history/data-history.service';

@Injectable()
export class VideoAccountService {
  constructor(
    @InjectRepository(VideoAccountData)
    private videoAccountRepository: Repository<VideoAccountData>,
    private eventsGateway: EventsGateway,
    private dataHistoryService: DataHistoryService,
  ) {}

  private async saveHistory(
    record: VideoAccountData,
    recordDate: string = new Date().toISOString().split('T')[0],
  ) {
    await this.dataHistoryService.upsertByDate({
      platform: 'video_account',
      recordId: record.id,
      accountName: record.accountName,
      playCount: record.playCount,
      likeCount: record.likeCount,
      commentCount: record.commentCount,
      shareCount: record.shareCount,
      recordDate: new Date(recordDate),
    });
  }

  async create(dto: CreateVideoAccountDto): Promise<VideoAccountData> {
    const { recordDate, ...data } = dto;
    const record = this.videoAccountRepository.create(data);
    const saved = await this.videoAccountRepository.save(record);
    this.eventsGateway.emitDataUpdate('videoAccount', saved);
    await this.saveHistory(saved, recordDate);
    return saved;
  }

  async findAll(): Promise<VideoAccountData[]> {
    const data = await this.videoAccountRepository.find({ order: { createTime: 'DESC' } });

    for (const d of data) {
      const previous = await this.dataHistoryService.findPreviousDay(
        'video_account',
        d.id,
        new Date().toISOString().split('T')[0],
      );
      (d as any).playCountGrowth = previous
        ? d.playCount - (previous.playCount || 0)
        : 0;
      (d as any).likeCountGrowth = previous
        ? d.likeCount - (previous.likeCount || 0)
        : 0;
    }

    return data;
  }

  async findOne(id: number): Promise<VideoAccountData | null> {
    return this.videoAccountRepository.findOne({ where: { id } });
  }

  async update(id: number, dto: CreateVideoAccountDto): Promise<VideoAccountData | null> {
    const { recordDate, ...data } = dto;
    await this.videoAccountRepository.update(id, data);
    const updated = await this.videoAccountRepository.findOne({ where: { id } });
    if (updated) {
      this.eventsGateway.emitDataUpdate('videoAccount', updated);
      await this.saveHistory(updated, recordDate);
    }
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.videoAccountRepository.delete(id);
    await this.dataHistoryService.removeByRecordId('video_account', id);
  }

  async batchRemove(ids: number[]): Promise<void> {
    await this.videoAccountRepository.delete({ id: In(ids) });
    await this.dataHistoryService.batchRemoveByRecordIds('video_account', ids);
  }

  async getAccounts(): Promise<string[]> {
    const result = await this.videoAccountRepository
      .createQueryBuilder('v')
      .select('DISTINCT v.account_name', 'accountName')
      .getRawMany();
    return result.map((r) => r.accountName).filter(Boolean);
  }

  async getSummary() {
    const result = await this.videoAccountRepository
      .createQueryBuilder('v')
      .select([
        'COALESCE(SUM(v.play_count), 0) as totalPlayCount',
        'COALESCE(SUM(v.like_count), 0) as totalLikeCount',
        'COALESCE(SUM(v.comment_count), 0) as totalCommentCount',
        'COALESCE(SUM(v.share_count), 0) as totalShareCount',
      ])
      .getRawOne();

    return {
      totalPlayCount: Number(result.totalPlayCount) || 0,
      totalLikeCount: Number(result.totalLikeCount) || 0,
      totalCommentCount: Number(result.totalCommentCount) || 0,
      totalShareCount: Number(result.totalShareCount) || 0,
    };
  }

  async getTrend(days: number = 7) {
    const dateCondition = `DATE(v.create_time) >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)`;
    return this.videoAccountRepository
      .createQueryBuilder('v')
      .select([
        'DATE(v.create_time) as date',
        'SUM(v.play_count) as playCount',
        'SUM(v.like_count) as likeCount',
      ])
      .where(dateCondition)
      .groupBy('DATE(v.create_time)')
      .orderBy('date', 'ASC')
      .getRawMany();
  }
}
