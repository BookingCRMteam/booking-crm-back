import { count, sum, lt, and, isNotNull, inArray, eq, sql } from 'drizzle-orm';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as schema from '@app/db/schema/schema';
import { bookings } from './bookings.schema';
import LiqPay from 'liqpayjs-sdk'; // <-- Змінено тут
import Stripe from 'stripe';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UserBookingMapper } from './mappers/user-booking.mapper';
import { EmailQueueService } from '../email-queue/email-queue.service';

function isPgError(err: unknown): err is { cause: { code: string } } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'cause' in err &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof (err as any).cause === 'object' &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (err as any).cause !== null &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    'code' in (err as any).cause &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof (err as any).cause.code === 'string'
  );
}
@Injectable()
export class BookingsService {
  private stripe: Stripe;
  private liqpay: LiqPay;

  constructor(
    @Inject('DRIZZLE_CLIENT')
    private db: NodePgDatabase<typeof schema>,
    private readonly emailQueueService: EmailQueueService,
  ) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
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
      with: { operator: true },
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
        `Booking for ${data.numberOfPeople} people for tour with id ${data.tourId} is invalid. Number of people must be between 2 and 100 (inclusive) and an even number.`,
      );
    }

    if (tour.availableSpots < data.numberOfPeople) {
      throw new ConflictException(
        `Not enough available spots for this tour. Available spots: ${tour.availableSpots}`,
      );
    }

    const newAvailableSpots = tour.availableSpots - data.numberOfPeople;

    if (newAvailableSpots > 100) {
      throw new ConflictException(
        `Booking for ${data.numberOfPeople} people would result in an invalid number of available spots (${newAvailableSpots}) for tour with id ${data.tourId}. Available spots must be between 0 and 100 (inclusive).`,
      );
    }

    // Price is per couple (2 people), so divide numberOfPeople by 2 to get number of couples
    const numberOfCouples = data.numberOfPeople / 2;
    const totalPrice = Number(tour.price) * numberOfCouples;
    const newBooking = await this.db.transaction(async (tx) => {
      const [tourForUpdate] = await tx
        .select()
        .from(schema.tours)
        .where(eq(schema.tours.id, data.tourId))
        .for('update');

      if (!tourForUpdate) {
        throw new NotFoundException(`Tour with id ${data.tourId} not found`);
      }

      if (tourForUpdate.availableSpots < data.numberOfPeople) {
        throw new ConflictException(
          `Not enough available spots for this tour. Available spots: ${tourForUpdate.availableSpots}`,
        );
      }
      const newAvailableSpots =
        tourForUpdate.availableSpots - data.numberOfPeople;

      if (newAvailableSpots > 100) {
        throw new ConflictException(
          `Booking for ${data.numberOfPeople} people would result in an invalid number of available spots (${newAvailableSpots}) for tour with id ${data.tourId}. Available spots must be between 0 and 100 (inclusive).`,
        );
      }

      try {
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

        await tx
          .update(schema.tours)
          .set({
            availableSpots: newAvailableSpots,
          })
          .where(eq(schema.tours.id, data.tourId));

        return booking;
      } catch (error: unknown) {
        if (isPgError(error) && error.cause.code === '23505') {
          console.error('Error during booking transaction:', error.cause.code);

          throw new ConflictException(
            'Booking already exists for this user and tour.',
          );
        }
        throw error;
      }
    });

    // 3. Згенерувати посилання для оплати залежно від провайдера
    const { paymentLink, paymentSessionId } = await this.generatePaymentLink(
      newBooking,
      tour.title,
    );

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

  async findOne(id: number) {
    const booking = await this.db.query.bookings.findFirst({
      where: (bookings, { eq }) => eq(bookings.id, id),
    });
    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }
    return booking;
  }

  // New method to get booking statistics for a tour
  async getTourBookingStats(tourId: number) {
    // Count total bookings and sum number of people for the given tour
    const result = await this.db
      .select({
        totalBookings: count(),
        totalPeople: sum(bookings.numberOfPeople),
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.tourId, tourId),
          inArray(bookings.status, ['confirmed', 'pending_payment']),
        ),
      )
      .execute();
    const stats = result[0] ?? { totalBookings: 0, totalPeople: 0 };

    if (Number(stats.totalBookings) === 0) {
      throw new NotFoundException(
        `No bookings found for tour with id ${tourId}`,
      );
    }

    return {
      totalBookings: Number(stats.totalBookings),
      totalPeople: Number(stats.totalPeople),
    };
  }

  async getBookingsByUser(
    userId: number,
    query?: {
      status?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const limit = query?.limit;
    const offset = query?.offset ?? 0;

    const whereConditions = [eq(bookings.userId, userId)];

    if (query?.status) {
      whereConditions.push(eq(bookings.status, query.status));
    }

    const data = await this.db.query.bookings.findMany({
      where: and(...whereConditions),
      with: {
        tour: {
          with: {
            photos: true,
            operator: {
              columns: {
                id: true,
                firstName: true,
                lastName: true,
                photo: true,
              },
            },
            cityRelation: { with: { translations: true } },
            countryRelation: { with: { translations: true } },
          },
        },
      },
      orderBy: (b, { desc, sql }) => [
        sql`CASE WHEN ${b.status} = 'pending_payment' THEN 0 ELSE 1 END`,
        desc(b.createdAt),
      ],
      limit: limit,
      offset: offset || 0,
    });

    return data.map((booking) => UserBookingMapper.toResponse(booking));
  }

  async getBookingByUser(userId: number, bookingId: number) {
    const booking = await this.db.query.bookings.findFirst({
      where: (b, { eq, and }) => and(eq(b.id, bookingId), eq(b.userId, userId)),

      with: {
        tour: {
          with: {
            photos: true,
            operator: {
              columns: {
                id: true,
                firstName: true,
                lastName: true,
                photo: true,
              },
            },
            cityRelation: {
              with: {
                translations: true,
              },
            },
            countryRelation: {
              with: {
                translations: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    let paymentLink: string | null = null;

    if (booking.status === 'pending_payment') {
      if (booking.paymentProvider === 'stripe') {
        const session = await this.stripe.checkout.sessions.create({
          line_items: [
            {
              price_data: {
                currency: booking.currency,
                product_data: { name: booking.tour.title },
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

        paymentLink = session.url;
      } else if (booking.paymentProvider === 'liqpay') {
        const orderId = `booking_${booking.id}_${Date.now()}`;

        paymentLink =
          this.liqpay.cnb_form({
            action: 'pay',
            amount: Number(booking.totalPrice).toFixed(2),
            currency: booking.currency,
            description: `Booking for tour ${booking.tour.title}`,
            order_id: orderId,
            server_url: `${process.env.API_URL}/payments/liqpay-webhook`,
            result_url: `${process.env.FRONTEND_URL}/catalog/tour/${booking.tourId}?bookingId=${booking.id}`,
            version: 3,
            language: 'en',
          }) ?? null;
      }
    }

    return UserBookingMapper.toResponse(booking, paymentLink);
  }

  async getBookingWithTour(bookingId: number, tourId: number) {
    const booking = await this.db.query.bookings.findFirst({
      where: (bookings, { eq, and, inArray }) =>
        and(
          eq(bookings.id, bookingId),
          eq(bookings.tourId, tourId),
          inArray(bookings.status, ['confirmed', 'pending_payment']),
        ),
      with: {
        tour: {
          with: {
            photos: true,
            operator: {
              columns: {
                id: true,
                firstName: true,
                lastName: true,
                photo: true,
              },
            },
            cityRelation: {
              with: {
                translations: true,
              },
            },
            countryRelation: {
              with: {
                translations: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(
        `Booking with id ${bookingId} for tour ${tourId} not found`,
      );
    }

    const result = {
      ...booking,
      tour: {
        ...booking.tour,
        city: booking.tour.city ?? booking.tour.cityRelation,
        country: booking.tour.country ?? booking.tour.countryRelation,
      },
    };
    delete result.tour.cityRelation;
    delete result.tour.countryRelation;

    return result;
  }

  async repayBooking(bookingId: number) {
    const booking = await this.db.query.bookings.findFirst({
      where: (bookings, { eq }) => eq(bookings.id, bookingId),
      with: { tour: { with: { photos: true } } },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with id ${bookingId} not found`);
    }

    if (booking.status !== 'pending_payment') {
      throw new ConflictException(
        `Booking with id ${bookingId} is not in pending_payment status`,
      );
    }

    if (
      !booking.paymentProvider ||
      !['stripe', 'liqpay'].includes(booking.paymentProvider)
    ) {
      throw new BadRequestException(
        `Unsupported or missing payment provider: ${booking.paymentProvider}`,
      );
    }

    const { paymentLink, paymentSessionId } = await this.generatePaymentLink(
      booking,
      booking.tour.title,
    );

    if (paymentSessionId) {
      await this.db
        .update(bookings)
        .set({ paymentSessionId, updatedAt: new Date() })
        .where(eq(bookings.id, bookingId));
    }

    return {
      paymentLink,
    };
  }

  private async generatePaymentLink(
    booking: typeof bookings.$inferSelect,
    tourTitle: string,
  ): Promise<{ paymentLink: string; paymentSessionId: string }> {
    let paymentLink: string | undefined;
    let paymentSessionId: string | undefined;

    if (booking.paymentProvider === 'stripe') {
      try {
        const session = await this.stripe.checkout.sessions.create({
          line_items: [
            {
              price_data: {
                currency: booking.currency.toLowerCase(),
                product_data: {
                  name: `Booking for tour ${tourTitle}`,
                },
                unit_amount: Math.round(Number(booking.totalPrice) * 100),
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${process.env.FRONTEND_URL}/catalog/tour/${booking.tourId}?success=true&bookingId=${booking.id}`,
          cancel_url: `${process.env.FRONTEND_URL}/catalog/tour/${booking.tourId}?cancelled=true&bookingId=${booking.id}`,
          metadata: {
            bookingId: booking.id.toString(),
          },
        });
        if (!session.url) {
          throw new Error('Stripe returned null session.url');
        }
        paymentLink = session.url;
        paymentSessionId = session.id;
      } catch (error) {
        console.error('Stripe error:', error);
        throw new BadRequestException(
          'Failed to generate Stripe payment link. Please check configuration.',
        );
      }
    } else if (booking.paymentProvider === 'liqpay') {
      const orderId = `booking_${booking.id}_${Date.now()}`;
      const liqpayParams = {
        action: 'pay',
        amount: Number(booking.totalPrice).toFixed(2),
        currency: booking.currency,
        description: `Booking for tour ${tourTitle}`,
        order_id: orderId,
        server_url: `${process.env.API_URL}/payments/liqpay-webhook`,
        result_url: `${process.env.FRONTEND_URL}/catalog/tour/${booking.tourId}?success=true&bookingId=${booking.id}`,
        version: 3,
        language: 'en',
      };
      try {
        const liqpayPayment = this.liqpay.cnb_form(liqpayParams);
        if (!liqpayPayment) {
          throw new Error('LiqPay returned empty payment form');
        }
        paymentLink = liqpayPayment;
        paymentSessionId = liqpayParams.order_id;
      } catch (error) {
        console.error('LiqPay error:', error);
        throw new BadRequestException(
          'Failed to generate LiqPay payment link.',
        );
      }
    } else {
      // Should act as a fallback if the caller didn't check,
      // though calls from repayBooking are guarded.
      throw new BadRequestException(
        `Unsupported payment provider: ${booking.paymentProvider}`,
      );
    }

    if (!paymentLink) {
      throw new BadRequestException('Could not generate a valid payment link.');
    }

    if (!paymentSessionId) {
      throw new BadRequestException('Could not determine payment session id.');
    }
    return { paymentLink, paymentSessionId };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const expiredBookings = await this.db
      .update(bookings)
      .set({ status: 'expired' })
      .where(
        and(
          eq(bookings.status, 'pending_payment'),
          isNotNull(bookings.paymentSessionId),
          lt(bookings.updatedAt, oneHourAgo),
        ),
      )
      .returning();

    if (expiredBookings.length > 0) {
      console.log(`Expired ${expiredBookings.length} bookings.`);
    }
  }
  @Cron(CronExpression.EVERY_MINUTE)
  async updateBookedSpots() {
    await this.db.execute(sql`
      UPDATE tours
      SET booked_spots = COALESCE((
        SELECT SUM(number_of_people)
        FROM bookings
        WHERE bookings.tour_id = tours.id
          AND bookings.status IN ('pending_payment', 'confirmed')
      ), 0)
    `);
  }
}
