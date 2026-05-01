import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { DataeaseConfig } from './entities/dataease-config.entity';
import { DouyinData } from '../douyin/entities/douyin-data.entity';
import { KuaishouData } from '../kuaishou/entities/kuaishou-data.entity';
import { MediaData } from '../media/entities/media-data.entity';
import { VideoAccountData } from '../video-account/entities/video-account-data.entity';
import { LiveData } from '../live/entities/live-data.entity';

@Injectable()
export class DataeaseService {
  constructor(
    @InjectRepository(DataeaseConfig)
    private configRepo: Repository<DataeaseConfig>,
    @InjectRepository(DouyinData)
    private douyinRepo: Repository<DouyinData>,
    @InjectRepository(KuaishouData)
    private kuaishouRepo: Repository<KuaishouData>,
    @InjectRepository(MediaData)
    private mediaRepo: Repository<MediaData>,
    @InjectRepository(VideoAccountData)
    private videoAccountRepo: Repository<VideoAccountData>,
    @InjectRepository(LiveData)
    private liveRepo: Repository<LiveData>,
  ) {}

  async validateApiKey(apiKey: string): Promise<DataeaseConfig> {
    const config = await this.configRepo.findOne({
      where: { apiKey, isActive: true },
    });
    if (!config) {
      throw new UnauthorizedException('无效的API Key');
    }
    return config;
  }

  async generateApiKey(name: string): Promise<DataeaseConfig> {
    const apiKey = 'de_' + crypto.randomBytes(24).toString('hex');
    const config = this.configRepo.create({
      apiKey,
      name: name || '默认数据源',
      isActive: true,
      allowedTables: JSON.stringify(['douyin', 'kuaishou', 'videoAccount', 'live', 'media', 'summary', 'all']),
    });
    return this.configRepo.save(config);
  }

  async findAll(): Promise<DataeaseConfig[]> {
    return this.configRepo.find({ order: { createTime: 'DESC' } });
  }

  async remove(id: number): Promise<void> {
    await this.configRepo.delete(id);
  }

  async toggleActive(id: number): Promise<DataeaseConfig> {
    const config = await this.configRepo.findOne({ where: { id } });
    if (!config) throw new Error('配置不存在');
    config.isActive = !config.isActive;
    return this.configRepo.save(config);
  }

  async getDouyinData(date?: string) {
    const qb = this.douyinRepo.createQueryBuilder('d').orderBy('d.createTime', 'DESC');
    if (date) qb.where('DATE(d.createTime) = :date', { date });
    const data = await qb.getMany();
    return data.map((d) => ({
      id: d.id,
      accountName: d.accountName,
      playCount: d.playCount,
      likeCount: d.likeCount,
      commentCount: d.commentCount,
      shareCount: d.shareCount,
      date: (d.createTime as any)?.toISOString?.()?.split('T')?.[0] || '',
    }));
  }

  async getKuaishouData(date?: string) {
    const qb = this.kuaishouRepo.createQueryBuilder('k').orderBy('k.createTime', 'DESC');
    if (date) qb.where('DATE(k.createTime) = :date', { date });
    const data = await qb.getMany();
    return data.map((k) => ({
      id: k.id,
      accountName: k.accountName,
      playCount: k.playCount,
      likeCount: k.likeCount,
      commentCount: k.commentCount,
      shareCount: k.shareCount,
      exposure: k.exposure,
      viewers: k.viewers,
      duration: k.duration,
      date: (k.createTime as any)?.toISOString?.()?.split('T')?.[0] || '',
    }));
  }

  async getVideoAccountData(date?: string) {
    const qb = this.videoAccountRepo.createQueryBuilder('v').orderBy('v.createTime', 'DESC');
    if (date) qb.where('DATE(v.createTime) = :date', { date });
    const data = await qb.getMany();
    return data.map((v) => ({
      id: v.id,
      accountName: v.accountName,
      playCount: v.playCount,
      likeCount: v.likeCount,
      commentCount: v.commentCount,
      shareCount: v.shareCount,
      date: (v.createTime as any)?.toISOString?.()?.split('T')?.[0] || '',
    }));
  }

  async getLiveData(platform?: string) {
    const qb = this.liveRepo.createQueryBuilder('l').orderBy('l.createTime', 'DESC');
    if (platform) qb.where('l.platform = :platform', { platform });
    const data = await qb.getMany();
    return data.map((l) => ({
      id: l.id,
      platform: l.platform,
      accountName: l.accountName,
      exposure: l.exposure,
      viewers: l.viewers,
      avgStayDuration: l.avgStayDuration,
      salesAmount: l.salesAmount,
      date: (l.createTime as any)?.toISOString?.()?.split('T')?.[0] || '',
    }));
  }

