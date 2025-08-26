import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheHealthIndicator {
  getRedis() {
    return 'Hello from Redis';
  }
  // constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // async isHealthy(key = 'cache'): Promise<HealthIndicatorResult> {
  //   const testKey = '__health_check__';

  //   try {
  //     await this.cacheManager.set(testKey, 'ok', 5);
  //     const value = await this.cacheManager.get(testKey);

  //     if (value !== 'ok') {
  //       throw new HealthCheckError('Cache failed', {
  //         [key]: { status: 'down' },
  //       });
  //     }

  //     const storeType = (this.cacheManager as any)?.store?.name || 'memory';
  //     console.log('store: ', this.cacheManager.stores[0]);
  //     return {
  //       [key]: {
  //         status: 'up',
  //         store: storeType,
  //       },
  //     };
  //   } catch (err) {
  //     throw new HealthCheckError('Cache failed', {
  //       [key]: { status: 'down', error: (err as Error).message },
  //     });
  //   }
  // }
}
