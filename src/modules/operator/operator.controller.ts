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
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { OperatorService } from './operator.service';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@app/types/authenticated.request';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';

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
  getAll(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.operatorService.getAllOperators(limit, offset);
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
