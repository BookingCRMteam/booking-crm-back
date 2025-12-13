import { ApiProperty } from '@nestjs/swagger';

class TourShortDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  price: string;

  @ApiProperty({ required: false })
  coverImage?: string;
}

export class UserBookingResponseDto {
  @ApiProperty()
  bookingId: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  bookingPrice: string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  numberOfPeople: number;

  @ApiProperty({ required: false })
  firstPersonName?: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ nullable: true })
  paymentLink: string | null;

  @ApiProperty()
  tour: TourShortDto;
}
