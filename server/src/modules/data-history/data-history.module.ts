import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataHistoryService } from './data-history.service';
import { DataHistoryController } from './data-history.controller';
import { DataHistory } from './entities/data-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DataHistory])],
  controllers: [DataHistoryController],
  providers: [DataHistoryService],
  exports: [DataHistoryService],
})
export class DataHistoryModule {}
