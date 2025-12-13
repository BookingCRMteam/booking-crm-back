import { InferSelectModel } from 'drizzle-orm';
import { bookings } from '../bookings.schema';
import { tours } from '@app/db/schema/schema';

export type BookingWithTour = InferSelectModel<typeof bookings> & {
  tour: InferSelectModel<typeof tours> & {
    coverImage?: string | null; // поле стало опціональним
  };
};
