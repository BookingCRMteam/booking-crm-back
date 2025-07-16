import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { DrizzleModule } from './db/drizzle/drizzle.module';
import { ToursModule } from './modules/tours/tours.module';

@Module({
  imports: [HealthModule, DrizzleModule, ToursModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
