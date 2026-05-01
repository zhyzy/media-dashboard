import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ShootingService } from './shooting.service';
import { CreateShootingDto, UpdateShootingDto } from './dto/shooting.dto';

@Controller('shooting')
export class ShootingController {
  constructor(private readonly shootingService: ShootingService) {}

  @Get('list')
  findAll(@Query('status') status?: string) {
    return this.shootingService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shootingService.findOne(id);
  }

  @Post('add')
  create(@Body() dto: CreateShootingDto) {
    return this.shootingService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateShootingDto) {
    return this.shootingService.update(id, dto);
  }

  @Delete('batch')
  batchRemove(@Body() body: { ids: number[] }) {
    return this.shootingService.batchRemove(body.ids);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.shootingService.remove(id);
  }
}
