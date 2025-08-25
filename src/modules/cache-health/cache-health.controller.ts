import { Controller, Get } from '@nestjs/common';
import { CacheHealthIndicator } from './cache-health.service';

@Controller('cache-health')
export class HealthController {
  constructor(
    // private health: HealthCheckService,
    private cacheIndicator: CacheHealthIndicator,
  ) {}

  @Get()
  getRedis() {
    return this.cacheIndicator.getRedis();
  }
}
// async check() {
//   return this.health.check([() => this.cacheIndicator.isHealthy('cache')]);
// }
