import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DouyinService } from './douyin.service';
import { DouyinController } from './douyin.controller';
import { DouyinData } from './entities/douyin-data.entity';
import { GatewayModule } from '../gateway/gateway.module';
import { DataHistoryModule } from '../data-history/data-history.module';

@Module({
  imports: [TypeOrmModule.forFeature([DouyinData]), GatewayModule, DataHistoryModule],
  controllers: [DouyinController],
  providers: [DouyinService],
  exports: [DouyinService],
})
export class DouyinModule {}
