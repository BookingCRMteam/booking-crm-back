import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { DrizzleModule } from './db/drizzle.module';
import { AuthModule } from './modules/auth/auth.module';
import { ToursModule } from './modules/tours/tours.module';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { CloudinaryController } from './cloudinary/cloudinary.controller';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ConfigModule } from '@nestjs/config';
import { OperatorController } from './modules/operator/operator.controller';
import { OperatorModule } from './modules/operator/operator.module';
import { UserModule } from './modules/user/user.module';
import { OperatorService } from './modules/operator/operator.service';
import { UserService } from './modules/user/user.service';
import { CountriesModule } from './modules/countries/countries.module';
import { CitiesModule } from './modules/cities/cities.module';

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
  ],
  controllers: [AppController, CloudinaryController, OperatorController],
  providers: [AppService, CloudinaryService, OperatorService, UserService],
})
export class AppModule {}
