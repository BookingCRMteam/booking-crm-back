import { Module } from '@nestjs/common';
import { ToursService } from './tours.service';
import { ToursController } from './tours.controller';
import { CloudinaryModule } from '@app/cloudinary/cloudinary.module';
import { AdminToursController } from './admin-tours.controller';
@Module({
  imports: [CloudinaryModule],
  controllers: [ToursController, AdminToursController],
  providers: [ToursService],
})
export class ToursModule {}