  async getMediaData(platform?: string) {
    const qb = this.mediaRepo.createQueryBuilder('m').orderBy('m.createTime', 'DESC');
    if (platform) qb.where('m.platform = :platform', { platform });
    const data = await qb.getMany();
    return data.map((m) => ({
      id: m.id,
      platform: m.platform,
      title: m.title,
      publisher: m.publisher,
      publishStatus: m.publishStatus,
      publishDate: m.publishDate,
      readCount: m.readCount,
      likeCount: m.likeCount,
      commentCount: m.commentCount,
      shareCount: m.shareCount,
      date: (m.createTime as any)?.toISOString?.()?.split('T')?.[0] || '',
    }));
  }

  async getShortVideoCombined(platform?: string) {
    const [douyin, kuaishou, videoAccount] = await Promise.all([
      this.getDouyinData(),
      this.getKuaishouData(),
      this.getVideoAccountData(),
    ]);

    const combined = [
      ...douyin.map((d) => ({ ...d, platform: '抖音' })),
      ...kuaishou.map((k) => ({ ...k, platform: '快手' })),
      ...videoAccount.map((v) => ({ ...v, platform: '视频号' })),
    ];

    if (platform) return combined.filter((item) => item.platform === platform);
    return combined;
  }

  async getSummaryData() {
    const [douyinResult, kuaishouResult, mediaResult, videoAccountResult, liveResult] = await Promise.all([
      this.douyinRepo.createQueryBuilder('d').select([
        'COALESCE(SUM(d.play_count), 0) as totalPlayCount',
        'COALESCE(SUM(d.like_count), 0) as totalLikeCount',
        'COALESCE(SUM(d.comment_count), 0) as totalCommentCount',
        'COALESCE(SUM(d.share_count), 0) as totalShareCount',
      ]).getRawOne(),
      this.kuaishouRepo.createQueryBuilder('k').select([
        'COALESCE(SUM(k.play_count), 0) as totalPlayCount',
        'COALESCE(SUM(k.like_count), 0) as totalLikeCount',
        'COALESCE(SUM(k.comment_count), 0) as totalCommentCount',
        'COALESCE(SUM(k.share_count), 0) as totalShareCount',
        'COALESCE(SUM(k.exposure), 0) as totalExposure',
        'COALESCE(SUM(k.viewers), 0) as totalViewers',
      ]).getRawOne(),
      this.mediaRepo.createQueryBuilder('m').select([
        'COALESCE(SUM(m.read_count), 0) as totalReadCount',
        'COALESCE(SUM(m.like_count), 0) as totalLikeCount',
        'COALESCE(SUM(m.comment_count), 0) as totalCommentCount',
        'COALESCE(SUM(m.share_count), 0) as totalShareCount',
      ]).getRawOne(),
      this.videoAccountRepo.createQueryBuilder('v').select([
        'COALESCE(SUM(v.play_count), 0) as totalPlayCount',
        'COALESCE(SUM(v.like_count), 0) as totalLikeCount',
        'COALESCE(SUM(v.comment_count), 0) as totalCommentCount',
        'COALESCE(SUM(v.share_count), 0) as totalShareCount',
      ]).getRawOne(),
      this.liveRepo.createQueryBuilder('l').select([
        'COALESCE(SUM(l.exposure), 0) as totalExposure',
        'COALESCE(SUM(l.viewers), 0) as totalViewers',
        'COALESCE(SUM(l.sales_amount), 0) as totalSalesAmount',
      ]).getRawOne(),
    ]);

    return {
      douyin: {
        totalPlayCount: Number(douyinResult.totalPlayCount) || 0,
        totalLikeCount: Number(douyinResult.totalLikeCount) || 0,
        totalCommentCount: Number(douyinResult.totalCommentCount) || 0,
        totalShareCount: Number(douyinResult.totalShareCount) || 0,
      },
      kuaishou: {
        totalPlayCount: Number(kuaishouResult.totalPlayCount) || 0,
        totalLikeCount: Number(kuaishouResult.totalLikeCount) || 0,
        totalCommentCount: Number(kuaishouResult.totalCommentCount) || 0,
        totalShareCount: Number(kuaishouResult.totalShareCount) || 0,
        totalExposure: Number(kuaishouResult.totalExposure) || 0,
        totalViewers: Number(kuaishouResult.totalViewers) || 0,
      },
      videoAccount: {
        totalPlayCount: Number(videoAccountResult.totalPlayCount) || 0,
        totalLikeCount: Number(videoAccountResult.totalLikeCount) || 0,
        totalCommentCount: Number(videoAccountResult.totalCommentCount) || 0,
        totalShareCount: Number(videoAccountResult.totalShareCount) || 0,
      },
      live: {
        totalExposure: Number(liveResult.totalExposure) || 0,
        totalViewers: Number(liveResult.totalViewers) || 0,
        totalSalesAmount: Number(liveResult.totalSalesAmount) || 0,
      },
      media: {
        totalReadCount: Number(mediaResult.totalReadCount) || 0,
        totalLikeCount: Number(mediaResult.totalLikeCount) || 0,
        totalCommentCount: Number(mediaResult.totalCommentCount) || 0,
        totalShareCount: Number(mediaResult.totalShareCount) || 0,
      },
    };
  }

