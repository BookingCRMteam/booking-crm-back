import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';

// Створіть DTO для вхідних даних
export class CreateBookingDto {
  @ApiProperty({ example: 1, description: 'ID of the tour to book' })
  @IsNumber()
  @IsNotEmpty()
  tourId: number;

  @ApiProperty({
    example: 101,
    description: 'ID of the user making the booking',
  })
  @IsNumber()
  @IsNotEmpty()
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
