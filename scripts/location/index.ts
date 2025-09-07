import { seedCountries } from './seed-countries';
import { seedCities } from './seed-cities';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await seedCountries();
    await seedCities();
    console.log('🌱 Seeding finished');
  } catch (err) {
    console.error('❌ Seeding failed', err);
  } finally {
    await pool.end(); // закриваємо підключення
  }
}

void main();