  async getAllData() {
    const [douyin, kuaishou, videoAccount, live, media] = await Promise.all([
      this.getDouyinData(),
      this.getKuaishouData(),
      this.getVideoAccountData(),
      this.getLiveData(),
      this.getMediaData(),
    ]);

    const douyinRows = douyin.map((d) => ({
      type: '抖音',
      accountName: d.accountName,
      playCount: d.playCount,
      likeCount: d.likeCount,
      commentCount: d.commentCount,
      shareCount: d.shareCount,
      readCount: null,
      exposure: null,
      viewers: null,
      salesAmount: null,
      date: d.date,
    }));

    const kuaishouRows = kuaishou.map((k) => ({
      type: '快手',
      accountName: k.accountName,
      playCount: k.playCount,
      likeCount: k.likeCount,
      commentCount: k.commentCount,
      shareCount: k.shareCount,
      readCount: null,
      exposure: k.exposure,
      viewers: k.viewers,
      salesAmount: null,
      date: k.date,
    }));

    const videoAccountRows = videoAccount.map((v) => ({
      type: '视频号',
      accountName: v.accountName,
      playCount: v.playCount,
      likeCount: v.likeCount,
      commentCount: v.commentCount,
      shareCount: v.shareCount,
      readCount: null,
      exposure: null,
      viewers: null,
      salesAmount: null,
      date: v.date,
    }));

    const liveRows = live.map((l) => ({
      type: l.platform,
      accountName: l.accountName,
      playCount: null,
      likeCount: null,
      commentCount: null,
      shareCount: null,
      readCount: null,
      exposure: l.exposure,
      viewers: l.viewers,
      salesAmount: l.salesAmount,
      date: l.date,
    }));

    const mediaRows = media.map((m) => ({
      type: '自媒体-' + m.platform,
      accountName: m.publisher || m.title,
      playCount: null,
      likeCount: m.likeCount,
      commentCount: m.commentCount,
      shareCount: m.shareCount,
      readCount: m.readCount,
      exposure: null,
      viewers: null,
      salesAmount: null,
      date: m.date,
    }));

    return [...douyinRows, ...kuaishouRows, ...videoAccountRows, ...liveRows, ...mediaRows];
  }

  async getOverviewData() {
    const summary = await this.getSummaryData();

    const totalViews =
      summary.douyin.totalPlayCount +
      summary.kuaishou.totalPlayCount +
      summary.videoAccount.totalPlayCount +
      summary.kuaishou.totalExposure +
      summary.live.totalExposure +
      summary.media.totalReadCount;

    const totalLikes =
      summary.douyin.totalLikeCount +
      summary.kuaishou.totalLikeCount +
      summary.videoAccount.totalLikeCount +
      summary.media.totalLikeCount;

    const totalShares =
      summary.douyin.totalShareCount +
      summary.kuaishou.totalShareCount +
      summary.videoAccount.totalShareCount +
      (summary.media.totalShareCount || 0);

    const totalComments =
      summary.douyin.totalCommentCount +
      summary.kuaishou.totalCommentCount +
      summary.videoAccount.totalCommentCount +
      summary.media.totalCommentCount;

    return {
      totalViews,
      totalLikes,
      totalShares,
      totalForwards: totalShares,
      totalComments,
      breakdown: summary,
    };
  }
}
