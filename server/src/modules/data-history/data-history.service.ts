import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataHistory } from './entities/data-history.entity';

@Injectable()
export class DataHistoryService {
  constructor(
    @InjectRepository(DataHistory)
    private dataHistoryRepository: Repository<DataHistory>,
  ) {}

  async create(data: Partial<DataHistory>): Promise<DataHistory> {
    const record = this.dataHistoryRepository.create(data);
    return this.dataHistoryRepository.save(record);
  }

  async upsertByDate(data: Partial<DataHistory>): Promise<DataHistory> {
    const existing = await this.dataHistoryRepository
      .createQueryBuilder('h')
      .where('h.platform = :platform', { platform: data.platform })
      .andWhere('h.record_id = :recordId', { recordId: data.recordId })
      .andWhere('DATE(h.record_date) = CURDATE()')
      .getOne();

    if (existing) {
      Object.assign(existing, {
        accountName: data.accountName ?? existing.accountName,
        title: data.title ?? existing.title,
        playCount: data.playCount ?? existing.playCount,
        likeCount: data.likeCount ?? existing.likeCount,
        commentCount: data.commentCount ?? existing.commentCount,
        shareCount: data.shareCount ?? existing.shareCount,
        readCount: data.readCount ?? existing.readCount,
        exposure: data.exposure ?? existing.exposure,
        viewers: data.viewers ?? existing.viewers,
        salesAmount: data.salesAmount ?? existing.salesAmount,
      });
      return this.dataHistoryRepository.save(existing);
    }

    const record = this.dataHistoryRepository.create(data);
    return this.dataHistoryRepository.save(record);
  }

  async findByPlatformAndDate(
    platform: string,
    date: string | Date,
  ): Promise<DataHistory[]> {
    const recordDate = typeof date === 'string' ? new Date(date) : date;
    return this.dataHistoryRepository.find({
      where: { platform, recordDate },
      order: { createTime: 'DESC' },
    });
  }

  async findByPlatformAndRecordId(
    platform: string,
    recordId: number,
  ): Promise<DataHistory[]> {
    return this.dataHistoryRepository.find({
      where: { platform, recordId },
      order: { createTime: 'DESC' },
    });
  }

  async findLatestByRecordId(
    platform: string,
    recordId: number,
  ): Promise<DataHistory | null> {
    return this.dataHistoryRepository.findOne({
      where: { platform, recordId },
      order: { createTime: 'DESC' },
    });
  }

  async findPreviousDay(
    platform: string,
    recordId: number,
    currentDate: string,
  ): Promise<DataHistory | null> {
    const result = await this.dataHistoryRepository
      .createQueryBuilder('h')
      .where('h.platform = :platform', { platform })
      .andWhere('h.record_id = :recordId', { recordId })
      .andWhere('h.record_date < :currentDate', { currentDate })
      .orderBy('h.record_date', 'DESC')
      .limit(1)
      .getOne();
    return result || null;
  }

  async removeByRecordId(platform: string, recordId: number): Promise<void> {
    await this.dataHistoryRepository
      .createQueryBuilder()
      .delete()
      .from(DataHistory)
      .where('platform = :platform', { platform })
      .andWhere('record_id = :recordId', { recordId })
      .execute();
  }

  async batchRemoveByRecordIds(platform: string, recordIds: number[]): Promise<void> {
    if (!recordIds.length) return;
    await this.dataHistoryRepository
      .createQueryBuilder()
      .delete()
      .from(DataHistory)
      .where('platform = :platform', { platform })
      .andWhere('record_id IN (:...recordIds)', { recordIds })
      .execute();
  }
}
