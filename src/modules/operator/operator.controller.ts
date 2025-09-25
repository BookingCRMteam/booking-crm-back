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

enum OperatorStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

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
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        companyName: { type: 'string' },
        description: { type: 'string' },
        phone: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        website: { type: 'string' },
        philosophy: { type: 'string' },
        photo: {
          type: 'string',
          format: 'binary',
          nullable: true,
        },
      },
    },
  })
  updateOperator(
    @Body() operatorInfoDTO: UpdateOperatorDto,
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
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
