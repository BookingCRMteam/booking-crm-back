import { InferSelectModel } from 'drizzle-orm';
import {
  bookings,
  tours,
  tourPhotos,
  operators,
  cities,
  countries,
  cityTranslations,
  countryTranslations,
} from '@app/db/schema/schema';

export type BookingWithTour = InferSelectModel<typeof bookings> & {
  tour: InferSelectModel<typeof tours> & {
    photos: InferSelectModel<typeof tourPhotos>[];

    operator: Pick<
      InferSelectModel<typeof operators>,
      'id' | 'firstName' | 'lastName' | 'photo'
    > | null;

    cityRelation:
      | (InferSelectModel<typeof cities> & {
          translations: InferSelectModel<typeof cityTranslations>[];
        })
      | null;

    countryRelation:
      | (InferSelectModel<typeof countries> & {
          translations: InferSelectModel<typeof countryTranslations>[];
        })
      | null;
  };
};
