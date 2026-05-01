import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoAccountController } from './video-account.controller';
import { VideoAccountService } from './video-account.service';
import { VideoAccountData } from './entities/video-account-data.entity';
import { GatewayModule } from '../gateway/gateway.module';
import { DataHistoryModule } from '../data-history/data-history.module';

@Module({
  imports: [TypeOrmModule.forFeature([VideoAccountData]), GatewayModule, DataHistoryModule],
  controllers: [VideoAccountController],
  providers: [VideoAccountService],
  exports: [VideoAccountService],
})
export class VideoAccountModule {}
