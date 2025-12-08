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
} from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UpdateTourFeatureDto } from './dto/update-tour-feature.dto';

import { ToursService } from './tours.service';
import { AdminGetToursQueryDto } from './dto/admin-get-tours-query.dto';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('admin/tours')
@UseGuards(JwtAuthGuard) // додай RolesGuard лише якщо він у тебе є
export class AdminToursController {
  private readonly logger = new Logger(AdminToursController.name);

  constructor(private readonly toursService: ToursService) {}

  @Get()
  async findAll(@Query() query: AdminGetToursQueryDto) {
    try {
      const result = await this.toursService.findAllAdmin(query);

      return {
        message: 'Admin tours loaded successfully',
        data: result.tours,
        meta: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
        },
      };
    } catch (error) {
      this.logger.error('Error loading admin tours', error);
      throw error;
    }
  }

  @Patch(':id/feature')
  @UseGuards(JwtAuthGuard, new RolesGuard('admin'))
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
