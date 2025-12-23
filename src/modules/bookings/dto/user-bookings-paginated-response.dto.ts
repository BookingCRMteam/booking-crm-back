import { ApiProperty } from '@nestjs/swagger';
import { UserBookingResponseDto } from './user-booking-response.dto';
import { PaginationMetaDto } from './pagination-meta.dto';

export class UserBookingsPaginatedResponseDto {
  @ApiProperty({ type: [UserBookingResponseDto] })
  data: UserBookingResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
