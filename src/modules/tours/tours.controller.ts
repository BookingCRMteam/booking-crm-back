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
} from '@nestjs/common';
import { ToursService } from './tours.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { Tour } from './tours.types';
import { GetToursQueryDto } from './dto/get-tours-query.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { CloudinaryService } from '@app/cloudinary/cloudinary.service';
import { UpdateTourDto } from './dto/update-tour.dto';
import { ApiConsumes } from '@nestjs/swagger';

@Controller('tours')
export class ToursController {
  constructor(
    private readonly toursService: ToursService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(
    FilesInterceptor('photos', 10, { storage: multer.memoryStorage() }),
  )
  @ApiConsumes('multipart/form-data')
  async createTour(
    @Body() createTourDto: CreateTourDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<Tour> {
    try {
      if (files && files.length > 0) {
        const uploadedPhotos = await Promise.all(
          files.map((file) =>
            this.cloudinaryService.uploadImage(file.buffer).then((res) => ({
              url: res.secure_url,
            })),
          ),
        );
        createTourDto.photos = uploadedPhotos;
      }

      const createdTour = await this.toursService.createTour(createTourDto);
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
  async asyncfindOne(@Param('id', ParseIntPipe) id: number) {
    const tour = await this.toursService.findOne(id);
    return {
      message: 'Tour retrieved successfully',
      data: tour,
    };
  }

  @Patch(':id') // Оновлення туру
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseInterceptors(
    FilesInterceptor('photos', 10, { storage: multer.memoryStorage() }),
  )
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTourDto: UpdateTourDto,
    @UploadedFiles() files: Express.Multer.File[],
    //@TODO:
    // @Req() req: Request,
  ) {
    try {
      // const operatorId = (req.user as any).operatorId;
      // if (!operatorId) {
      //   throw new BadRequestException('Operator ID not found.');
      // }

      if (files && files.length > 0) {
        const uploadedPhotos = await Promise.all(
          files.map((file) =>
            this.cloudinaryService.uploadImage(file.buffer).then((res) => ({
              url: res.secure_url,
            })),
          ),
        );
        updateTourDto.photos = uploadedPhotos;
      }

      const updatedTour = await this.toursService.update(id, updateTourDto, 1);
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    //@TODO:
    // @Req() req: Request,
  ) {
    // const operatorId = (req.user as any).operatorId;
    // if (!operatorId) {
    //   throw new BadRequestException('Operator ID not found.');
    // }

    const res = await this.toursService.remove(id, 1);
    return res.message;
  }
}
