import axios from 'axios';
import FormData from 'form-data';
import { faker } from '@faker-js/faker';
import * as fs from 'fs';
import * as path from 'path';
interface TourResponse {
  title: string;
  id: number;
}

// --- Конфігурація ---
const API_BASE_URL = 'https://booking-crm.onrender.com/api/v1';
const TOURS_ENDPOINT = '/tours';
const NUMBER_OF_TOURS_TO_CREATE = 5;
// const OPERATOR_ID = 1;

const IMAGES_DIR = path.resolve(__dirname, '../temp_images');

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

const IMAGE_PATHS = getActualImagePaths(IMAGES_DIR);

function getRandomDateInFuture(daysOffset: number): string {
  const date = faker.date.future({ years: 1 });
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

async function createTour() {
  const title = faker.lorem.words({ min: 3, max: 8 });
  const description = faker.lorem.paragraphs({ min: 1, max: 3 });
  const country = faker.location.country();
  const city = faker.location.city();
  const type = faker.helpers.arrayElement([
    'Adventure',
    'Sightseeing',
    'Beach',
    'Cultural',
    'Relax',
  ]);
  const price = faker.commerce.price({ min: 100, max: 5000, dec: 2 });
  const currency = faker.helpers.arrayElement(['UAH', 'USD', 'EUR']);
  const startDate = getRandomDateInFuture(0);
  const endDate = getRandomDateInFuture(faker.number.int({ min: 3, max: 14 }));
  const availableSpots = faker.number.int({ min: 5, max: 50 });
  const conditions = faker.lorem.sentences({ min: 1, max: 3 });
  const isActive = faker.datatype.boolean();

  let formData: FormData;

  try {
    formData = new FormData();
  } catch (error) {
    console.error('Error creating FormData:', error);
    throw error;
  }
  formData.append('title', title);
  formData.append('description', description);
  formData.append('country', country);
  formData.append('city', city);
  formData.append('type', type);
  formData.append('price', price);
  formData.append('currency', currency);
  formData.append('startDate', startDate);
  formData.append('endDate', endDate);
  formData.append('availableSpots', availableSpots.toString());
  formData.append('conditions', conditions);
  formData.append('isActive', isActive.toString());
  // formData.append('operatorId', OPERATOR_ID.toString());

  let photosToUpload: string[] = [];

  if (IMAGE_PATHS.length === 0) {
    console.warn(
      'No images found in the specified directory. Tour will be created without photos.',
    );
  } else {
    const minPhotos = 1;
    const maxPhotos = 10;
    const numberOfPhotos = faker.number.int({
      min: minPhotos,
      max: Math.min(maxPhotos, IMAGE_PATHS.length), // Не більше 10 і не більше, ніж реально доступно
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
    const response = await axios.post(
      `${API_BASE_URL}${TOURS_ENDPOINT}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          // 'Authorization': 'Bearer YOUR_JWT_TOKEN'
        },
      },
    );

    console.log(
      `Successfully created tour: ${(response.data as TourResponse).title || 'No title in response'} (ID: ${(response.data as TourResponse).id || 'N/A'})`,
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error creating tour: ${error.message}`);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    } else {
      console.error('Unknown error:', error);
    }
  }
}

async function seedDatabase() {
  console.log(`Starting to seed ${NUMBER_OF_TOURS_TO_CREATE} tours...`);
  if (IMAGE_PATHS.length === 0) {
    console.warn('No images found. Tours will be created without photos.');
  }

  for (let i = 0; i < NUMBER_OF_TOURS_TO_CREATE; i++) {
    console.log(`Creating tour ${i + 1}/${NUMBER_OF_TOURS_TO_CREATE}...`);
    await createTour();
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  console.log('Seeding process finished.');
}

void seedDatabase();
