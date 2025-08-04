// scripts/seed-tours-api.ts
import axios from 'axios';
import FormData from 'form-data';
import { faker } from '@faker-js/faker';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' }); // Завантажуємо змінні середовища

// --- Інтерфейси для даних з API ---
interface Country {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
  countryId: number;
}

// interface Operator {
//   id: number;
//   name: string;
//   // Додайте інші поля оператора, якщо вони потрібні
// }

interface TourResponse {
  id: number;
  title: string;
  // Додайте інші поля, що повертаються після створення туру, якщо потрібно
}

// --- Конфігурація ---
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1'; // Використовуйте змінну оточення
const TOURS_ENDPOINT = '/tours';
const CITIES_ENDPOINT = '/cities';
const COUNTRIES_ENDPOINT = '/countries';
// const OPERATORS_ENDPOINT = '/operators'; // Якщо у вас є endpoint для операторів

const NUMBER_OF_TOURS_TO_CREATE = 10; // Кількість турів для створення

// Шлях до папки з зображеннями (звідносно кореня проєкту)
const IMAGES_DIR = path.resolve(__dirname, '../temp_images');

// --- Допоміжні функції ---

// Функція для отримання всіх шляхів до зображень
function getActualImagePaths(directory: string): string[] {
  try {
    const files = fs.readdirSync(directory);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    const imagePaths = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      })
      .map((file) => path.join(directory, file));

    if (imagePaths.length === 0) {
      console.warn(
        `Warning: No image files found in ${directory}. Please ensure there are .jpg, .jpeg, .png, or .gif files in this directory.`,
      );
    }
    return imagePaths;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error reading directory ${directory}:`, error.message);
    } else {
      console.error(`Error reading directory ${directory}:`, error);
    }
    return [];
  }
}

const IMAGE_PATHS: string[] = getActualImagePaths(IMAGES_DIR);

// Функція для отримання країн з API
async function fetchCountries(): Promise<Country[]> {
  try {
    const response = await axios.get<Country[]>(
      `${API_BASE_URL}${COUNTRIES_ENDPOINT}`,
    );
    console.log(`Fetched ${response.data.length} countries.`);
    return response.data;
  } catch (error) {
    console.error(
      'Error fetching countries:',
      axios.isAxiosError(error) ? error.message : error,
    );
    return [];
  }
}

// Функція для отримання міст з API
async function fetchCities(): Promise<City[]> {
  try {
    const response = await axios.get<City[]>(
      `${API_BASE_URL}${CITIES_ENDPOINT}`,
    );
    console.log(`Fetched ${response.data.length} cities.`);
    return response.data;
  } catch (error) {
    console.error(
      'Error fetching cities:',
      axios.isAxiosError(error) ? error.message : error,
    );
    return [];
  }
}

// Функція для отримання операторів з API
// async function fetchOperators(): Promise<Operator[]> {
//   try {
//     const response = await axios.get<Operator[]>(
//       `${API_BASE_URL}${OPERATORS_ENDPOINT}`,
//     );
//     console.log(`Fetched ${response.data.length} operators.`);
//     return response.data;
//   } catch (error) {
//     console.error(
//       'Error fetching operators:',
//       axios.isAxiosError(error) ? error.message : error,
//     );
//     return [];
//   }
// }

// Функція для генерації дати в майбутньому
function getRandomDateInFuture(
  minDaysOffset: number,
  maxDaysOffset: number,
): string {
  const date = faker.date.future({ years: 1 });
  date.setDate(
    date.getDate() +
      faker.number.int({ min: minDaysOffset, max: maxDaysOffset }),
  );
  return date.toISOString().split('T')[0];
}

// --- Основна логіка створення туру ---
async function createTour(
  allCountries: Country[],
  allCities: City[],
  // allOperators: Operator[],
): Promise<void> {
  // Вибираємо випадкову країну призначення
  const destinationCountry = faker.helpers.arrayElement(allCountries);
  if (!destinationCountry) {
    console.error('No destination countries available to create a tour.');
    return;
  }

  // Фільтруємо міста, що належать до вибраної країни
  const citiesInDestinationCountry = allCities.filter(
    (city) => city.countryId === destinationCountry.id,
  );

  let destinationCity: City | undefined;
  if (citiesInDestinationCountry.length > 0) {
    destinationCity = faker.helpers.arrayElement(citiesInDestinationCountry);
  } else {
    console.warn(
      `Warning: No cities found for destination country "${destinationCountry.name}". Skipping city for this tour.`,
    );
  }

  // Вибираємо випадкову країну відправлення (може бути та сама, що й призначення)
  const departureCountry = faker.helpers.arrayElement(allCountries);
  if (!departureCountry) {
    console.error('No departure countries available.');
    return;
  }

  // Фільтруємо міста, що належать до вибраної країни відправлення
  const citiesInDepartureCountry = allCities.filter(
    (city) => city.countryId === departureCountry.id,
  );

  let departureCity: City | undefined;
  if (citiesInDepartureCountry.length > 0) {
    departureCity = faker.helpers.arrayElement(citiesInDepartureCountry);
  } else {
    console.warn(
      `Warning: No cities found for departure country "${departureCountry.name}". Skipping departure city for this tour.`,
    );
  }

  // Вибираємо випадкового оператора
  // const operator = faker.helpers.arrayElement(allOperators);
  // if (!operator) {
  //   console.error(
  //     'No operators available to create a tour. Please create at least one operator.',
  //   );
  //   return;
  // }

  const title = faker.lorem.words({ min: 3, max: 8 });
  const description = faker.lorem.paragraphs({ min: 1, max: 3 });
  const type = faker.helpers.arrayElement([
    'Adventure',
    'Sightseeing',
    'Beach',
    'Cultural',
    'Relax',
    'Family',
    'Business',
  ]);
  const price = faker.commerce.price({ min: 100, max: 5000, dec: 2 });
  const currency = faker.helpers.arrayElement(['UAH', 'USD', 'EUR']);
  const startDate = getRandomDateInFuture(0, 30);
  const endDate = getRandomDateInFuture(3, 14); // endDate має бути після startDate
  const availableSpots = faker.number.int({ min: 5, max: 50 });
  const conditions = faker.lorem.sentences({ min: 1, max: 3 });
  const isActive = faker.datatype.boolean();
  const adults = faker.number.int({ min: 1, max: 4 });
  const children = faker.number.int({ min: 0, max: 3 });
  const petsAllowed = faker.datatype.boolean();

  const formData = new FormData();

  // Додаємо обов'язкові поля
  formData.append('title', title);
  formData.append('description', description);
  formData.append('type', type);
  formData.append('price', price);
  formData.append('currency', currency);
  formData.append('startDate', startDate);
  formData.append('endDate', endDate);
  formData.append('availableSpots', availableSpots.toString());
  formData.append('conditions', conditions);
  formData.append('isActive', isActive.toString());
  // formData.append('operatorId', operator.id.toString());
  formData.append('adults', adults.toString());
  formData.append('children', children.toString());
  formData.append('petsAllowed', petsAllowed.toString());

  // Додаємо ID країн та міст
  formData.append('countryId', destinationCountry.id.toString());
  if (destinationCity) {
    formData.append('cityId', destinationCity.id.toString());
  }
  formData.append('departureCountryId', departureCountry.id.toString());
  if (departureCity) {
    formData.append('departureCityId', departureCity.id.toString());
  }

  // Додаємо фотографії
  let photosToUpload: string[] = [];
  if (IMAGE_PATHS.length === 0) {
    console.warn(
      'No images found in the specified directory. Tour will be created without photos.',
    );
  } else {
    const minPhotos = 1;
    const maxPhotos = 5; // Зменшимо кількість фото для тестових цілей
    const numberOfPhotos = faker.number.int({
      min: minPhotos,
      max: Math.min(maxPhotos, IMAGE_PATHS.length),
    });
    photosToUpload = faker.helpers.arrayElements(IMAGE_PATHS, numberOfPhotos);
  }

  if (photosToUpload.length === 0) {
    console.warn('No photos selected for this tour. Creating without photos.');
  }
  photosToUpload.forEach((imagePath) => {
    try {
      const imageStream = fs.createReadStream(imagePath);
      formData.append('photos', imageStream, {
        filename: path.basename(imagePath),
        filepath: imagePath, // Це для axios, щоб правильно обробити файл
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error reading image file ${imagePath}:`, error.message);
      } else {
        console.error(`Error reading image file ${imagePath}:`, error);
      }
    }
  });

  try {
    console.log(`Sending data for tour: "${title}"`);
    const response = await axios.post<TourResponse>(
      `${API_BASE_URL}${TOURS_ENDPOINT}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          // 'Authorization': 'Bearer YOUR_JWT_TOKEN' // Додайте, якщо потрібна авторизація
        },
      },
    );

    console.log(
      `Successfully created tour: "${response.data.title}" (ID: ${response.data.id})`,
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error creating tour: ${error.message}`);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    } else {
      console.error('Unknown error:', error);
    }
  }
}

