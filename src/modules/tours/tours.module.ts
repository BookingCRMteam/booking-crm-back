import { Module } from '@nestjs/common';
import { ToursService } from './tours.service';
import { ToursController } from './tours.controller';
import { CloudinaryModule } from '@app/cloudinary/cloudinary.module';
import { DateRangeValidator } from './dto/date-range.validator';

@Module({
  imports: [CloudinaryModule],
  controllers: [ToursController],
  providers: [ToursService, DateRangeValidator],
})
export class ToursModule {}
