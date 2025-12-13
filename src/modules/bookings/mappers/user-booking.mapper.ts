import { BookingWithTour } from './booking-with-tour.type';

export class UserBookingMapper {
  static toResponse(booking: BookingWithTour, paymentLink?: string | null) {
    return {
      bookingId: booking.id,
      status: booking.status,
      bookingPrice: booking.totalPrice,
      currency: booking.currency,
      numberOfPeople: booking.numberOfPeople,
      firstPersonName: booking.firstPersonName,
      phone: booking.phone,
      canRetryPayment: booking.status === 'pending_payment',
      paymentLink: paymentLink ?? null,
      tour: {
        id: booking.tour.id,
        title: booking.tour.title,
        coverImage: booking.tour.coverImage ?? null,
      },
    };
  }
}
