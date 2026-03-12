import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局前缀
  app.setGlobalPrefix('api');

  // 全局 DTO 验证管道
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  // 全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter());

  // 全局响应拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // CORS（开发阶段允许跨域）
  app.enableCors();

  const port = process.env.PORT ?? 8000;
  await app.listen(port);
  Logger.log(`服务已启动 http://localhost:${port}/api`, 'Bootstrap');
}
bootstrap();
