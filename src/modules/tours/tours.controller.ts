import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  HttpException,
  HttpStatus,
  Query,
  UseInterceptors,
  ParseIntPipe,
  Patch,
  HttpCode,
  UploadedFiles,
  Req,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ToursService } from './tours.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { Tour } from './tours.types';
import { GetToursQueryDto } from './dto/get-tours-query.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { CloudinaryService } from '@app/cloudinary/cloudinary.service';
import { UpdateTourDto } from './dto/update-tour.dto';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthenticatedRequest } from '@app/types/authenticated.request';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { PhotoValidationPipe } from './pipes';
@Controller('tours')
export class ToursController {
  constructor(
    private readonly toursService: ToursService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(
    FilesInterceptor('photo_files', 10, { storage: multer.memoryStorage() }),
  )
  @ApiConsumes('multipart/form-data')
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createTourDto: CreateTourDto,
    @UploadedFiles(PhotoValidationPipe) files: Express.Multer.File[],
    @Req() req: AuthenticatedRequest,
  ): Promise<Tour> {
    try {
      const operatorId = req.user.operatorId;
      if (!operatorId) {
        throw new BadRequestException('Operator ID not found.');
      }
      if (files && files.length > 0) {
        if (
          createTourDto.photos &&
          createTourDto.photos.length > 0 &&
          createTourDto.photos.length !== files.length
        ) {
          throw new BadRequestException(
            'The number of files does not match the number of photo metadata entries.',
          );
        }

        const uploadedPhotos = await Promise.all(
          files.map(async (file, index) => {
            const uploadResult = await this.cloudinaryService.uploadImage(
              file.buffer,
            );
            const photoMeta = createTourDto.photos?.[index] ?? {};
            return {
              url: uploadResult.secure_url,
              isMain: photoMeta.isMain ?? false,
              description: photoMeta.description,
            };
          }),
        );
        createTourDto.photos = uploadedPhotos;
      }

      const createdTour = await this.toursService.create(
        createTourDto,
        operatorId,
      );
      return createdTour;
    } catch (error) {
      console.error('Error in createTour:', error);
      throw new HttpException(
        'Failed to create tour',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async findAll(@Query() query: GetToursQueryDto) {
    try {
      const toursData = await this.toursService.findAll(query);
      return {
        message: 'Tours retrieved successfully',
        data: toursData.tours,
        meta: {
          total: toursData?.total,
          limit: toursData.limit,
          offset: toursData.offset,
        },
      };
    } catch (error) {
      // Handle the error here
      console.error(error);
      throw new HttpException(
        'Failed to retrieve tours',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const tour = await this.toursService.findOne(id);
    return {
      message: 'Tour retrieved successfully',
      data: tour,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard) // Оновлення туру
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseInterceptors(
    FilesInterceptor('photo_files', 10, { storage: multer.memoryStorage() }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('bearer')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTourDto: UpdateTourDto,
    @UploadedFiles(PhotoValidationPipe) files: Express.Multer.File[],
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const operatorId = req.user.operatorId;
      if (!operatorId) {
        throw new BadRequestException('Operator ID not found.');
      }

      if (files && files.length > 0) {
        if (
          updateTourDto.photos &&
          updateTourDto.photos.length > 0 &&
          updateTourDto.photos.length !== files.length
        ) {
          throw new BadRequestException(
            'The number of files does not match the number of photo metadata entries.',
          );
        }

        const uploadedPhotos = await Promise.all(
          files.map(async (file, index) => {
            const uploadResult = await this.cloudinaryService.uploadImage(
              file.buffer,
            );
            const photoMeta = updateTourDto.photos?.[index] ?? {};
            return {
              url: uploadResult.secure_url,
              isMain: photoMeta.isMain ?? false,
              description: photoMeta.description,
            };
          }),
        );
        updateTourDto.photos = uploadedPhotos;
      }

      const updatedTour = await this.toursService.update(
        id,
        updateTourDto,
        operatorId,
      );
      return { message: 'Tour updated successfully', data: updatedTour };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error in updateTour:', error.message);
      } else {
        console.error('Error in updateTour:', error);
      }
      throw new HttpException(
        'Failed to update tour',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('bearer')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const operatorId = req.user.operatorId;
    if (!operatorId) {
      throw new BadRequestException('Operator ID not found.');
    }

    const res = await this.toursService.remove(id, operatorId);
    return res.message;
  }
}
