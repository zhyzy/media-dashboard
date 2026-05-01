import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataeaseController } from './dataease.controller';
import { DataeaseService } from './dataease.service';
import { DataeaseConfig } from './entities/dataease-config.entity';
import { DouyinData } from '../douyin/entities/douyin-data.entity';
import { KuaishouData } from '../kuaishou/entities/kuaishou-data.entity';
import { MediaData } from '../media/entities/media-data.entity';
import { VideoAccountData } from '../video-account/entities/video-account-data.entity';
import { LiveData } from '../live/entities/live-data.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DataeaseConfig, DouyinData, KuaishouData, MediaData, VideoAccountData, LiveData]),
  ],
  controllers: [DataeaseController],
  providers: [DataeaseService],
  exports: [DataeaseService],
})
export class DataeaseModule {}
