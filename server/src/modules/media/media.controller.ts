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
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('add')
  create(@Body() dto: CreateMediaDto) {
    return this.mediaService.create(dto);
  }

  @Get('list')
  findAll(@Query('platform') platform?: string) {
    return this.mediaService.findAll(platform);
  }

  @Get('summary')
  getSummary() {
    return this.mediaService.getSummary();
  }

  @Get('distribution')
  getPlatformDistribution() {
    return this.mediaService.getPlatformDistribution();
  }

  @Get('ranking')
  getArticleRanking(@Query('limit', ParseIntPipe) limit: number = 10) {
    return this.mediaService.getArticleRanking(limit);
  }

  @Get('trend')
  getTrend(@Query('days', ParseIntPipe) days: number = 7) {
    return this.mediaService.getTrend(days);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateMediaDto) {
    return this.mediaService.update(id, dto);
  }

  @Delete('batch')
  batchRemove(@Body() body: { ids: number[] }) {
    return this.mediaService.batchRemove(body.ids);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.remove(id);
  }
}
