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

    const tour = await this.db.query.tours.findFirst({
      where: (tours, { eq }) => eq(tours.id, data.tourId),
    });
    if (!tour) {
      throw new NotFoundException(`Tour with id ${data.tourId} not found`);
    }

    if (
      data.numberOfPeople > 100 ||
      data.numberOfPeople < 2 ||
      data.numberOfPeople % 2 !== 0
    ) {
      throw new ConflictException(
        `Booking for ${data.numberOfPeople} people for tour with id ${data.tourId} has an invalid number of  spots: ${data.numberOfPeople}. Booking spots must be between 2 and 100 (inclusive) and an even number.`,
      );
    }

    if (tour.availableSpots < data.numberOfPeople) {
      throw new ConflictException(
        `Not enough available spots for this tour. Available spots: ${tour.availableSpots}`,
      );
    }

    if (data.firstPersonName && (!data.firstPersonSurname || !data.phone)) {
      throw new ConflictException(
        `If you provide a first person's name, you must also provide a surname and a phone number.`,
      );
    }

    const newAvailableSpots = tour.availableSpots - data.numberOfPeople;

    console.log('Debug: tour.availableSpots', tour.availableSpots);
    console.log('Debug: data.numberOfPeople', data.numberOfPeople);
    console.log('Debug: newAvailableSpots', newAvailableSpots);

    if (
      newAvailableSpots < 0 ||
      newAvailableSpots > 100 ||
      newAvailableSpots % 2 !== 0
    ) {
      throw new ConflictException(
        `Booking for ${data.numberOfPeople} people would result in an invalid number of available spots (${newAvailableSpots}) for tour with id ${data.tourId}. Available spots must be between 2 and 100 (inclusive) and an even number.`,
      );
    }

    const totalPrice = Number(tour.price) * data.numberOfPeople;

    const newBooking = await this.db.transaction(async (tx) => {
      const [booking] = await tx
        .insert(bookings)
        .values({
          userId: data.userId,
          tourId: data.tourId,
          numberOfPeople: data.numberOfPeople,
          firstPersonName: data.firstPersonName,
          firstPersonSurname: data.firstPersonSurname,
          secondPersonName: data.secondPersonName,
          secondPersonSurname: data.secondPersonSurname,
          phone: data.phone,
          totalPrice: totalPrice.toString(),
          currency: tour.currency,
          paymentProvider: data.paymentProvider,
          status: 'pending_payment',
        })
        .returning();

      const updatedTour = await tx
        .update(schema.tours)
        .set({
          availableSpots: newAvailableSpots,
        })
        .where(eq(schema.tours.id, data.tourId));

      console.log('Updated tour after booking:', updatedTour);

      return booking;
    });

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
        success_url: `${process.env.FRONTEND_URL}/catalog/tour/${newBooking.id}?success=true`,
        cancel_url: `${process.env.FRONTEND_URL}/catalog/${newBooking.id}?cancelled=true`,
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
        result_url: `${process.env.FRONTEND_URL}/catalog/tour/${newBooking.id}?success=true`,
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
