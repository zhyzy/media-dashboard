import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publish } from './entities/publish.entity';
import { PublishService } from './publish.service';
import { PublishController } from './publish.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Publish])],
  controllers: [PublishController],
  providers: [PublishService],
})
export class PublishModule {}
