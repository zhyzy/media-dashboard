import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((err) => {
          const constraints = err.constraints || {};
          return `${err.property}: ${Object.values(constraints).join(', ')}`;
        });
        console.error('[Validation Error]', messages);
        return new BadRequestException(messages);
      },
    }),
  );

  app.setGlobalPrefix('api');

  const screenDistPath = join(__dirname, '..', '..', 'screen-dist');
  const adminDistPath = join(__dirname, '..', '..', 'admin-dist');

  if (existsSync(screenDistPath)) {
    app.useStaticAssets(screenDistPath, { prefix: '/' });
  }
  if (existsSync(adminDistPath)) {
    app.useStaticAssets(adminDistPath, { prefix: '/admin' });
  }

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`🚀 服务已启动: http://localhost:${PORT}`);
  console.log(`  - 大屏: http://localhost:${PORT}/`);
  console.log(`  - 后台: http://localhost:${PORT}/admin`);
  console.log(`  - API: http://localhost:${PORT}/api`);
}
bootstrap();
