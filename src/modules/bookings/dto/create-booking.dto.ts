import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
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
    example: 2,
    description: 'Number of people for the booking',
    default: 2,
  })
  @IsNumber()
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  @Max(100)
  numberOfPeople: number;

  @ApiProperty({
    example: 'John',
    description: "First person's name",
  })
  @IsString()
  firstPersonName: string;

  @ApiProperty({
    example: 'Doe',
    description: "First person's surname",
  })
  @IsString()
  firstPersonSurname: string;

  @ApiProperty({
    example: 'Jane',
    description: "Second person's name",
    required: false,
  })
  @IsString()
  secondPersonName?: string;

  @ApiProperty({
    example: 'Doe',
    description: "Second person's surname",
    required: false,
  })
  @IsString()
  secondPersonSurname?: string;

  @ApiProperty({
    example: '+380123456789',
    description: 'Contact phone number',
  })
  @IsString()
  phone: string;

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
