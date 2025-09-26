// src/modules/photos/pipes/photo-validation.pipe.ts
import {
  PipeTransform,
  Injectable,
  BadRequestException,
  Scope,
  Inject,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class PhotoValidationPipe implements PipeTransform {
  constructor(@Inject(REQUEST) private readonly request: Request) {}
  transform(files: Express.Multer.File[]) {
    if (this.request.method === 'PATCH' || this.request.method === 'PUT') {
      if (!files || files.length === 0) {
        return files;
      }
    }
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
