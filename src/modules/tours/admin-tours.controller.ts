import {
  Controller,
  Get,
  Query,
  UseGuards,
  Logger,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  Req,
  ForbiddenException,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UpdateTourFeatureDto } from './dto/update-tour-feature.dto';
import { ToursService } from './tours.service';
import { AdminGetToursQueryDto } from './dto/admin-get-tours-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('admin/tours')
@UseGuards(JwtAuthGuard, new RolesGuard('admin'))
export class AdminToursController {
  private readonly logger = new Logger(AdminToursController.name);

  constructor(private readonly toursService: ToursService) {}

  private readonly MAX_LIMIT = 100;

  @Get()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      errorHttpStatusCode: 400,
    }),
  )
  async findAll(
    @Req() req: Request & { user: { role: string } },
    @Query() query: AdminGetToursQueryDto,
  ) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Доступ дозволено лише адміністраторам');
    }

    const limit = Math.min(query.limit ?? 10, this.MAX_LIMIT);
    const offset = query.offset ?? 0;

    const result = await this.toursService.findAllAdmin({
      ...query,
      limit,
      offset,
    });

    return {
      message: 'Admin tours loaded successfully',
      data: result.tours,
      meta: {
        total: result.total,
        limit,
        offset,
      },
    };
  }
  @Patch(':id/feature')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: 422, // або прибери — буде 400
    }),
  )
  async updateFeatureStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTourFeatureDto: UpdateTourFeatureDto,
  ) {
    return this.toursService.updateFeatureStatus(
      id,
      updateTourFeatureDto.isFeatured,
    );
  }
}