// --- Головна функція запуску ---
async function seedToursDatabase() {
  console.log('--- Starting Tour Seeding Process ---');

  // Перевірка наявності зображень
  if (IMAGE_PATHS.length === 0) {
    console.warn(
      'No images found in `temp_images` directory. Tours will be created without photos.',
    );
  }

  // Отримуємо всі необхідні дані з API перед початком створення турів
  const allCountries = await fetchCountries();
  const allCities = await fetchCities();
  // const allOperators = await fetchOperators(); // Отримуємо операторів

  if (allCountries.length === 0) {
    console.error(
      'No countries found in the API. Please seed countries first.',
    );
    return;
  }
  if (allCities.length === 0) {
    console.warn(
      'No cities found in the API. Tours might not have destination/departure cities.',
    );
    // return; // Можливо, ви хочете дозволити тури без міст, але з країнами
  }
  // if (allOperators.length === 0) {
  //   console.error(
  //     'No operators found in the API. Please create at least one operator.',
  //   );
  //   return;
  // }

  console.log(`Starting to create ${NUMBER_OF_TOURS_TO_CREATE} tours...`);

  for (let i = 0; i < NUMBER_OF_TOURS_TO_CREATE; i++) {
    console.log(
      `\n--- Creating tour ${i + 1}/${NUMBER_OF_TOURS_TO_CREATE} ---`,
    );
    await createTour(allCountries, allCities /*allOperators*/);
    // Додайте невелику затримку, щоб уникнути перевантаження API
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Затримка 1 секунда
  }
  console.log('\n--- Tour seeding process finished. ---');
}

// Запуск скрипта
void seedToursDatabase();
