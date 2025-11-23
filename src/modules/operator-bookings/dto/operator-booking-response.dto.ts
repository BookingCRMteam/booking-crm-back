import { ApiProperty } from '@nestjs/swagger';

export class OperatorBookingResponseDto {
  @ApiProperty({ example: 1 })
  bookingId: number;

  @ApiProperty({ example: 'Discover Carpathians' })
  tourTitle: string;

  @ApiProperty({ example: 'Анна та Марк' })
  customerName: string;

  @ApiProperty({ example: '+380501112233' })
  customerPhone: string;

  @ApiProperty({ example: '2025-07-01' })
  startDate: string;

  @ApiProperty({ example: '2025-07-10' })
  endDate: string;

  @ApiProperty({ example: '4000.00' })
  totalPriceUAH: string;

  @ApiProperty({ example: 'paid' })
  status: string;

  @ApiProperty({ example: '2025-11-10T10:34:12.000Z' })
  createdAt: string;
}
