import { CountryISO2CodeEnum } from '@app/db/schema/enums/country-code.enum';
export interface TourPhoto {
  id: number;
  tourId: number;
  url: string;
}

export interface Tour {
  id: number;
  operatorId: number;
  title: string;
  description?: string | null;
  countryISO2Code: CountryISO2CodeEnum; // Змінено на countryId
  cityId?: number | null; // Змінено на cityId
  type?: string | null;
  price: string; // Або number, залежить від вашої логіки
  currency?: string | null;
  startDate: string;
  endDate: string;
  availableSpots: number;
  conditions?: string | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  adults?: number;
  children?: number;
  petsAllowed?: boolean;
  departureCityId?: number | null;
  departureCountryISO2Code?: CountryISO2CodeEnum | null;
  photos?: TourPhoto[]; // Якщо ви використовуєте 'with: { photos: true }'
}
