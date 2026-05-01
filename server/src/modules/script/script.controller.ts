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
import { ScriptService } from './script.service';
import { CreateScriptDto, UpdateScriptDto } from './dto/script.dto';

@Controller('script')
export class ScriptController {
  constructor(private readonly scriptService: ScriptService) {}

  @Get('list')
  findAll(@Query('status') status?: string) {
    return this.scriptService.findAll(status);
  }

  @Get('stats')
  getStats() {
    return this.scriptService.getStats();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.scriptService.findOne(id);
  }

  @Post('add')
  create(@Body() dto: CreateScriptDto) {
    return this.scriptService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateScriptDto) {
    return this.scriptService.update(id, dto);
  }

  @Delete('batch')
  batchRemove(@Body() body: { ids: number[] }) {
    return this.scriptService.batchRemove(body.ids);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.scriptService.remove(id);
  }
}
