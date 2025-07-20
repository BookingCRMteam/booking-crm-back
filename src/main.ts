import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from 'dotenv';
import { auth } from 'express-oauth2-jwt-bearer';

config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('Booking CRM API')
    .setDescription('Booking CRM API description')
    .setVersion('1.0')
    .addTag('Booking CRM')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);
  app.setGlobalPrefix('api/v1');

  const jwtCheck = auth({
    audience: 'https://booking-crm.onrender.com/api/v2',
    issuerBaseURL: 'https://bookingcrm.eu.auth0.com/',
    tokenSigningAlg: 'RS256',
  });

  // enforce on all endpoints
  app.use(jwtCheck);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
