import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { DrizzleModule } from './db/drizzle.module';
import { AuthModule } from './modules/auth/auth.module';
import { ToursModule } from './modules/tours/tours.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OperatorModule } from './modules/operator/operator.module';
import { UserModule } from './modules/user/user.module';
import { CountriesModule } from './modules/countries/countries.module';
import { CitiesModule } from './modules/cities/cities.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
// Важливо: правильний імпорт redisStore
// import { redisStore } from 'cache-manager-ioredis-yet';
import { CacheHealthModule } from './modules/cache-health/cache-health.module';
import { redisStore } from 'cache-manager-ioredis-yet';
import { NotificationsModule } from './modules/notifications/notifications.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule.register({ global: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = {
          store: redisStore,
          host: configService.get<string>('REDIS_HOST', 'localhost'), // Додайте значення за замовчуванням
          port: configService.get<string | number>('REDIS_PORT', 6379),
          ttl: 86400,
          // Додаткові налаштування для debug
          db: 0,
          retryDelayOnFailover: 100,
          enableReadyCheck: false,
          maxRetriesPerRequest: null,
        };
        return config;
      },
    }),
    HealthModule,
    DrizzleModule,
    ToursModule,
    CloudinaryModule,
    AuthModule,
    OperatorModule,
    UserModule,
    CountriesModule,
    CitiesModule,
    BookingsModule,
    PaymentsModule,
    CacheHealthModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
