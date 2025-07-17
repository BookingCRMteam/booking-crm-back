import { Module } from '@nestjs/common';
import { ToursService } from './tours.service';
import { ToursController } from './tours.controller';
import { CloudinaryModule } from '@app/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [ToursController],
  providers: [ToursService],
})
export class ToursModule {}
