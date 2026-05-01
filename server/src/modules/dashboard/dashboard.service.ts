import { Injectable } from '@nestjs/common';
import { DouyinService } from '../douyin/douyin.service';
import { KuaishouService } from '../kuaishou/kuaishou.service';
import { MediaService } from '../media/media.service';
import { VideoAccountService } from '../video-account/video-account.service';
import { LiveService } from '../live/live.service';
import { DataHistoryService } from '../data-history/data-history.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataHistory } from '../data-history/entities/data-history.entity';

@Injectable()
export class DashboardService {
  constructor(
    private douyinService: DouyinService,
    private kuaishouService: KuaishouService,
    private mediaService: MediaService,
    private videoAccountService: VideoAccountService,
    private liveService: LiveService,
    @InjectRepository(DataHistory)
    private dataHistoryRepository: Repository<DataHistory>,
  ) {}

  async getSummary() {
    const [douyin, kuaishou, media, videoAccount, live] = await Promise.all([
      this.douyinService.getSummary(),
      this.kuaishouService.getSummary(),
      this.mediaService.getSummary(),
      this.videoAccountService.getSummary(),
      this.liveService.getSummary(),
    ]);

    const totalPlayCount =
      douyin.totalPlayCount + kuaishou.totalPlayCount + videoAccount.totalPlayCount;
    const totalLikeCount =
      douyin.totalLikeCount + kuaishou.totalLikeCount + videoAccount.totalLikeCount + media.totalLikeCount;
    const totalCommentCount =
      douyin.totalCommentCount + kuaishou.totalCommentCount + videoAccount.totalCommentCount + media.totalCommentCount;
    const totalShareCount =
      douyin.totalShareCount + kuaishou.totalShareCount + videoAccount.totalShareCount + (media.totalShareCount || 0);
    const totalReadCount = media.totalReadCount;

    return {
      totalPlayCount,
      totalLikeCount,
      totalCommentCount,
      totalShareCount,
      totalReadCount,
      totalExposure: kuaishou.totalExposure + live.totalExposure,
      totalViewers: kuaishou.totalViewers + live.totalViewers,
      totalSalesAmount: live.totalSalesAmount,
      douyin,
      kuaishou,
      media,
      videoAccount,
      live,
    };
  }

  async getShortVideoCombined(platform?: string) {
    const [douyin, kuaishou, videoAccount] = await Promise.all([
      this.douyinService.findAll(),
      this.kuaishouService.findAll(),
      this.videoAccountService.findAll(),
    ]);

    const combined = [
      ...douyin.map((d) => ({ ...d, platform: '抖音' })),
      ...kuaishou.map((k) => ({ ...k, platform: '快手' })),
      ...videoAccount.map((v) => ({ ...v, platform: '视频号' })),
    ];

    if (platform) {
      return combined.filter((item) => item.platform === platform);
    }
    return combined;
  }

  async getTrend(days: number = 14) {
    const platforms = ['douyin', 'kuaishou', 'video_account', 'media', 'live'];

    const result: Record<string, any[]> = {};
    for (const platform of platforms) {
      const key = platform === 'video_account' ? 'videoAccount' : platform;

      const rows = await this.dataHistoryRepository
        .createQueryBuilder('h')
        .select("DATE_FORMAT(h.record_date, '%Y-%m-%d')", 'date')
        .addSelect('SUM(h.play_count)', 'playCount')
        .addSelect('SUM(h.like_count)', 'likeCount')
        .addSelect('SUM(h.comment_count)', 'commentCount')
        .addSelect('SUM(h.share_count)', 'shareCount')
        .addSelect('SUM(h.read_count)', 'readCount')
        .addSelect('SUM(h.exposure)', 'exposure')
        .addSelect('SUM(h.viewers)', 'viewers')
        .where('h.platform = :platform', { platform })
        .andWhere('h.record_date >= DATE_SUB(CURDATE(), INTERVAL :days DAY)', { days })
        .groupBy("DATE_FORMAT(h.record_date, '%Y-%m-%d')")
        .orderBy("DATE_FORMAT(h.record_date, '%Y-%m-%d')", 'ASC')
        .getRawMany();

      result[key] = rows.map((row) => ({
        date: row.date,
        playCount: Number(row.playCount) || 0,
        likeCount: Number(row.likeCount) || 0,
        commentCount: Number(row.commentCount) || 0,
        shareCount: Number(row.shareCount) || 0,
        readCount: Number(row.readCount) || 0,
        exposure: Number(row.exposure) || 0,
        viewers: Number(row.viewers) || 0,
      }));
    }

    return result;
  }

  async getRankings() {
    const [douyinRanking, mediaRanking] = await Promise.all([
      this.douyinService.getRanking(10),
      this.mediaService.getArticleRanking(10),
    ]);

    return { douyinRanking, mediaRanking };
  }
}
