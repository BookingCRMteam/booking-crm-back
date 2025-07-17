import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTourDto } from './dto/create-tour.dto';
import { db } from '@app/db';
import { Tour } from './tours.types';
import { tourPhotos, tours } from './tours.schema';
import { GetToursQueryDto, SortOrder } from './dto/get-tours-query.dto';
import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm';
@Injectable()
export class ToursService {
  constructor() {}
  async createTour(createTourDto: CreateTourDto): Promise<Tour> {
    return await db.transaction(async (tx): Promise<Tour> => {
      try {
        const tourData = {
          operatorId: 1,
          title: createTourDto.title,
          description: createTourDto.description,
          country: createTourDto.country,
          city: createTourDto.city,
          type: createTourDto.type,
          price: createTourDto.price.toFixed(2),
          currency: createTourDto.currency,
          startDate: createTourDto.startDate,
          endDate: createTourDto.endDate,
          availableSpots: createTourDto.availableSpots,
          conditions: createTourDto.conditions,
          isActive: createTourDto.isActive,
        };
        const result = await tx.insert(tours).values(tourData).returning();
        const newTour = result[0];

        if (createTourDto.photos && createTourDto.photos.length > 0) {
          const tourPhotosToInsert = createTourDto.photos.map((photo) => ({
            tourId: newTour.id,
            url: photo.url,
            description: photo.description,
            isMain: photo.isMain,
          }));

          await tx.insert(tourPhotos).values(tourPhotosToInsert);
        }

        return {
          ...newTour,
          price: parseFloat(newTour.price),
          createdAt: newTour.createdAt.toISOString(),
          updatedAt: newTour.updatedAt.toISOString(),
        };
      } catch (error) {
        console.error('Error creating tour:', error);
        throw new BadRequestException(
          'Could not create tour. Please check the provided data.',
        );
      }
    });
  }
  async findAllTours(query: GetToursQueryDto) {
    const {
      country,
      city,
      type,
      startDate,
      endDate,
      minPrice,
      maxPrice,
      limit = 10, // Значення за замовчуванням
      offset = 0, // Значення за замовчуванням
      sortBy = 'startDate', // Значення за замовчуванням
      sortOrder = SortOrder.ASC, // Значення за замовчуванням
    } = query;

    const whereConditions = [];

    // Додаємо умови фільтрації, якщо вони присутні в запиті
    if (country) {
      whereConditions.push(eq(tours.country, country));
    }
    if (city) {
      whereConditions.push(eq(tours.city, city));
    }
    if (type) {
      whereConditions.push(eq(tours.type, type));
    }
    if (startDate && endDate) {
      // Фільтруємо тури, які перетинаються з заданим діапазоном дат
      // (початок туру до endDate запиту І кінець туру після startDate запиту)
      whereConditions.push(
        and(
          lte(tours.startDate, endDate), // Тур починається до або в день закінчення запиту
          gte(tours.endDate, startDate), // Тур закінчується після або в день початку запиту
        ),
      );
    } else if (startDate) {
      whereConditions.push(gte(tours.startDate, startDate));
    } else if (endDate) {
      whereConditions.push(lte(tours.endDate, endDate));
    }
    if (minPrice !== undefined) {
      whereConditions.push(gte(tours.price, sql`${minPrice}`));
    }
    if (maxPrice !== undefined) {
      whereConditions.push(lte(tours.price, sql`${maxPrice}`));
    }
    // Забезпечуємо, що ми повертаємо тільки активні тури
    whereConditions.push(eq(tours.isActive, true));

    // Визначаємо поле для сортування та функцію сортування (asc/desc)
    let orderByColumn: typeof tours.price | typeof tours.startDate; // Типізуємо orderByColumn
    switch (sortBy) {
      case 'price':
        orderByColumn = tours.price;
        break;
      case 'startDate':
      default:
        orderByColumn = tours.startDate;
        break;
    }

    // Визначаємо функцію сортування (asc або desc)
    const orderFunction = sortOrder === SortOrder.DESC ? desc : asc;

    try {
      // Виконання запиту до бази даних
      const allTours = await db.query.tours.findMany({
        where: and(...whereConditions), // Застосовуємо всі умови фільтрації
        orderBy: orderFunction(orderByColumn), // Правильне використання Drizzle orderBy
        limit: limit,
        offset: offset,
      });

      // Отримання загальної кількості турів з тими ж умовами фільтрації

      const totalCountResult = await db
        .select({ count: sql`count(*)` })
        .from(tours)
        .where(and(...whereConditions));
      const totalCount = totalCountResult[0].count;

      return {
        tours: allTours,
        total: totalCount,
        limit,
        offset,
      };
    } catch (error) {
      console.error('Error fetching tours:', error);
      throw new Error('Could not retrieve tours. Please try again later.'); // Обробка помилок
    }
  }

  findAll() {
    return `This action returns all tours`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tour`;
  }

  // update(id: number, updateTourDto: UpdateTourDto) {
  //   return `This action updates a #${id} tour` + updateTourDto;
  // }

  remove(id: number) {
    return `This action removes a #${id} tour`;
  }
}
