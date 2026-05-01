import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shooting } from './entities/shooting.entity';
import { ShootingService } from './shooting.service';
import { ShootingController } from './shooting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Shooting])],
  controllers: [ShootingController],
  providers: [ShootingService],
})
export class ShootingModule {}
