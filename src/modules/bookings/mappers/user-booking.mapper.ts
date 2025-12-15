import { BookingWithTour } from './booking-with-tour.type';
import { UserBookingResponseDto } from '../dto/user-booking-response.dto';

export class UserBookingMapper {
  static toResponse(
    booking: BookingWithTour,
    paymentLink?: string | null,
  ): UserBookingResponseDto {
    const cityTranslation = booking.tour.city?.translations?.[0];
    const countryTranslation = booking.tour.country?.translations?.[0];

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
        operatorId: booking.tour.operatorId,
        title: booking.tour.title,
        description: booking.tour.description,
        countryISO2Code: booking.tour.countryISO2Code,
        cityId: booking.tour.cityId,
        type: booking.tour.type,
        price: booking.tour.price,
        currency: booking.tour.currency,
        startDate: booking.tour.startDate,
        endDate: booking.tour.endDate,
        availableSpots: booking.tour.availableSpots,
        conditions: booking.tour.conditions,
        isActive: booking.tour.isActive,
        isFeatured: booking.tour.isFeatured,
        createdAt: booking.tour.createdAt,
        updatedAt: booking.tour.updatedAt,
        photos: booking.tour.photos ?? [],

        city: booking.tour.city
          ? {
              id: booking.tour.city.id,
              name: cityTranslation?.name ?? null,
            }
          : null,

        country: booking.tour.country
          ? {
              iso2: booking.tour.country.iso2,
              name: countryTranslation?.name ?? null,
            }
          : null,

        operator: booking.tour.operator
          ? {
              id: booking.tour.operator.id,
              firstName: booking.tour.operator.firstName,
              lastName: booking.tour.operator.lastName,
              photo: booking.tour.operator.photo,
            }
          : null,
      },
    };
  }
}
