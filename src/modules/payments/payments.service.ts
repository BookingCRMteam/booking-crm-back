import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  RawBodyRequest,
  UnauthorizedException,
} from '@nestjs/common';
import * as schema from '@app/db/schema/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import LiqPay from 'liqpayjs-sdk';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Request } from 'express';

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
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new InternalServerErrorException(
        'STRIPE_WEBHOOK_SECRET is not configured',
      );
    }
    const event = this.stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const bookingId = session?.metadata?.bookingId;
      if (!bookingId) {
        throw new BadRequestException('Booking ID not found in metadata');
      }

      const booking = await this.db.query.bookings.findFirst({
        where: (bookings, { eq }) => eq(bookings.id, parseInt(bookingId)),
      });

      if (booking && booking.status === 'pending_payment') {
        // Update booking status in a transaction
        await this.db.transaction(async (tx) => {
          // Re-check status within transaction to prevent race conditions
          const currentBooking = await tx.query.bookings.findFirst({
            where: (bookings, { eq }) => eq(bookings.id, booking.id),
          });
          if (currentBooking?.status === 'pending_payment') {
            await tx
              .update(bookings)
              .set({ status: 'confirmed', updatedAt: new Date() })
              .where(eq(bookings.id, booking.id));
          }
        });
        console.log(`Booking ${booking.id} confirmed via Stripe webhook.`);
        // Тут можна додати логіку сповіщення користувача
      }
    }
  }

  async handleLiqpayWebhook(data: { data: string; signature: string }) {
    if (!process.env.LIQPAY_PRIVATE_KEY) {
      throw new InternalServerErrorException(
        'LIQPAY_PRIVATE_KEY is not configured',
      );
    }
    // Верифікація підпису liqpayjs-sdk
    const validSignature = this.liqpay.str_to_sign(
      process.env.LIQPAY_PRIVATE_KEY +
        data.data +
        process.env.LIQPAY_PRIVATE_KEY,
    );

    if (validSignature !== data.signature) {
      throw new UnauthorizedException('Liqpay signature verification failed');
    }

    const decodedData = JSON.parse(
      Buffer.from(data.data, 'base64').toString('utf8'),
    ) as { status: string; order_id: string };
    if (decodedData.status === 'success' || decodedData.status === 'sandbox') {
      const orderId = decodedData.order_id;
      const orderIdParts = orderId.split('_');
      if (orderIdParts.length < 2 || orderIdParts[0] !== 'booking') {
        throw new BadRequestException(`Invalid order_id format: ${orderId}`);
      }
      const bookingId = parseInt(orderIdParts[1]);
      if (isNaN(bookingId)) {
        throw new BadRequestException(
          `Invalid booking ID in order_id: ${orderId}`,
        );
      }

      const booking = await this.db.query.bookings.findFirst({
        where: (bookings, { eq }) => eq(bookings.id, bookingId),
      });
      if (booking && booking.status === 'pending_payment') {
        // Update booking status in a transaction
        await this.db.transaction(async (tx) => {
          // Re-check status within transaction to prevent race conditions
          const currentBooking = await tx.query.bookings.findFirst({
            where: (bookings, { eq }) => eq(bookings.id, booking.id),
          });
          if (currentBooking?.status === 'pending_payment') {
            await tx
              .update(bookings)
              .set({ status: 'confirmed', updatedAt: new Date() })
              .where(eq(bookings.id, booking.id));
          }
        });
        console.log(`Booking ${booking.id} confirmed via Liqpay webhook.`);
        // Тут можна додати логіку сповіщення користувача
      }
    }
  }
}
