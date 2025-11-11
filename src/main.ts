import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { json, Request } from 'express';
import { SocketIoAdapter } from './common/adapters/socket-io.adapter';
import { ConfigService } from '@nestjs/config';

config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

async function bootstrap() {
  // Затримка на 5 секунд, щоб Redis повністю запустився

  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const configService = app.get(ConfigService);
  app.useWebSocketAdapter(new SocketIoAdapter(app, configService));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Booking CRM API')
    .setDescription('Booking CRM API description')
    .setVersion('1.0')
    .addTag('Booking CRM')
    .addSecurity('bearer', {
      type: 'http',
      scheme: 'bearer',
    })
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, documentFactory);
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        // enableImplicitConversion: true, // Ця опція викликає проблеми з multipart/form-data
      },
    }),
  );
  app.use(
    json({
      verify: (req: Request, res, buf) => {
        req.rawBody = buf;
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
