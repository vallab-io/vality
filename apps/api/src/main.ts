import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // 글로벌 Validation Pipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성 자동 제거
      forbidNonWhitelisted: true, // 정의되지 않은 속성이 있으면 에러 발생
      transform: true, // 요청 데이터를 DTO 타입으로 자동 변환
    }),
  );

  // API 접두사 설정
  app.setGlobalPrefix('api');

  // Swagger 설정
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vality API')
    .setDescription('뉴스레터 + 웹 아카이빙 플랫폼 API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT 토큰을 입력하세요',
        in: 'header',
      },
      'access-token',
    )
    .addTag('auth', '인증 관련 API')
    .addTag('users', '사용자 관련 API')
    .addTag('newsletters', '뉴스레터 관련 API')
    .addTag('subscribers', '구독자 관련 API')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true, // 새로고침해도 인증 정보 유지
    },
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  console.log(`🚀 Server is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api-docs`);
}

bootstrap();
