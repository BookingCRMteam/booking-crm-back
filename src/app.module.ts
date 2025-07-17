import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { DrizzleModule } from './db/drizzle/drizzle.module';
import { ToursModule } from './modules/tours/tours.module';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { CloudinaryController } from './cloudinary/cloudinary.controller';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    DrizzleModule,
    ToursModule,
    CloudinaryModule,
  ],
  controllers: [AppController, CloudinaryController],
  providers: [AppService, CloudinaryService],
})
export class AppModule {}
