import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import multer from 'multer';

@Controller('upload')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async upload(@UploadedFile() file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadImage(file.buffer);
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }
}
