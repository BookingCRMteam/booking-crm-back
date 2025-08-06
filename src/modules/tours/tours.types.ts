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
  countryId: number; // Змінено на countryId
  cityId?: number | null; // Змінено на cityId
  type: string;
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
  departureCountryId?: number | null;
  // Якщо ви "джойните" країни/міста, то можете додати їх сюди
  country?: { id: number; name: string };
  city?: { id: number; name: string };
  departureCity?: { id: number; name: string };
  departureCountry?: { id: number; name: string };
  photos?: TourPhoto[]; // Якщо ви використовуєте 'with: { photos: true }'
}
