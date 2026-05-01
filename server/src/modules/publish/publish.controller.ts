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
import { PublishService } from './publish.service';
import { CreatePublishDto, UpdatePublishDto } from './dto/publish.dto';

@Controller('publish')
export class PublishController {
  constructor(private readonly publishService: PublishService) {}

  @Get('list')
  findAll(@Query('status') status?: string, @Query('platform') platform?: string) {
    return this.publishService.findAll(status, platform);
  }

  @Get('stats')
  getStats() {
    return this.publishService.getStats();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.publishService.findOne(id);
  }

  @Post('add')
  create(@Body() dto: CreatePublishDto) {
    return this.publishService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePublishDto) {
    return this.publishService.update(id, dto);
  }

  @Delete('batch')
  batchRemove(@Body() body: { ids: number[] }) {
    return this.publishService.batchRemove(body.ids);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.publishService.remove(id);
  }
}
