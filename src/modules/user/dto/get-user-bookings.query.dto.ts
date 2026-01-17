import { IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum BookingStatus {
  pending_payment = 'pending_payment',
  paid = 'paid',
  cancelled = 'cancelled',
}

export class GetUserBookingsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10000)
  offset?: number = 0;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
