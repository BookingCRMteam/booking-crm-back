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
  { name: 'Zaporizhzhia', countryName: 'Ukraine' },
  { name: 'Rivne', countryName: 'Ukraine' },
  { name: 'Chernivtsi', countryName: 'Ukraine' },
  { name: 'Poltava', countryName: 'Ukraine' },
  { name: 'Vinnytsia', countryName: 'Ukraine' },

  // Туреччина
  { name: 'Istanbul', countryName: 'Turkey' },
  { name: 'Antalya', countryName: 'Turkey' },
  { name: 'Ankara', countryName: 'Turkey' },
  { name: 'Izmir', countryName: 'Turkey' },
  { name: 'Bodrum', countryName: 'Turkey' },
  { name: 'Cappadocia', countryName: 'Turkey' }, // Умовно, регіон
  { name: 'Fethiye', countryName: 'Turkey' },
  { name: 'Marmaris', countryName: 'Turkey' },

  // Єгипет
  { name: 'Cairo', countryName: 'Egypt' },
  { name: 'Sharm El Sheikh', countryName: 'Egypt' },
  { name: 'Hurghada', countryName: 'Egypt' },
  { name: 'Luxor', countryName: 'Egypt' },
  { name: 'Alexandria', countryName: 'Egypt' },
  { name: 'Aswan', countryName: 'Egypt' },

  // Греція
  { name: 'Athens', countryName: 'Greece' },
  { name: 'Thessaloniki', countryName: 'Greece' },
  { name: 'Heraklion', countryName: 'Greece' }, // Крит
  { name: 'Rhodes', countryName: 'Greece' },
  { name: 'Santorini', countryName: 'Greece' }, // Острів
  { name: 'Corfu', countryName: 'Greece' },

  // Італія
  { name: 'Rome', countryName: 'Italy' },
  { name: 'Milan', countryName: 'Italy' },
  { name: 'Florence', countryName: 'Italy' },
  { name: 'Venice', countryName: 'Italy' },
  { name: 'Naples', countryName: 'Italy' },
  { name: 'Bologna', countryName: 'Italy' },
  { name: 'Palermo', countryName: 'Italy' },

  // Іспанія
  { name: 'Madrid', countryName: 'Spain' },
  { name: 'Barcelona', countryName: 'Spain' },
  { name: 'Seville', countryName: 'Spain' },
  { name: 'Valencia', countryName: 'Spain' },
  { name: 'Palma de Mallorca', countryName: 'Spain' },
  { name: 'Granada', countryName: 'Spain' },
  { name: 'Malaga', countryName: 'Spain' },

  // Франція
  { name: 'Paris', countryName: 'France' },
  { name: 'Nice', countryName: 'France' },
  { name: 'Marseille', countryName: 'France' },
  { name: 'Lyon', countryName: 'France' },
  { name: 'Bordeaux', countryName: 'France' },

  // Німеччина
  { name: 'Berlin', countryName: 'Germany' },
  { name: 'Munich', countryName: 'Germany' },
  { name: 'Frankfurt', countryName: 'Germany' },
  { name: 'Hamburg', countryName: 'Germany' },
  { name: 'Cologne', countryName: 'Germany' },

  // Польща
  { name: 'Warsaw', countryName: 'Poland' },
  { name: 'Krakow', countryName: 'Poland' },
  { name: 'Gdansk', countryName: 'Poland' },
  { name: 'Wroclaw', countryName: 'Poland' },
  { name: 'Poznan', countryName: 'Poland' },

  // Болгарія
  { name: 'Sofia', countryName: 'Bulgaria' },
  { name: 'Varna', countryName: 'Bulgaria' },
  { name: 'Burgas', countryName: 'Bulgaria' },
  { name: 'Plovdiv', countryName: 'Bulgaria' },

  // Хорватія
  { name: 'Zagreb', countryName: 'Croatia' },
  { name: 'Dubrovnik', countryName: 'Croatia' },
  { name: 'Split', countryName: 'Croatia' },
  { name: 'Rovinj', countryName: 'Croatia' },

  // Чорногорія
  { name: 'Podgorica', countryName: 'Montenegro' },
  { name: 'Kotor', countryName: 'Montenegro' },
  { name: 'Budva', countryName: 'Montenegro' },

  // Кіпр
  { name: 'Nicosia', countryName: 'Cyprus' },
  { name: 'Limassol', countryName: 'Cyprus' },
  { name: 'Paphos', countryName: 'Cyprus' },
  { name: 'Ayia Napa', countryName: 'Cyprus' },

  // Мальта
  { name: 'Valletta', countryName: 'Malta' },
  { name: 'Sliema', countryName: 'Malta' },

  // Португалія
  { name: 'Lisbon', countryName: 'Portugal' },
  { name: 'Porto', countryName: 'Portugal' },
  { name: 'Faro', countryName: 'Portugal' }, // Алгарве
  { name: 'Funchal', countryName: 'Portugal' }, // Мадейра

  // Об'єднані Арабські Емірати
  { name: 'Dubai', countryName: 'United Arab Emirates' },
  { name: 'Abu Dhabi', countryName: 'United Arab Emirates' },
  { name: 'Sharjah', countryName: 'United Arab Emirates' },

  // Таїланд
  { name: 'Bangkok', countryName: 'Thailand' },
  { name: 'Phuket', countryName: 'Thailand' },
  { name: 'Chiang Mai', countryName: 'Thailand' },
  { name: 'Pattaya', countryName: 'Thailand' },
  { name: 'Krabi', countryName: 'Thailand' },

  // В'єтнам
  { name: 'Hanoi', countryName: 'Vietnam' },
  { name: 'Ho Chi Minh City', countryName: 'Vietnam' },
  { name: 'Da Nang', countryName: 'Vietnam' },
  { name: 'Hoi An', countryName: 'Vietnam' },

  // Домініканська Республіка
  { name: 'Santo Domingo', countryName: 'Dominican Republic' },
  { name: 'Punta Cana', countryName: 'Dominican Republic' },
  { name: 'Puerto Plata', countryName: 'Dominican Republic' },

  // Мексика
  { name: 'Mexico City', countryName: 'Mexico' },
  { name: 'Cancun', countryName: 'Mexico' },
  { name: 'Playa del Carmen', countryName: 'Mexico' },
  { name: 'Guadalajara', countryName: 'Mexico' },

  // Куба
  { name: 'Havana', countryName: 'Cuba' },
  { name: 'Varadero', countryName: 'Cuba' },
  { name: 'Santiago de Cuba', countryName: 'Cuba' },

  // Шрі-Ланка
  { name: 'Colombo', countryName: 'Sri Lanka' },
  { name: 'Kandy', countryName: 'Sri Lanka' },
  { name: 'Galle', countryName: 'Sri Lanka' },

  // Індія
  { name: 'Delhi', countryName: 'India' },
  { name: 'Mumbai', countryName: 'India' },
  { name: 'Goa', countryName: 'India' },
  { name: 'Jaipur', countryName: 'India' },

  // Китай
  { name: 'Beijing', countryName: 'China' },
  { name: 'Shanghai', countryName: 'China' },
  { name: 'Guangzhou', countryName: 'China' },
  { name: 'Chengdu', countryName: 'China' },

  // Японія
  { name: 'Tokyo', countryName: 'Japan' },
  { name: 'Kyoto', countryName: 'Japan' },
  { name: 'Osaka', countryName: 'Japan' },
  { name: 'Hiroshima', countryName: 'Japan' },

  // Південна Корея
  { name: 'Seoul', countryName: 'South Korea' },
  { name: 'Busan', countryName: 'South Korea' },
  { name: 'Jeju Island', countryName: 'South Korea' },

  // Австралія
  { name: 'Sydney', countryName: 'Australia' },
  { name: 'Melbourne', countryName: 'Australia' },
  { name: 'Brisbane', countryName: 'Australia' },
  { name: 'Perth', countryName: 'Australia' },

  // Нова Зеландія
  { name: 'Auckland', countryName: 'New Zealand' },
  { name: 'Wellington', countryName: 'New Zealand' },
  { name: 'Christchurch', countryName: 'New Zealand' },

  // США
  { name: 'New York', countryName: 'USA' },
  { name: 'Los Angeles', countryName: 'USA' },
  { name: 'Miami', countryName: 'USA' },
  { name: 'San Francisco', countryName: 'USA' },
  { name: 'Chicago', countryName: 'USA' },

  // Канада
  { name: 'Toronto', countryName: 'Canada' },
  { name: 'Vancouver', countryName: 'Canada' },
  { name: 'Montreal', countryName: 'Canada' },
  { name: 'Calgary', countryName: 'Canada' },

  // Об'єднане Королівство
  { name: 'London', countryName: 'United Kingdom' },
  { name: 'Edinburgh', countryName: 'United Kingdom' },
  { name: 'Manchester', countryName: 'United Kingdom' },
  { name: 'Liverpool', countryName: 'United Kingdom' },

  // Ірландія
  { name: 'Dublin', countryName: 'Ireland' },
  { name: 'Cork', countryName: 'Ireland' },

  // Нідерланди
  { name: 'Amsterdam', countryName: 'Netherlands' },
  { name: 'Rotterdam', countryName: 'Netherlands' },
  { name: 'Utrecht', countryName: 'Netherlands' },

  // Бельгія
  { name: 'Brussels', countryName: 'Belgium' },
  { name: 'Antwerp', countryName: 'Belgium' },
  { name: 'Bruges', countryName: 'Belgium' },

  // Швейцарія
  { name: 'Zurich', countryName: 'Switzerland' },
  { name: 'Geneva', countryName: 'Switzerland' },
  { name: 'Bern', countryName: 'Switzerland' },
  { name: 'Lucerne', countryName: 'Switzerland' },

  // Австрія
  { name: 'Vienna', countryName: 'Austria' },
  { name: 'Salzburg', countryName: 'Austria' },
  { name: 'Innsbruck', countryName: 'Austria' },

  // Чеська Республіка
  { name: 'Prague', countryName: 'Czech Republic' },
  { name: 'Brno', countryName: 'Czech Republic' },

  // Угорщина
  { name: 'Budapest', countryName: 'Hungary' },

  // Словаччина
  { name: 'Bratislava', countryName: 'Slovakia' },

  // Словенія
  { name: 'Ljubljana', countryName: 'Slovenia' },
  { name: 'Bled', countryName: 'Slovenia' },

  // Данія
  { name: 'Copenhagen', countryName: 'Denmark' },

  // Швеція
  { name: 'Stockholm', countryName: 'Sweden' },
  { name: 'Gothenburg', countryName: 'Sweden' },

  // Норвегія
  { name: 'Oslo', countryName: 'Norway' },
  { name: 'Bergen', countryName: 'Norway' },

  // Фінляндія
  { name: 'Helsinki', countryName: 'Finland' },
  { name: 'Rovaniemi', countryName: 'Finland' }, // Лапландія

  // Ісландія
  { name: 'Reykjavik', countryName: 'Iceland' },

  // Марокко
  { name: 'Marrakech', countryName: 'Morocco' },
  { name: 'Casablanca', countryName: 'Morocco' },
  { name: 'Fes', countryName: 'Morocco' },

  // Туніс
  { name: 'Tunis', countryName: 'Tunisia' },
  { name: 'Sousse', countryName: 'Tunisia' },

  // Йорданія
  { name: 'Amman', countryName: 'Jordan' },
  { name: 'Petra', countryName: 'Jordan' }, // Місто-пам'ятка

  // Ізраїль
  { name: 'Tel Aviv', countryName: 'Israel' },
  { name: 'Jerusalem', countryName: 'Israel' },
  { name: 'Eilat', countryName: 'Israel' },

  // Грузія
  { name: 'Tbilisi', countryName: 'Georgia' },
  { name: 'Batumi', countryName: 'Georgia' },

  // Вірменія
  { name: 'Yerevan', countryName: 'Armenia' },

  // Азербайджан
  { name: 'Baku', countryName: 'Azerbaijan' },

  // Казахстан
  { name: 'Nur-Sultan', countryName: 'Kazakhstan' }, // Астана
  { name: 'Almaty', countryName: 'Kazakhstan' },

  // Узбекистан
  { name: 'Tashkent', countryName: 'Uzbekistan' },
  { name: 'Samarkand', countryName: 'Uzbekistan' },
  { name: 'Bukhara', countryName: 'Uzbekistan' },
];
