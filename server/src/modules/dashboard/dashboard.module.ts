import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { DouyinModule } from '../douyin/douyin.module';
import { KuaishouModule } from '../kuaishou/kuaishou.module';
import { MediaModule } from '../media/media.module';
import { VideoAccountModule } from '../video-account/video-account.module';
import { LiveModule } from '../live/live.module';
import { DataHistoryModule } from '../data-history/data-history.module';
import { DataHistory } from '../data-history/entities/data-history.entity';

@Module({
  imports: [
    DouyinModule,
    KuaishouModule,
    MediaModule,
    VideoAccountModule,
    LiveModule,
    DataHistoryModule,
    TypeOrmModule.forFeature([DataHistory]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
