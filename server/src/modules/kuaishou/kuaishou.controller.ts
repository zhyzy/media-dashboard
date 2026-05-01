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
import { KuaishouService } from './kuaishou.service';
import { CreateKuaishouDto } from './dto/create-kuaishou.dto';

@Controller('kuaishou')
export class KuaishouController {
  constructor(private readonly kuaishouService: KuaishouService) {}

  @Post('add')
  create(@Body() dto: CreateKuaishouDto) {
    return this.kuaishouService.create(dto);
  }

  @Get('list')
  findAll() {
    return this.kuaishouService.findAll();
  }

  @Get('accounts')
  getAccounts() {
    return this.kuaishouService.getAccounts();
  }

  @Get('summary')
  getSummary() {
    return this.kuaishouService.getSummary();
  }

  @Get('trend')
  getTrend(@Query('days', ParseIntPipe) days: number = 7) {
    return this.kuaishouService.getTrend(days);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.kuaishouService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateKuaishouDto) {
    return this.kuaishouService.update(id, dto);
  }

  @Delete('batch')
  batchRemove(@Body() body: { ids: number[] }) {
    return this.kuaishouService.batchRemove(body.ids);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.kuaishouService.remove(id);
  }
}
