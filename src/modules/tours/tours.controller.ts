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
  UploadedFile,
} from '@nestjs/common';
import { ToursService } from './tours.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { Tour } from './tours.types';
import { GetToursQueryDto } from './dto/get-tours-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { CloudinaryService } from '@app/cloudinary/cloudinary.service';

@Controller('tours')
export class ToursController {
  constructor(
    private readonly toursService: ToursService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(
    FileInterceptor('photos', { storage: multer.memoryStorage() }),
  )
  async createTour(
    @Body() createTourDto: CreateTourDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Tour> {
    try {
      if (file) {
        const uploadResult = await this.cloudinaryService.uploadImage(
          file.buffer,
        );
        createTourDto.photos = [{ url: uploadResult.secure_url }];
      }
      const createdTour = await this.toursService.createTour(createTourDto);
      return createdTour;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error in createTour:', error.message);
      } else {
        console.error('Error in createTour:', error);
      }
      throw new HttpException(
        'Failed to create tour',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  // Важливо: ValidationPipe з { transform: true } дозволяє автоматично
  // перетворювати рядки з Query на відповідні типи (Number, Date) у DTO.
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async findAllTours(@Query() query: GetToursQueryDto) {
    try {
      const toursData = await this.toursService.findAllTours(query);
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
  findOne(@Param('id') id: string) {
    return this.toursService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTourDto: UpdateTourDto) {
  //   return this.toursService.update(+id, updateTourDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.toursService.remove(+id);
  }
}
