import { ApiProperty } from '@nestjs/swagger';

export class ResponseBookingDto {
  @ApiProperty({ example: 1, description: 'ID of the created booking' })
  id: number;

  @ApiProperty({
    example: 'pending_payment',
    description: 'Status of the booking',
  })
  status: string;

  @ApiProperty({
    example:
      '<form method="POST" action="https://www.liqpay.ua/api/3/checkout" accept-charset="utf-8"><input type="hidden" name="data" value="eyJhY3Rp...." /><input type="hidden" name="signature" value="8M+Fnwbiu...." /><input type="image" src="//static.liqpay.ua/buttons/p1en.radius.png" name="btn_text" /></form>',
    description: 'URL to redirect for payment',
  })
  paymentLink: string;
}
