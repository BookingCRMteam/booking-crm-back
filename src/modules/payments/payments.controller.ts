import {
  Controller,
  Post,
  Body,
  // Req,
  // Headers,
  // RawBodyRequest,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // @Post('stripe-webhook')
  // async handleStripeWebhook(
  //   @Req() req: RawBodyRequest<any>,
  //   @Headers('stripe-signature') signature: string,
  // ) {
  //   if (!signature) {
  //     return { received: false };
  //   }
  //   await this.paymentsService.handleStripeWebhook(req, signature);
  //   return { received: true };
  // }

  @Post('liqpay-webhook')
  async handleLiqpayWebhook(@Body() data: { data: string; signature: string }) {
    console.log('LiqPay webhook received:', data);
    await this.paymentsService.handleLiqpayWebhook(data);
    return { received: true };
  }
}
