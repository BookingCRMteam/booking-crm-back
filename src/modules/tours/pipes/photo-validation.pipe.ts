// src/modules/photos/pipes/photo-validation.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class PhotoValidationPipe implements PipeTransform {
  transform(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least 1 photo is required.');
    }

    if (files.length > 10) {
      throw new BadRequestException('No more than 10 photos are allowed.');
    }

    files.forEach((file, index) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        throw new BadRequestException(
          `File ${index + 1}: Only JPG/PNG files are allowed`,
        );
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException(
          `File ${index + 1}: File size exceeds 5MB`,
        );
      }
    });

    return files;
  }
}
