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
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post('add')
  create(@Body() dto: CreateStaffDto) {
    return this.staffService.create(dto);
  }

  @Get('list')
  findAll(@Query('role') role?: string) {
    return this.staffService.findAll(role);
  }

  @Get('roles')
  getRoles() {
    return this.staffService.getRoles();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateStaffDto) {
    return this.staffService.update(id, dto);
  }

  @Delete('batch')
  batchRemove(@Body() body: { ids: number[] }) {
    return this.staffService.batchRemove(body.ids);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.remove(id);
  }
}
