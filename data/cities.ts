// src/data/cities.ts

interface CityData {
  name: string;
  countryName: string; // Використовуватимемо це для пошуку countryId
}

export const CITIES_DATA: CityData[] = [
  // Україна
  { name: 'Kyiv', countryName: 'Ukraine' },
  { name: 'Lviv', countryName: 'Ukraine' },
  { name: 'Odesa', countryName: 'Ukraine' },
  { name: 'Kharkiv', countryName: 'Ukraine' },
  { name: 'Dnipro', countryName: 'Ukraine' },

  // Туреччина
  { name: 'Istanbul', countryName: 'Turkey' },
  { name: 'Antalya', countryName: 'Turkey' },
  { name: 'Ankara', countryName: 'Turkey' },
  { name: 'Izmir', countryName: 'Turkey' },
  { name: 'Bodrum', countryName: 'Turkey' },

  // Єгипет
  { name: 'Cairo', countryName: 'Egypt' },
  { name: 'Sharm El Sheikh', countryName: 'Egypt' },
  { name: 'Hurghada', countryName: 'Egypt' },
  { name: 'Luxor', countryName: 'Egypt' },

  // Греція
  { name: 'Athens', countryName: 'Greece' },
  { name: 'Thessaloniki', countryName: 'Greece' },
  { name: 'Heraklion', countryName: 'Greece' }, // Крит
  { name: 'Rhodes', countryName: 'Greece' },

  // Італія
  { name: 'Rome', countryName: 'Italy' },
  { name: 'Milan', countryName: 'Italy' },
  { name: 'Florence', countryName: 'Italy' },
  { name: 'Venice', countryName: 'Italy' },
  { name: 'Naples', countryName: 'Italy' },

  // Іспанія
  { name: 'Madrid', countryName: 'Spain' },
  { name: 'Barcelona', countryName: 'Spain' },
  { name: 'Seville', countryName: 'Spain' },
  { name: 'Valencia', countryName: 'Spain' },
  { name: 'Palma de Mallorca', countryName: 'Spain' },

  // Франція
  { name: 'Paris', countryName: 'France' },
  { name: 'Nice', countryName: 'France' },
  { name: 'Marseille', countryName: 'France' },

  // Німеччина
  { name: 'Berlin', countryName: 'Germany' },
  { name: 'Munich', countryName: 'Germany' },
  { name: 'Frankfurt', countryName: 'Germany' },

  // Польща
  { name: 'Warsaw', countryName: 'Poland' },
  { name: 'Krakow', countryName: 'Poland' },
  { name: 'Gdansk', countryName: 'Poland' },

  // Болгарія
  { name: 'Sofia', countryName: 'Bulgaria' },
  { name: 'Varna', countryName: 'Bulgaria' },
  { name: 'Burgas', countryName: 'Bulgaria' },

  // Додайте більше міст та країн, які ви заповнили у countries.ts
];
