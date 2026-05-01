import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Optional,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivityService } from '../modules/activity/activity.service';
import { JwtService } from '@nestjs/jwt';

const PLATFORM_MAP: Record<string, string> = {
  douyin: '抖音',
  kuaishou: '快手',
  'video-account': '视频号',
  media: '自媒体',
  live: '直播',
  script: '剧本',
  shooting: '拍摄',
  publish: '发布',
  expense: '费用',
};

const ACTION_MAP: Record<string, string> = {
  POST: '新增了',
  PUT: '修改了',
  DELETE: '删除了',
};

@Injectable()
export class ActivityInterceptor implements NestInterceptor {
  constructor(
    private activityService: ActivityService,
    private jwtService: JwtService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (!['POST', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const url = request.url as string;
    if (url.startsWith('/api/auth') || url.startsWith('/api/activity') || url.startsWith('/api/dashboard') || url.startsWith('/api/todo')) {
      return next.handle();
    }

    const pathParts = url.replace('/api/', '').split('/');
    const platform = pathParts[0];
    const platformName = PLATFORM_MAP[platform] || platform;

    const action = ACTION_MAP[method];
    if (!action) return next.handle();

    let staffId = 0;
    let staffName = '系统';

    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payload = this.jwtService.decode(token) as any;
        if (payload) {
          staffId = payload.sub || 0;
          staffName = payload.username || '未知用户';
        }
      } catch {}
    }

    let target = platformName + '数据';
    if (method === 'PUT' || method === 'DELETE') {
      const idMatch = url.match(/\/(\d+)(?:\?|$|\/)/);
      if (idMatch) {
        target = platformName + '数据 #' + idMatch[1];
      }
    }
    if (url.includes('/batch')) {
      target = platformName + '批量数据';
    }

    const finalStaffId = staffId;
    const finalStaffName = staffName;
    const finalAction = action;
    const finalTarget = target;

    return next.handle().pipe(
      tap(() => {
        this.activityService
          .createLog({
            staffId: finalStaffId,
            staffName: finalStaffName,
            action: finalAction,
            target: finalTarget,
            moduleType: platform,
          })
          .catch((err) => {
            console.error('[ActivityLog] 记录失败:', err.message);
          });
      }),
    );
  }
}
