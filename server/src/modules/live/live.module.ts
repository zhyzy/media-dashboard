import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveController } from './live.controller';
import { LiveService } from './live.service';
import { LiveData } from './entities/live-data.entity';
import { GatewayModule } from '../gateway/gateway.module';
import { DataHistoryModule } from '../data-history/data-history.module';

@Module({
  imports: [TypeOrmModule.forFeature([LiveData]), GatewayModule, DataHistoryModule],
  controllers: [LiveController],
  providers: [LiveService],
  exports: [LiveService],
})
export class LiveModule {}
