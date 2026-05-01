import { Controller, Get, Query } from '@nestjs/common';
import { WorkflowService } from './workflow.service';

@Controller('workflow')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get('overview')
  getOverview() {
    return this.workflowService.getOverview();
  }

  @Get('recent-scripts')
  getRecentScripts(@Query('limit') limit?: string) {
    return this.workflowService.getRecentScripts(limit ? parseInt(limit, 10) : 5);
  }

  @Get('recent-shootings')
  getRecentShootings(@Query('limit') limit?: string) {
    return this.workflowService.getRecentShootings(limit ? parseInt(limit, 10) : 5);
  }

  @Get('recent-publishes')
  getRecentPublishes(@Query('limit') limit?: string) {
    return this.workflowService.getRecentPublishes(limit ? parseInt(limit, 10) : 5);
  }
}
