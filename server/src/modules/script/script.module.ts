import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Script } from './entities/script.entity';
import { ScriptService } from './script.service';
import { ScriptController } from './script.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Script])],
  controllers: [ScriptController],
  providers: [ScriptService],
})
export class ScriptModule {}
