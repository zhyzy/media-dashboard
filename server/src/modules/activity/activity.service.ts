import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './entities/activity.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityRepository: Repository<ActivityLog>,
  ) {}

  async getRecentLogs(limit = 15): Promise<ActivityLog[]> {
    return this.activityRepository.find({
      order: { createTime: 'DESC' },
      take: limit,
    });
  }

  async createLog(data: Partial<ActivityLog>): Promise<ActivityLog> {
    const log = this.activityRepository.create(data);
    return this.activityRepository.save(log);
  }
}
