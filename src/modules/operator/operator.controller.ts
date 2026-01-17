import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { OperatorService } from './operator.service';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@app/types/authenticated.request';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { OperatorStatus } from '@app/types/operator-status';
import { GetPopularOperatorsDto } from './dto/get-popular-operators.dto';
import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

@Controller('operator')
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiConsumes('application/json')
  @ApiBody({
    description: 'Додати нового оператора',
    schema: {
      type: 'object',
      required: [
        'email',
        'firstName',
        'lastName',
        'website',
        'phone',
        'userId',
      ],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'operator@example.com',
        },
        firstName: {
          type: 'string',
          example: 'Іван',
        },
        lastName: {
          type: 'string',
          example: 'Іванов',
        },
        website: {
          type: 'string',
          format: 'uri',
          example: 'https://example.com',
        },
        phone: {
          type: 'string',
          example: '+380501234567',
        },
      },
    },
  })
  addOperator(
    @Body() operatorInfoDTO: CreateOperatorDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.operatorService.addOperator(operatorInfoDTO, req);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  @UseInterceptors(
    FileInterceptor('photo', { storage: multer.memoryStorage() }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update operator profile',
    description: `
  Rules:
  - companyName, description, philosophy, photo can be updated anytime
  - firstName, lastName, phone, website:
    • can be updated ONLY when operator status is "rejected"
    • after changing any of these fields, status is automatically set to "pending"
    • cannot be updated when status is "pending" or "approved"
  `,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        companyName: {
          type: 'string',
          example: 'Travel Dreams LLC',
        },
        description: {
          type: 'string',
          example: 'We organize unforgettable tours across Europe',
        },
        philosophy: {
          type: 'string',
          example: 'Honesty, comfort and unforgettable memories',
        },

        firstName: {
          type: 'string',
          example: 'Ivan',
          description: 'Allowed only when status is "rejected"',
        },
        lastName: {
          type: 'string',
          example: 'Ivanov',
          description: 'Allowed only when status is "rejected"',
        },
        phone: {
          type: 'string',
          example: '+380501234567',
          description: 'Allowed only when status is "rejected"',
        },
        website: {
          type: 'string',
          example: 'https://example.com',
          description: 'Allowed only when status is "rejected"',
        },

        photo: {
          type: 'string',
          format: 'binary',
          nullable: true,
          description: 'Operator photo (JPEG/PNG/WEBP, max 5MB)',
        },
      },
    },
  })
  async updateOperator(
    @Body() operatorInfoDTO: UpdateOperatorDto,
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException('Photo must be JPEG, PNG or WEBP');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException('Photo size must be up to 5MB');
      }
    }

    const errors = await validate(operatorInfoDTO);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.operatorService.updateOperator(
      operatorInfoDTO,
      req,
      file?.buffer,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: AuthenticatedRequest) {
    return this.operatorService.getMyOperator(req);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Отримати список операторів з опціональним фільтром по статусу',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Кількість записів на сторінку',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Зсув для пагінації',
    example: 0,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: OperatorStatus,
    description: 'Фільтр по статусу',
    example: OperatorStatus.PENDING,
  })
  @ApiResponse({
    status: 200,
    description: 'Список операторів успішно отримано',
  })
  getAll(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('status') status: string,
  ) {
    const validStatus: OperatorStatus | undefined = Object.values(
      OperatorStatus,
    ).includes(status as OperatorStatus)
      ? (status as OperatorStatus)
      : undefined;

    return this.operatorService.getAllOperators(limit, offset, validStatus);
  }
  @Get('popular')
  @ApiOperation({ summary: 'Get list of popular operators with active tours' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 6,
    description: 'Maximum number of operators to return',
  })
  @ApiResponse({
    status: 200,
    description: 'List of popular operators with at least one active tour',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          email: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          userId: { type: 'number' },
          companyName: { type: 'string' },
          description: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          website: { type: 'string' },
          phone: { type: 'string' },
          status: { type: 'string' },
          philosophy: { type: 'string', nullable: true },
          photo: { type: 'string', nullable: true },
          bookingsCount: { type: 'number' },
          activeToursCount: {
            type: 'number',
            description: 'Number of active tours for the operator',
          },
        },
      },
    },
  })
  async getPopular(@Query() query: GetPopularOperatorsDto) {
    const DEFAULT_LIMIT = 6;
    const MAX_LIMIT = 100;

    let limit = query.limit ?? DEFAULT_LIMIT;
    if (limit > MAX_LIMIT) {
      limit = MAX_LIMIT;
    }

    return this.operatorService.getPopularOperators(limit);
  }
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.operatorService.getOperatorById(id);
  }
  @UseGuards(JwtAuthGuard)
  @Delete('me/photo')
  deletePhoto(@Req() req: AuthenticatedRequest) {
    return this.operatorService.deletePhoto(req);
  }
}
