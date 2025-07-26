export interface TourPhoto {
  id: number;
  tourId: number;
  url: string;
  description?: string;
  isMain?: boolean;
}

export interface Tour {
  id: number;
  operatorId: number;
  title: string;
  description?: string;
  country: string;
  city?: string;
  type: string;
  price: number;
  currency?: string;
  startDate: string;
  endDate: string;
  availableSpots: number;
  conditions?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  photos?: TourPhoto[]; // тип для фото
}
