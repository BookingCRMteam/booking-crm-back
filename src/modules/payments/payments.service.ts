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
import { BookingGateway } from '../bookings/booking.gateway';
import { EmailQueueService } from '../email-queue/email-queue.service';

const { bookings } = schema;
@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private liqpay: LiqPay;

  constructor(
    @Inject('DRIZZLE_CLIENT')
    private db: NodePgDatabase<typeof schema>,
    private readonly bookingGateway: BookingGateway,
    private readonly emailQueueService: EmailQueueService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
    });
    this.liqpay = new LiqPay(
      process.env.LIQPAY_PUBLIC_KEY,
      process.env.LIQPAY_PRIVATE_KEY,
    );
  }
  async createPaymentForBooking(userId: number, bookingId: number) {
    const booking = await this.db.query.bookings.findFirst({
      where: (bookings, { eq }) => eq(bookings.id, bookingId),
    });

    if (!booking || booking.userId !== userId) {
      throw new BadRequestException('Booking not found or access denied');
    }

    if (booking.status !== 'pending_payment') {
      throw new BadRequestException('Booking is not in pending_payment status');
    }

    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: booking.currency,
            product_data: { name: `Retry payment for booking #${booking.id}` },
            unit_amount: Math.round(Number(booking.totalPrice) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/catalog/tour/${booking.tourId}?success=true&bookingId=${booking.id}`,
      cancel_url: `${process.env.FRONTEND_URL}/catalog/tour/${booking.tourId}?cancelled=true&bookingId=${booking.id}`,
      metadata: { bookingId: booking.id.toString() },
    });

    const paymentLink = session.url ?? null;

    return { paymentLink };
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
      if (!/^\d+$/.test(bookingId)) {
        throw new BadRequestException('Invalid booking ID format in metadata');
      }

      const booking = await this.db.query.bookings.findFirst({
        where: (bookings, { eq }) => eq(bookings.id, parseInt(bookingId)),
        with: {
          user: true,
          tour: {
            with: {
              operator: true,
            },
          },
        },
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
        this.bookingGateway.notifyBookingStatusChange(
          booking.id,
          'confirmed',
          booking.userId.toString(),
        );
        // Send booking confirmation email
        if (booking.user && booking.tour) {
          try {
            await this.emailQueueService.addBookingConfirmationEmail({
              email: booking.user.email,
              bookingDetails: {
                id: booking.id,
                tourName: booking.tour.title,
                startDate: new Date(booking.tour.startDate),
                endDate: new Date(booking.tour.endDate),
                price: parseFloat(booking.totalPrice),
                currency: booking.currency,
                numberOfPeople: booking.numberOfPeople,
                firstPersonName: booking.firstPersonName,
                firstPersonSurname: booking.firstPersonSurname,
              },
            });
            // Send operator notification
            if (booking.tour.operator && booking.tour.operator.email) {
              await this.emailQueueService.addOperatorBookingPaidEmail({
                email: booking.tour.operator.email,
                operatorName: `${booking.tour.operator.firstName} ${booking.tour.operator.lastName}`,
                bookingDetails: {
                  id: booking.id,
                  tourName: booking.tour.title,
                  startDate: new Date(booking.tour.startDate),
                  endDate: new Date(booking.tour.endDate),
                  numberOfPeople: booking.numberOfPeople,
                  totalPrice: parseFloat(booking.totalPrice),
                  currency: booking.currency,
                  customerName: `${booking.firstPersonName} ${booking.firstPersonSurname}`,
                  customerEmail: booking.user.email,
                },
              });
            }
          } catch (error) {
            console.error(
              `Failed to enqueue emails for booking ${booking.id}`,
              error,
            );
          }
        }
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
        with: {
          user: true,
          tour: {
            with: {
              operator: true,
            },
          },
        },
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
        this.bookingGateway.notifyBookingStatusChange(
          booking.id,
          'confirmed',
          booking.userId.toString(),
        );
        console.log(
          'Processing booking confirmation email for booking:',
          booking.id,
        );
        // Send booking confirmation email
        if (booking.user && booking.tour) {
          try {
            await this.emailQueueService.addBookingConfirmationEmail({
              email: booking.user.email,
              bookingDetails: {
                id: booking.id,
                tourName: booking.tour.title,
                startDate: new Date(booking.tour.startDate),
                endDate: new Date(booking.tour.endDate),
                price: parseFloat(booking.totalPrice),
                currency: booking.currency,
                numberOfPeople: booking.numberOfPeople,
                firstPersonName: booking.firstPersonName,
                firstPersonSurname: booking.firstPersonSurname,
              },
            });

            // Send operator notification
            if (booking.tour.operator && booking.tour.operator.email) {
              await this.emailQueueService.addOperatorBookingPaidEmail({
                email: booking.tour.operator.email,
                operatorName: `${booking.tour.operator.firstName} ${booking.tour.operator.lastName}`,
                bookingDetails: {
                  id: booking.id,
                  tourName: booking.tour.title,
                  startDate: new Date(booking.tour.startDate),
                  endDate: new Date(booking.tour.endDate),
                  numberOfPeople: booking.numberOfPeople,
                  totalPrice: parseFloat(booking.totalPrice),
                  currency: booking.currency,
                  customerName: `${booking.firstPersonName} ${booking.firstPersonSurname}`,
                  customerEmail: booking.user.email,
                },
              });
            }
          } catch (error) {
            // TODO: replace with structured logger if available
            console.error(
              `Failed to enqueue booking confirmation email for booking ${booking.id}`,
              error,
            );
          }
        }
      }
    }
  }
}
