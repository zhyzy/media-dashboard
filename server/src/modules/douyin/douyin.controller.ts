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
import { DouyinService } from './douyin.service';
import { CreateDouyinDto } from './dto/create-douyin.dto';

@Controller('douyin')
export class DouyinController {
  constructor(private readonly douyinService: DouyinService) {}

  @Post('add')
  create(@Body() dto: CreateDouyinDto) {
    return this.douyinService.create(dto);
  }

  @Get('list')
  findAll() {
    return this.douyinService.findAll();
  }

  @Get('accounts')
  getAccountNames() {
    return this.douyinService.getAccountNames();
  }

  @Get('summary')
  getSummary() {
    return this.douyinService.getSummary();
  }

  @Get('ranking')
  getRanking(@Query('limit', ParseIntPipe) limit: number = 10) {
    return this.douyinService.getRanking(limit);
  }

  @Get('trend')
  getTrend(@Query('days', ParseIntPipe) days: number = 7) {
    return this.douyinService.getTrend(days);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.douyinService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateDouyinDto) {
    return this.douyinService.update(id, dto);
  }

  @Delete('batch')
  batchRemove(@Body() body: { ids: number[] }) {
    return this.douyinService.batchRemove(body.ids);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.douyinService.remove(id);
  }
}
