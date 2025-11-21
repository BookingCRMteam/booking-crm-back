import { Injectable, Inject } from '@nestjs/common';
import { eq, inArray, and, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { bookings, tours, users, operators } from '@app/db/schema/schema';
import type { OperatorBookingResponseDto } from './dto/operator-booking-response.dto';

@Injectable()
export class OperatorBookingsService {
  constructor(
    @Inject('DRIZZLE_CLIENT')
    private readonly db: NodePgDatabase,
  ) {}

  private convertToUAH(amount: string, currency: string): string {
    if (currency === 'UAH') return amount;

    const rate = currency === 'USD' ? 40 : 43; // USD≈40, EUR≈43 — базові значення
    return (parseFloat(amount) * rate).toFixed(2);
  }

  async getOperatorBookings(
    operatorUserId: number,
  ): Promise<OperatorBookingResponseDto[]> {
    if (!operatorUserId) return [];

    const [operator] = await this.db
      .select({ operatorId: operators.id })
      .from(operators)
      .where(eq(operators.userId, operatorUserId));

    if (!operator) return [];

    const toursList = await this.db
      .select({ id: tours.id })
      .from(tours)
      .where(eq(tours.operatorId, operator.operatorId));

    const tourIds = toursList.map((t) => t.id);

    if (tourIds.length === 0) return [];

    const result = await this.db
      .select({
        bookingId: bookings.id,
        status: bookings.status,
        totalPrice: bookings.totalPrice,
        currency: bookings.currency,
        createdAt: bookings.createdAt,
        tourTitle: tours.title,
        startDate: tours.startDate,
        endDate: tours.endDate,
        customerName: sql`
          ${users.firstPersonName} || ' ' || ${users.firstPersonSurname} ||
          ' та ' ||
          ${users.secondPersonName} || ' ' || ${users.secondPersonSurname}
        `.as('customer_name'),
        customerPhone: users.phone,
      })
      .from(bookings)
      .innerJoin(tours, eq(bookings.tourId, tours.id))
      .innerJoin(users, eq(bookings.userId, users.id))
      .where(
        and(inArray(bookings.tourId, tourIds), eq(bookings.status, 'paid')),
      );

    return result.map((b) => ({
      bookingId: b.bookingId,
      tourTitle: b.tourTitle,
      customerName: b.customerName as string,
      customerPhone: b.customerPhone ?? '',
      startDate: new Date(b.startDate as unknown as string)
        .toISOString()
        .split('T')[0],
      endDate: new Date(b.endDate as unknown as string)
        .toISOString()
        .split('T')[0],
      totalPriceUAH: this.convertToUAH(String(b.totalPrice), b.currency),
      status: b.status,
      createdAt: new Date(b.createdAt as unknown as string).toISOString(),
    }));
  }
}
