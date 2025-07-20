import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { DrizzleModule } from './db/drizzle/drizzle.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [HealthModule, DrizzleModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
