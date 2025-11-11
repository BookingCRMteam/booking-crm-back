import { IsNumber, IsNotEmpty } from 'class-validator';

export class SubscribeBookingDto {
  @IsNumber()
  @IsNotEmpty()
  bookingId: number;
}
