import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { DrizzleModule } from './db/drizzle.module';
import { AuthModule } from './modules/auth/auth.module';
import { ToursModule } from './modules/tours/tours.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ConfigModule } from '@nestjs/config';
import { OperatorModule } from './modules/operator/operator.module';
import { UserModule } from './modules/user/user.module';
import { CountriesModule } from './modules/countries/countries.module';
import { CitiesModule } from './modules/cities/cities.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
