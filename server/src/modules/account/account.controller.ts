import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateSubAccountDto, UpdateSubAccountDto } from './dto/create-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('account')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('sub')
  createSubAccount(@Request() req, @Body() dto: CreateSubAccountDto) {
    return this.accountService.createSubAccount(req.user.id, dto);
  }

  @Get('sub/list')
  findSubAccounts(@Request() req) {
    return this.accountService.findSubAccounts(req.user.id);
  }

  @Get('permissions')
  getPermissionList() {
    return this.accountService.getPermissionList();
  }

  @Get('sub/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.accountService.findOne(id);
  }

  @Put('sub/:id')
  updateSubAccount(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSubAccountDto) {
    return this.accountService.updateSubAccount(id, dto);
  }

  @Delete('sub/batch')
  batchRemove(@Body() body: { ids: number[] }) {
    return this.accountService.batchRemove(body.ids);
  }

  @Delete('sub/:id')
  removeSubAccount(@Param('id', ParseIntPipe) id: number) {
    return this.accountService.removeSubAccount(id);
  }
}
