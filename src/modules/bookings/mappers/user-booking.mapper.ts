import { BookingWithTour } from './booking-with-tour.type';
import { UserBookingResponseDto } from '../dto/user-booking-response.dto';

export class UserBookingMapper {
  static toResponse(
    booking: BookingWithTour,
    paymentLink?: string | null,
  ): UserBookingResponseDto {
    const cityData = booking.tour.city ?? booking.tour.cityRelation;
    const countryData = booking.tour.country ?? booking.tour.countryRelation;

    const cityTranslation =
      cityData?.translations?.find((t) => t.languageCode === 'en') ??
      cityData?.translations?.[0];
    const countryTranslation =
      countryData?.translations?.find((t) => t.languageCode === 'en') ??
      countryData?.translations?.[0];

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

        city: cityData
          ? {
              id: cityData.id,
              name: cityTranslation?.name ?? null,
            }
          : null,

        country: countryData
          ? {
              iso2: countryData.iso2,
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
