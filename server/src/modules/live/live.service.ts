import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { LiveData } from './entities/live-data.entity';
import { CreateLiveDto } from './dto/create-live.dto';
import { EventsGateway } from '../gateway/events.gateway';
import { DataHistoryService } from '../data-history/data-history.service';

@Injectable()
export class LiveService {
  constructor(
    @InjectRepository(LiveData)
    private liveRepository: Repository<LiveData>,
    private eventsGateway: EventsGateway,
    private dataHistoryService: DataHistoryService,
  ) {}

  private async saveHistory(
    record: LiveData,
    recordDate: string = new Date().toISOString().split('T')[0],
  ) {
    await this.dataHistoryService.upsertByDate({
      platform: 'live',
      recordId: record.id,
      accountName: record.accountName,
      exposure: record.exposure,
      viewers: record.viewers,
      salesAmount: record.salesAmount,
      recordDate: new Date(recordDate),
    });
  }

  async create(dto: CreateLiveDto): Promise<LiveData> {
    const { recordDate, ...data } = dto;
    const record = this.liveRepository.create(data);
    const saved = await this.liveRepository.save(record);
    this.eventsGateway.emitDataUpdate('live', saved);
    await this.saveHistory(saved, recordDate);
    return saved;
  }

  async findAll(platform?: string): Promise<LiveData[]> {
    let data: LiveData[];
    if (platform) {
      data = await this.liveRepository.find({ where: { platform }, order: { createTime: 'DESC' } });
    } else {
      data = await this.liveRepository.find({ order: { createTime: 'DESC' } });
    }

    for (const d of data) {
      const previous = await this.dataHistoryService.findPreviousDay(
        'live',
        d.id,
        new Date().toISOString().split('T')[0],
      );
      (d as any).exposureGrowth = previous
        ? d.exposure - (previous.exposure || 0)
        : 0;
      (d as any).viewersGrowth = previous
        ? d.viewers - (previous.viewers || 0)
        : 0;
      (d as any).salesAmountGrowth = previous
        ? Number(d.salesAmount) - Number(previous.salesAmount || 0)
        : 0;
    }

    return data;
  }

  async findOne(id: number): Promise<LiveData | null> {
    return this.liveRepository.findOne({ where: { id } });
  }

  async update(id: number, dto: CreateLiveDto): Promise<LiveData | null> {
    const { recordDate, ...data } = dto;
    await this.liveRepository.update(id, data);
    const updated = await this.liveRepository.findOne({ where: { id } });
    if (updated) {
      this.eventsGateway.emitDataUpdate('live', updated);
      await this.saveHistory(updated, recordDate);
    }
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.liveRepository.delete(id);
    await this.dataHistoryService.removeByRecordId('live', id);
  }

  async batchRemove(ids: number[]): Promise<void> {
    await this.liveRepository.delete({ id: In(ids) });
    await this.dataHistoryService.batchRemoveByRecordIds('live', ids);
  }

  async getSummary() {
    const result = await this.liveRepository
      .createQueryBuilder('l')
      .select([
        'COALESCE(SUM(l.exposure), 0) as totalExposure',
        'COALESCE(SUM(l.viewers), 0) as totalViewers',
        'COALESCE(SUM(l.sales_amount), 0) as totalSalesAmount',
      ])
      .getRawOne();

    return {
      totalExposure: Number(result.totalExposure) || 0,
      totalViewers: Number(result.totalViewers) || 0,
      totalSalesAmount: Number(result.totalSalesAmount) || 0,
    };
  }

  async getTrend(days: number = 7) {
    const dateCondition = `DATE(l.create_time) >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)`;
    return this.liveRepository
      .createQueryBuilder('l')
      .select([
        'DATE(l.create_time) as date',
        'SUM(l.exposure) as exposure',
        'SUM(l.viewers) as viewers',
        'SUM(l.sales_amount) as salesAmount',
      ])
      .where(dateCondition)
      .groupBy('DATE(l.create_time)')
      .orderBy('date', 'ASC')
      .getRawMany();
  }
}
