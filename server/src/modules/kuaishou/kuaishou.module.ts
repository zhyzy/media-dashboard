import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KuaishouService } from './kuaishou.service';
import { KuaishouController } from './kuaishou.controller';
import { KuaishouData } from './entities/kuaishou-data.entity';
import { GatewayModule } from '../gateway/gateway.module';
import { DataHistoryModule } from '../data-history/data-history.module';

@Module({
  imports: [TypeOrmModule.forFeature([KuaishouData]), GatewayModule, DataHistoryModule],
  controllers: [KuaishouController],
  providers: [KuaishouService],
  exports: [KuaishouService],
})
export class KuaishouModule {}
