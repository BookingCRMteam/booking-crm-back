import { ApiProperty } from '@nestjs/swagger';

export class OperatorBookingResponseDto {
  @ApiProperty({ example: 1 })
  bookingId: number;

  @ApiProperty({ example: 'paid' })
  status: string;

  @ApiProperty({ example: '400.00' })
  totalPrice: string;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ example: '2025-11-10T10:34:12.000Z' })
  createdAt: string;

  @ApiProperty({ example: 'Discover Carpathians' })
  tourTitle: string;

  @ApiProperty({ example: '2025-07-01' })
  startDate: string;

  @ApiProperty({ example: '2025-07-10' })
  endDate: string;
}
