import { InferSelectModel } from 'drizzle-orm';
import { bookings } from '../bookings.schema';
import { tours, tourPhotos } from '@app/db/schema/schema';

export type BookingWithTour = InferSelectModel<typeof bookings> & {
  tour: InferSelectModel<typeof tours> & {
    photos: InferSelectModel<typeof tourPhotos>[];
  };
};
