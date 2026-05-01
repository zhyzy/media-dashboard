import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MediaData } from './entities/media-data.entity';
import { GatewayModule } from '../gateway/gateway.module';
import { DataHistoryModule } from '../data-history/data-history.module';

@Module({
  imports: [TypeOrmModule.forFeature([MediaData]), GatewayModule, DataHistoryModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
