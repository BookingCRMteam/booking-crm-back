import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './cache-health.controller';
import { CacheHealthIndicator } from './cache-health.service';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [CacheHealthIndicator],
})
export class CacheHealthModule {}
