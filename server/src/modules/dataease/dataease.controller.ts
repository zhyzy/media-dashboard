import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { DataeaseService } from './dataease.service';
import { ApiKeyGuard } from './guards/api-key.guard';

@Controller('dataease')
export class DataeaseController {
  constructor(private readonly dataeaseService: DataeaseService) {}

  @Post('keys')
  async createKey(@Body() body: { name?: string }) {
    return this.dataeaseService.generateApiKey(body.name || '默认数据源');
  }

  @Get('keys')
  async listKeys() {
    const keys = await this.dataeaseService.findAll();
    return keys.map((k) => ({
      id: k.id,
      apiKey: k.apiKey,
      name: k.name,
      isActive: k.isActive,
      allowedTables: k.allowedTables,
      createTime: k.createTime,
    }));
  }

  @Delete('keys/:id')
  async deleteKey(@Param('id', ParseIntPipe) id: number) {
    await this.dataeaseService.remove(id);
    return { success: true };
  }

  @Post('keys/:id/toggle')
  async toggleKey(@Param('id', ParseIntPipe) id: number) {
    return this.dataeaseService.toggleActive(id);
  }

  @Get('datasource/douyin')
  @UseGuards(ApiKeyGuard)
  async getDouyinData(@Query('date') date?: string) {
    return this.dataeaseService.getDouyinData(date);
  }

  @Get('datasource/kuaishou')
  @UseGuards(ApiKeyGuard)
  async getKuaishouData(@Query('date') date?: string) {
    return this.dataeaseService.getKuaishouData(date);
  }

  @Get('datasource/video-account')
  @UseGuards(ApiKeyGuard)
  async getVideoAccountData(@Query('date') date?: string) {
    return this.dataeaseService.getVideoAccountData(date);
  }

  @Get('datasource/live')
  @UseGuards(ApiKeyGuard)
  async getLiveData(@Query('platform') platform?: string) {
    return this.dataeaseService.getLiveData(platform);
  }

  @Get('datasource/media')
  @UseGuards(ApiKeyGuard)
  async getMediaData(@Query('platform') platform?: string) {
    return this.dataeaseService.getMediaData(platform);
  }

  @Get('datasource/short-video')
  @UseGuards(ApiKeyGuard)
  async getShortVideoCombined(@Query('platform') platform?: string) {
    return this.dataeaseService.getShortVideoCombined(platform);
  }

  @Get('datasource/summary')
  @UseGuards(ApiKeyGuard)
  async getSummary() {
    return this.dataeaseService.getSummaryData();
  }

  @Get('datasource/all')
  @UseGuards(ApiKeyGuard)
  async getAllData() {
    return this.dataeaseService.getAllData();
  }

  @Get('datasource/overview')
  @UseGuards(ApiKeyGuard)
  async getOverview() {
    return this.dataeaseService.getOverviewData();
  }

  @Get('datasource/tables')
  @UseGuards(ApiKeyGuard)
  async getTableList() {
    return {
      tables: [
        { name: 'douyin', description: '抖音数据', fields: ['id', 'accountName', 'playCount', 'likeCount', 'commentCount', 'shareCount', 'date'] },
        { name: 'kuaishou', description: '快手数据', fields: ['id', 'accountName', 'playCount', 'likeCount', 'commentCount', 'shareCount', 'exposure', 'viewers', 'duration', 'date'] },
        { name: 'videoAccount', description: '视频号数据', fields: ['id', 'accountName', 'playCount', 'likeCount', 'commentCount', 'shareCount', 'date'] },
        { name: 'live', description: '直播数据', fields: ['id', 'platform', 'accountName', 'exposure', 'viewers', 'avgStayDuration', 'salesAmount', 'date'] },
        { name: 'media', description: '自媒体数据', fields: ['id', 'platform', 'title', 'publisher', 'publishStatus', 'publishDate', 'readCount', 'likeCount', 'commentCount', 'shareCount', 'date'] },
        { name: 'shortVideo', description: '短视频合并数据', fields: ['id', 'platform', 'accountName', 'playCount', 'likeCount', 'commentCount', 'shareCount', 'date'] },
        { name: 'summary', description: '汇总数据', fields: ['douyin', 'kuaishou', 'videoAccount', 'live', 'media'] },
        { name: 'all', description: '全部数据合并', fields: ['type', 'accountName', 'playCount', 'likeCount', 'commentCount', 'shareCount', 'readCount', 'exposure', 'viewers', 'salesAmount', 'date'] },
        { name: 'overview', description: '全平台总览', fields: ['totalViews', 'totalLikes', 'totalShares', 'totalForwards', 'totalComments', 'breakdown'] },
      ],
    };
  }
}
