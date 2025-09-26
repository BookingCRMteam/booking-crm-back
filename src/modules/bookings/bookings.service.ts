import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as schema from '@app/db/schema/schema';
import { bookings } from './bookings.schema';
import LiqPay from 'liqpayjs-sdk'; // <-- Змінено тут
import Stripe from 'stripe';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  private stripe: Stripe;
  private liqpay: LiqPay;

  constructor(
    @Inject('DRIZZLE_CLIENT')
    private db: NodePgDatabase<typeof schema>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    });
    if (!process.env.LIQPAY_PUBLIC_KEY || !process.env.LIQPAY_PRIVATE_KEY) {
      throw new Error('LiqPay public and private keys are not set');
    }
    this.liqpay = new LiqPay(
      process.env.LIQPAY_PUBLIC_KEY,
      process.env.LIQPAY_PRIVATE_KEY,
    );
  }

  async createBooking(data: CreateBookingDto) {
    // 1. Check if user and tour exist
    const user = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, data.userId),
    });
    if (!user) {
      throw new NotFoundException(`User with id ${data.userId} not found`);
    }

    console.log('Creating booking with data.tourId:', data.tourId);

    const tour = await this.db.query.tours.findFirst({
      where: (tours, { eq }) => eq(tours.id, data.tourId),
    });
    if (!tour) {
      throw new NotFoundException(`Tour with id ${data.tourId} not found`);
    }

    const totalPrice = tour.price; // Спрощений розрахунок

    let newBooking: typeof bookings.$inferSelect;
    try {
      [newBooking] = await this.db
        .insert(bookings)
        .values({
          userId: data.userId,
          tourId: data.tourId,
          totalPrice: totalPrice,
          currency: tour.currency,
          paymentProvider: data.paymentProvider,
          status: 'pending_payment',
        })
        .returning();
    } catch (error) {
      if ((error as { cause?: { code?: string } }).cause?.code === '23505') {
        throw new ConflictException(
          'A pending booking for this tour and user already exists.',
        );
      }
      throw error;
    }

    // 3. Згенерувати посилання для оплати залежно від провайдера
    let paymentLink: string | undefined;
    let paymentSessionId: string | undefined;

    if (data.paymentProvider === 'stripe') {
      const session = await this.stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: newBooking.currency,
              product_data: {
                name: `Booking for tour ${tour.title}`,
              },
              unit_amount: Math.round(Number(newBooking.totalPrice) * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/booking/${newBooking.id}?success=true`,
        cancel_url: `${process.env.FRONTEND_URL}/booking/${newBooking.id}?cancelled=true`,
        // Метадані для webhook
        metadata: {
          bookingId: newBooking.id.toString(),
        },
      });
      paymentLink = session.url;
      paymentSessionId = session.id;
    } else if (data.paymentProvider === 'liqpay') {
      const orderId = `booking_${newBooking.id}_${Date.now()}`;
      const liqpayParams = {
        action: 'pay',
        amount: Number(newBooking.totalPrice).toFixed(2),
        currency: newBooking.currency,
        description: `Booking for tour ${tour.title}`,
        order_id: orderId,
        server_url: `${process.env.API_URL}/payments/liqpay-webhook`,
        result_url: `${process.env.FRONTEND_URL}/booking/${newBooking.id}?success=true`,
        version: 3,
        language: 'en',
      };
      let liqpayPayment: string | undefined;
      try {
        liqpayPayment = this.liqpay.cnb_form(liqpayParams) ?? '';
      } catch (error) {
        console.error(error);
        throw new Error('Error generating LiqPay payment');
      }
      paymentLink = liqpayPayment;
      paymentSessionId = liqpayParams.order_id;
    }

    // 4. Оновити бронювання з ідентифікатором сесії оплати
    await this.db
      .update(bookings)
      .set({ paymentSessionId })
      .where(eq(bookings.id, newBooking.id));

    return {
      booking: newBooking,
      paymentLink: paymentLink,
    };
  }
}
