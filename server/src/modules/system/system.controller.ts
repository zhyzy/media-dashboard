import { Controller, Get, Query } from '@nestjs/common';
import { SystemService } from './system.service';

@Controller()
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('user/list')
  getUserList(
    @Query('current') current?: number,
    @Query('size') size?: number,
    @Query('userName') userName?: string,
    @Query('userGender') userGender?: string,
    @Query('userPhone') userPhone?: string,
    @Query('userEmail') userEmail?: string,
    @Query('status') status?: string,
  ) {
    return this.systemService.getUserList({
      current: current ? Number(current) : undefined,
      size: size ? Number(size) : undefined,
      userName,
      userGender,
      userPhone,
      userEmail,
      status,
    });
  }

  @Get('role/list')
  getRoleList(
    @Query('current') current?: number,
    @Query('size') size?: number,
    @Query('roleName') roleName?: string,
    @Query('roleCode') roleCode?: string,
  ) {
    return this.systemService.getRoleList({
      current: current ? Number(current) : undefined,
      size: size ? Number(size) : undefined,
      roleName,
      roleCode,
    });
  }

  @Get('v3/system/menus')
  getMenuList() {
    return this.systemService.getMenuList();
  }
}
