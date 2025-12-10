"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.setGlobalPrefix('api');
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Vality API')
        .setDescription('뉴스레터 + 웹 아카이빙 플랫폼 API')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT 토큰을 입력하세요',
        in: 'header',
    }, 'access-token')
        .addTag('auth', '인증 관련 API')
        .addTag('users', '사용자 관련 API')
        .addTag('newsletters', '뉴스레터 관련 API')
        .addTag('subscribers', '구독자 관련 API')
        .build();
    const swaggerDocument = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api-docs', app, swaggerDocument, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const port = process.env.PORT ?? 4000;
    await app.listen(port);
    console.log(`🚀 Server is running on: http://localhost:${port}`);
    console.log(`📚 Swagger docs: http://localhost:${port}/api-docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map