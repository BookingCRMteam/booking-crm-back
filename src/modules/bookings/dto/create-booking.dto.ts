import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
} from 'class-validator';

// Створіть DTO для вхідних даних
export class CreateBookingDto {
  @ApiProperty({ example: 1, description: 'ID of the tour to book' })
  @IsNumber()
  @IsNotEmpty()
  @IsInt()
  @Max(2147483647)
  tourId: number;

  @ApiProperty({
    example: 101,
    description: 'ID of the user making the booking',
  })
  @IsNumber()
  @IsNotEmpty()
  @IsInt()
  @Max(2147483647)
  userId: number;

  @ApiProperty({
    example: 'liqpay',
    description: 'Payment provider to use for now only liqpay',
    default: 'liqpay',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['liqpay', 'stripe'])
  paymentProvider: 'liqpay' | 'stripe';
}
