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
import { VideoAccountService } from './video-account.service';
import { CreateVideoAccountDto } from './dto/create-video-account.dto';

@Controller('video-account')
export class VideoAccountController {
  constructor(private readonly videoAccountService: VideoAccountService) {}

  @Post('add')
  create(@Body() dto: CreateVideoAccountDto) {
    return this.videoAccountService.create(dto);
  }

  @Get('list')
  findAll() {
    return this.videoAccountService.findAll();
  }

  @Get('accounts')
  getAccounts() {
    return this.videoAccountService.getAccounts();
  }

  @Get('summary')
  getSummary() {
    return this.videoAccountService.getSummary();
  }

  @Get('trend')
  getTrend(@Query('days', ParseIntPipe) days: number = 7) {
    return this.videoAccountService.getTrend(days);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.videoAccountService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateVideoAccountDto) {
    return this.videoAccountService.update(id, dto);
  }

  @Delete('batch')
  batchRemove(@Body() body: { ids: number[] }) {
    return this.videoAccountService.batchRemove(body.ids);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.videoAccountService.remove(id);
  }
}
