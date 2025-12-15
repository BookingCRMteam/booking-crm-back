import { ApiProperty } from '@nestjs/swagger';

class TourPhotoDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  url: string;

  @ApiProperty()
  isMain: boolean;

  @ApiProperty({ required: false })
  description?: string;
}

/* 🔹 НОВЕ */
class OperatorShortDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ nullable: true })
  photo: string | null;
}

/* 🔹 НОВЕ */
class CityShortDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}

/* 🔹 НОВЕ */
class CountryShortDto {
  @ApiProperty()
  iso2: string;

  @ApiProperty()
  name: string;
}

class TourShortDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  operatorId: number;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  countryISO2Code: string;

  @ApiProperty()
  cityId: number;

  @ApiProperty({ required: false })
  type?: string;

  @ApiProperty()
  price: string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  startDate: string;

  @ApiProperty()
  endDate: string;

  @ApiProperty()
  availableSpots: number;

  @ApiProperty({ required: false })
  conditions?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isFeatured: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [TourPhotoDto], required: false })
  photos?: TourPhotoDto[];

  /* 🔥 ДОДАЛИ */
  @ApiProperty({ nullable: true })
  operator?: OperatorShortDto | null;

  @ApiProperty({ nullable: true })
  city?: CityShortDto | null;

  @ApiProperty({ nullable: true })
  country?: CountryShortDto | null;
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
  canRetryPayment: boolean;

  @ApiProperty()
  tour: TourShortDto;
}
