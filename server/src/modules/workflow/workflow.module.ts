import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Script } from '../script/entities/script.entity';
import { Shooting } from '../shooting/entities/shooting.entity';
import { Publish } from '../publish/entities/publish.entity';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Script, Shooting, Publish])],
  controllers: [WorkflowController],
  providers: [WorkflowService],
})
export class WorkflowModule {}
