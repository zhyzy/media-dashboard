import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { DouyinModule } from './modules/douyin/douyin.module';
import { KuaishouModule } from './modules/kuaishou/kuaishou.module';
import { MediaModule } from './modules/media/media.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { DataeaseModule } from './modules/dataease/dataease.module';
import { VideoAccountModule } from './modules/video-account/video-account.module';
import { LiveModule } from './modules/live/live.module';
import { StaffModule } from './modules/staff/staff.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { AccountModule } from './modules/account/account.module';
import { ScriptModule } from './modules/script/script.module';
import { ShootingModule } from './modules/shooting/shooting.module';
import { PublishModule } from './modules/publish/publish.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { ActivityModule } from './modules/activity/activity.module';
import { DataHistoryModule } from './modules/data-history/data-history.module';
import { SystemModule } from './modules/system/system.module';
import { TodoModule } from './modules/todo/todo.module';
import { ActivityInterceptor } from './interceptors/activity.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql' as const,
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_DATABASE', 'media_dashboard'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret',
      }),
    }),
    GatewayModule,
    AuthModule,
    DouyinModule,
    KuaishouModule,
    MediaModule,
    DashboardModule,
    DataeaseModule,
    VideoAccountModule,
    LiveModule,
    StaffModule,
    ExpenseModule,
    AccountModule,
    ScriptModule,
    ShootingModule,
    PublishModule,
    WorkflowModule,
    ActivityModule,
    DataHistoryModule,
    SystemModule,
    TodoModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityInterceptor,
    },
  ],
})
export class AppModule {}
