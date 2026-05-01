import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { DataHistoryService } from './data-history.service';
import { DataHistory } from './entities/data-history.entity';

@Controller('data-history')
export class DataHistoryController {
  constructor(private readonly dataHistoryService: DataHistoryService) {}

  @Post()
  create(@Body() data: Partial<DataHistory>): Promise<DataHistory> {
    return this.dataHistoryService.create(data);
  }

  @Get()
  findByPlatformAndDate(
    @Query('platform') platform: string,
    @Query('date') date: string,
  ): Promise<DataHistory[]> {
    return this.dataHistoryService.findByPlatformAndDate(platform, date);
  }

  @Get('record')
  findByPlatformAndRecordId(
    @Query('platform') platform: string,
    @Query('recordId') recordId: string,
  ): Promise<DataHistory[]> {
    return this.dataHistoryService.findByPlatformAndRecordId(
      platform,
      Number(recordId),
    );
  }
}
