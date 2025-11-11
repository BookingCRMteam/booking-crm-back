import { IsNumber, IsNotEmpty, IsPositive } from 'class-validator';

export class SubscribeBookingDto {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  bookingId: number;
}
