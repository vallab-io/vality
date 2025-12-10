import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // 환경 변수 설정
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate Limiting 설정 (분당 100회 제한)
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 1분 (밀리초)
          limit: 100, // 최대 요청 횟수
        },
      ],
    }),

    // Prisma 모듈
    PrismaModule,

    // 기능 모듈들 (추후 추가)
    // AuthModule,
    // UserModule,
    // NewsletterModule,
    // SubscriberModule,
    // EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
