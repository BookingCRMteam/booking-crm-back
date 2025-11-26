import {
  Controller,
  Post,
  Body,
  Req,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('stripe-webhook')
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      return { received: false };
    }
    await this.paymentsService.handleStripeWebhook(req, signature);
    return { received: true };
  }

  @Post('liqpay-webhook')
  async handleLiqpayWebhook(@Body() data: { data: string; signature: string }) {
    await this.paymentsService.handleLiqpayWebhook(data);
    return { received: true };
  }
}
