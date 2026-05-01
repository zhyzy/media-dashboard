import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { LiveService } from './live.service';
import { CreateLiveDto } from './dto/create-live.dto';

@Controller('live')
export class LiveController {
  constructor(private readonly liveService: LiveService) {}

  @Post('add')
  create(@Body() dto: CreateLiveDto) {
    return this.liveService.create(dto);
  }

  @Get('list')
  findAll(@Query('platform') platform?: string) {
    return this.liveService.findAll(platform);
  }

  @Get('summary')
  getSummary() {
    return this.liveService.getSummary();
  }

  @Get('trend')
  getTrend(@Query('days', ParseIntPipe) days: number = 7) {
    return this.liveService.getTrend(days);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.liveService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateLiveDto) {
    return this.liveService.update(id, dto);
  }

  @Delete('batch')
  batchRemove(@Body() body: { ids: number[] }) {
    return this.liveService.batchRemove(body.ids);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.liveService.remove(id);
  }
}
