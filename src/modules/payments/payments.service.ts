import { Inject, Injectable, RawBodyRequest } from '@nestjs/common';
import * as schema from 'src/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import LiqPay from 'liqpayjs-sdk';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

const { bookings } = schema;
@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private liqpay: LiqPay;

  constructor(
    @Inject('DRIZZLE_CLIENT')
    private db: NodePgDatabase<typeof schema>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    });
    this.liqpay = new LiqPay(
      process.env.LIQPAY_PUBLIC_KEY,
      process.env.LIQPAY_PRIVATE_KEY,
    );
  }

  async handleStripeWebhook(req: RawBodyRequest<Request>, signature: string) {
    const event = this.stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const bookingId = session.metadata.bookingId;

      if (!bookingId) {
        throw new Error('Booking ID not found in metadata');
      }

      const booking = await this.db.query.bookings.findFirst({
        where: (bookings, { eq }) => eq(bookings.id, parseInt(bookingId)),
      });

      if (booking && booking.status === 'pending_payment') {
        // Оновити статус бронювання
        await this.db
          .update(bookings)
          .set({ status: 'confirmed' })
          .where(eq(bookings.id, booking.id));
        console.log(`Booking ${booking.id} confirmed via Stripe webhook.`);
        // Тут можна додати логіку сповіщення користувача
      }
    }
  }

  async handleLiqpayWebhook(data: { data: string; signature: string }) {
    // Верифікація підпису liqpayjs-sdk
    const validSignature = this.liqpay.str_to_sign(
      process.env.LIQPAY_PRIVATE_KEY +
        data.data +
        process.env.LIQPAY_PRIVATE_KEY,
    );

    if (validSignature !== data.signature) {
      throw new Error('Liqpay signature verification failed');
    }

    const decodedData = JSON.parse(
      Buffer.from(data.data, 'base64').toString('utf8'),
    ) as { status: string; order_id: string };
    if (decodedData.status === 'success' || decodedData.status === 'sandbox') {
      const orderId = decodedData.order_id;
      const bookingId = parseInt(orderId.split('_')[1]);

      const booking = await this.db.query.bookings.findFirst({
        where: (bookings, { eq }) => eq(bookings.id, bookingId),
      });

      if (booking && booking.status === 'pending_payment') {
        await this.db
          .update(bookings)
          .set({ status: 'confirmed' })
          .where(eq(bookings.id, bookingId));
        console.log(`Booking ${booking.id} confirmed via Liqpay webhook.`);
      }
    }
  }
}
