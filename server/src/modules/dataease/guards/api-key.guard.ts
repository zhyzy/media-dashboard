import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { DataeaseService } from '../dataease.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private dataeaseService: DataeaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey =
      request.headers['x-api-key'] ||
      request.query.api_key ||
      request.body?.api_key;

    if (!apiKey) {
      throw new UnauthorizedException('缺少API Key，请通过 x-api-key 请求头或 api_key 参数传递');
    }

    const config = await this.dataeaseService.validateApiKey(apiKey);
    request.dataeaseConfig = config;
    return true;
  }
}
