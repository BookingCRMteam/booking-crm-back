import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Express } from 'express';

interface PhotoValidationOptions {
  required?: boolean;
}

@Injectable()
export class PhotoValidationPipe
  implements PipeTransform<Express.Multer.File | Express.Multer.File[]>
{
  constructor(private readonly options: PhotoValidationOptions = {}) {}

  transform(value: Express.Multer.File | Express.Multer.File[]) {
    const { required = true } = this.options;

    if (!required && !value) {
      return null;
    }

    if (required && !value) {
      throw new BadRequestException('At least 1 photo is required.');
    }

    const files: Express.Multer.File[] = Array.isArray(value) ? value : [value];

    if (required && files.length === 0) {
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

    return value;
  }
}
