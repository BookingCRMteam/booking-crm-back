// scripts/seed-countries.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as schema from '../src/db/schema'; // Шлях до вашої головної схеми Drizzle
import { COUNTRIES_DATA } from '../data/countries'; // <--- Імпортуємо дані країн

dotenv.config({ path: '.env.development' }); // Завантажуємо змінні середовища з .env.development

async function seedCountries() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set in environment variables.');
    process.exit(1);
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool, { schema });
  // Використовуємо дані, імпортовані з файлу
  const countriesToInsert = COUNTRIES_DATA;

  try {
    console.log('Starting country seeding...');

    // Опціонально: Очистити таблицю перед вставкою (тільки для розробки!)
    // Зауваження: Якщо на таблицю 'countries' посилаються інші таблиці через FOREIGN KEY,
    // видалення може призвести до помилки, якщо ви не видалите залежні записи або не використовуєте CASCADE.
    // У продакшн-середовищі, як правило, не очищують таблицю, а просто додають нові або оновлюють існуючі.
    // await db.delete(schema.countries);
    // console.log('Cleared existing countries (use with caution in production!).');

    // Вставляємо країни. Використовуємо .onConflictDoNothing()
    // щоб уникнути помилок, якщо країна вже існує (наприклад, через unique() constraint на name)
    const insertedCountries = await db
      .insert(schema.countries)
      .values(countriesToInsert)
      .onConflictDoNothing({
        target: schema.countries.name, // Якщо конфлікт за полем 'name'
      })
      .returning(); // Повернути вставлені записи (якщо не було конфлікту)

    if (insertedCountries.length > 0) {
      console.log(
        `Successfully inserted ${insertedCountries.length} new countries.`,
      );
      console.log('Inserted countries:', insertedCountries);
    } else {
      console.log(
        'No new countries were inserted (they might already exist in the database).',
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error during country seeding:', error);
    } else {
      console.error('Unknown error during country seeding:', error);
    }
  } finally {
    if (pool) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await pool.end(); // Закриваємо з'єднання з базою даних
      console.log('Database connection closed.');
    }
    process.exit(0);
  }
}

seedCountries();
