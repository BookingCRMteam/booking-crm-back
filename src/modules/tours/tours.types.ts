export interface TourPhoto {
  id: number;
  tourId: number;
  url: string;
  isMain: boolean;
  description: string | null;
}

interface Translation {
  id: number;
  languageCode: string;
  name: string;
  [key: string]: any;
}

interface Country {
  id: number;
  iso2: string;
  iso3: string;
  translations: Translation[];
  [key: string]: any;
}

interface City {
  id: number;
  countryIso2: string;
  translations: Translation[];
  [key: string]: any;
}

interface Operator {
  id: number;
  email: string | null;
  companyName: string;
  phone: string;
  [key: string]: any;
}

export interface Tour {
  id: number;
  operatorId: number;
  title: string;
  description?: string | null;
  countryISO2Code: string;
  cityId?: number | null;
  type?: string | null;
  price: string;
  currency?: string | null;
  startDate: string;
  endDate: string;
  availableSpots: number;
  bookedSpots?: number | null;
  totalSpots?: number | null;
  conditions?: string | null;
  isActive?: boolean;
  isFeatured?: boolean | null;
  createdAt?: Date;
  updatedAt?: Date;
  adults?: number;
  children?: number;
  petsAllowed?: boolean;
  departureCityId?: number | null;
  departureCountryISO2Code?: string | null;
  photos?: TourPhoto[];
  country?: Country;
  city?: City;
  departureCity?: City;
  operator?: Operator;
}
