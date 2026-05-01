import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('short-video')
  getShortVideoCombined(@Query('platform') platform?: string) {
    return this.dashboardService.getShortVideoCombined(platform);
  }

  @Get('trend')
  getTrend(@Query('days', ParseIntPipe) days: number = 7) {
    return this.dashboardService.getTrend(days);
  }

  @Get('rankings')
  getRankings() {
    return this.dashboardService.getRankings();
  }
}
