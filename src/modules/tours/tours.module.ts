import { Module } from '@nestjs/common';
import { ToursService } from './tours.service';
import { ToursController } from './tours.controller';
import { CloudinaryModule } from '@app/cloudinary/cloudinary.module';
import { PhotoValidationPipe } from './pipes';

@Module({
  imports: [CloudinaryModule],
  controllers: [ToursController],
  providers: [ToursService, PhotoValidationPipe],
})
export class ToursModule {}
