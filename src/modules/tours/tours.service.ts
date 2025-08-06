import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTourDto } from './dto/create-tour.dto';
import { Tour } from './tours.types';
import { tourPhotos, tours } from './tours.schema';
import { GetToursQueryDto, SortOrder } from './dto/get-tours-query.dto';
import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { UpdateTourDto } from './dto/update-tour.dto';
import * as schema from 'src/db/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
@Injectable()
export class ToursService {
  constructor(
    // Правильний спосіб ін'єкції Drizzle DB в NestJS
    @Inject('DRIZZLE_CLIENT')
    private db: NodePgDatabase<typeof schema>, // <-- Типізуйте db згідно з вашою основною схемою
  ) {}
  async createTour(createTourDto: CreateTourDto): Promise<Tour> {
    return await this.db.transaction(async (tx): Promise<Tour> => {
      try {
        // const tourData = {
        //   operatorId: 1,
        //   title: createTourDto.title,
        //   description: createTourDto.description,
        //   countryId: createTourDto.countryId,
        //   cityId: createTourDto.cityId,
        //   type: createTourDto.type,
        //   price: createTourDto.price.toFixed(2),
        //   currency: createTourDto.currency,
        //   startDate: createTourDto.startDate,
        //   endDate: createTourDto.endDate,
        //   availableSpots: createTourDto.availableSpots,
        //   conditions: createTourDto.conditions,
        //   isActive: createTourDto.isActive,
        // };

        const [country] = await tx
          .select()
          .from(schema.countries)
          .where(eq(schema.countries.id, createTourDto.countryId))
          .limit(1);

        if (!country) {
          throw new BadRequestException(
            `Country with ID ${createTourDto.countryId} not found.`,
          );
        }

        if (createTourDto.departureCountryId) {
          const [departureCountry] = await tx
            .select()
            .from(schema.countries)
            .where(eq(schema.countries.id, createTourDto.departureCountryId))
            .limit(1);
          if (!departureCountry) {
            throw new BadRequestException(
              `Departure country with ID ${createTourDto.departureCountryId} not found.`,
            );
          }
        }
        if (createTourDto.departureCityId) {
          const [departureCity] = await tx
            .select()
            .from(schema.cities)
            .where(eq(schema.cities.id, createTourDto.departureCityId))
            .limit(1);
          if (!departureCity) {
            throw new BadRequestException(
              `Departure city with ID ${createTourDto.departureCityId} not found.`,
            );
          }
        }
        const tourData = {
          operatorId: 1,
          ...createTourDto,
          price: createTourDto.price.toFixed(2),
        };
        const result = await tx.insert(tours).values(tourData).returning();
        const newTour = result[0];

        if (createTourDto.photos && createTourDto.photos.length > 0) {
          const tourPhotosToInsert = createTourDto.photos.map((photo) => ({
            tourId: newTour.id,
            url: photo.url,
          }));

          await tx.insert(tourPhotos).values(tourPhotosToInsert);
        }

        return newTour;
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
      countryId,
      cityId,
      type,
      minStartDate, // Нове поле
      maxStartDate, // Нове поле
      minEndDate, // Нове поле
      maxEndDate, // Нове поле
      minPrice,
      maxPrice,
      adults, // Нове поле
      children, // Нове поле
      petsAllowed, // Нове поле
      departureCityId, // Нове поле
      departureCountryId, // Нове поле
      limit = 10,
      offset = 0,
      sortBy = 'startDate',
      sortOrder = SortOrder.ASC,
    } = query;

    const whereConditions = [eq(schema.tours.isActive, true)]; // Починаємо з обов'язкових умов

    if (countryId) {
      whereConditions.push(eq(schema.tours.countryId, countryId));
    }
    if (cityId) {
      whereConditions.push(eq(schema.tours.cityId, cityId));
    }
    if (departureCountryId) {
      // Додано фільтр
      whereConditions.push(
        eq(schema.tours.departureCountryId, departureCountryId),
      );
    }
    if (departureCityId) {
      // Додано фільтр
      whereConditions.push(eq(schema.tours.departureCityId, departureCityId));
    }
    if (type) {
      whereConditions.push(eq(schema.tours.type, type));
    }

    // Фільтрація за діапазоном startDate
    if (minStartDate) {
      whereConditions.push(gte(schema.tours.startDate, minStartDate));
    }
    if (maxStartDate) {
      whereConditions.push(lte(schema.tours.startDate, maxStartDate));
    }

    // Фільтрація за діапазоном endDate
    if (minEndDate) {
      whereConditions.push(gte(schema.tours.endDate, minEndDate));
    }
    if (maxEndDate) {
      whereConditions.push(lte(schema.tours.endDate, maxEndDate));
    }

    // Для price, оскільки це DECIMAL, використовуємо sql`...` для порівняння
    // Або просто number, якщо ваш DTO та схема Drizzle правильно обробляють це
    if (minPrice !== undefined) {
      whereConditions.push(gte(schema.tours.price, sql`${minPrice}`));
    }
    if (maxPrice !== undefined) {
      whereConditions.push(lte(schema.tours.price, sql`${maxPrice}`));
    }

    // Додано фільтри для adults, children, petsAllowed
    if (adults !== undefined) {
      whereConditions.push(gte(schema.tours.adults, adults)); // Або eq, якщо точна кількість
    }
    if (children !== undefined) {
      whereConditions.push(gte(schema.tours.children, children)); // Або eq
    }
    if (petsAllowed !== undefined) {
      whereConditions.push(eq(schema.tours.petsAllowed, petsAllowed));
    }

    // Типізуємо orderByColumn коректно, використовуючи columns з schema.tours
    let orderByColumn:
      | typeof schema.tours.price
      | typeof schema.tours.startDate;
    switch (sortBy) {
      case 'price':
        orderByColumn = schema.tours.price;
        break;
      case 'startDate':
      default:
        orderByColumn = schema.tours.startDate;
        break;
    }

    // Визначаємо функцію сортування (asc або desc)
    const orderFunction = sortOrder === SortOrder.DESC ? desc : asc;

    try {
      // Виконання запиту до бази даних
      const allTours = await this.db.query.tours.findMany({
        // Використовуйте this.db
        where: and(...whereConditions),
        orderBy: orderFunction(orderByColumn),
        limit: limit,
        offset: offset,
        with: {
          photos: true, // Якщо у вас є relations для photos
          country: true, // Дозволить отримати об'єкт країни
          city: true, // Дозволить отримати об'єкт міста
          departureCountry: true,
          departureCity: true,
          // operator: true,
        },
      });

      const totalCountResult = await this.db // Використовуйте this.db
        .select({ count: sql<number>`count(*)` }) // Явно вказуємо, що count - це число
        .from(schema.tours) // Використовуйте schema.tours
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
      throw new Error('Could not retrieve tours. Please try again later.');
    }
  }

  findAll() {
    return `This action returns all tours`;
  }

  async findOne(id: number) {
    const tour = await this.db.query.tours.findFirst({
      where: eq(tours.id, id),
      with: {
        //@TODO:
        // Завантажуємо зв'язані дані (фотографії, відгуки, оператора)
        photos: true,
        // reviews: true,
        // operator: {
        //   columns: {
        //     companyName: true, // Повертаємо тільки назву компанії оператора
        //     contactPerson: true,
        //     website: true,
        //   },
        // },
      },
    });

    if (!tour || !tour.isActive) {
      throw new NotFoundException(
        `Tour with ID ${id} not found or is inactive.`,
      );
    }

    return tour;
  }

  async update(id: number, updateTourDto: UpdateTourDto, operatorId: number) {
    return await this.db.transaction(async (tx) => {
      const existingTour = await tx.query.tours.findFirst({
        where: and(eq(tours.id, id), eq(tours.operatorId, operatorId)),
      });

      if (!existingTour) {
        throw new NotFoundException(
          `Tour with ID ${id} not found or you don't have permission to update it.`,
        );
      }
      const [updatedTour] = await tx
        .update(tours)
        .set({
          ...updateTourDto,
          price: updateTourDto.price && updateTourDto.price.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(tours.id, id))
        .returning();

      if (!updatedTour) {
        throw new BadRequestException('Failed to update tour data.');
      }

      if (updateTourDto.photos !== undefined) {
        await tx.delete(tourPhotos).where(eq(tourPhotos.tourId, id));

        if (updateTourDto.photos.length > 0) {
          const newPhotosToInsert = updateTourDto.photos.map((photo) => ({
            tourId: id,
            url: photo.url,
          }));
          await tx.insert(tourPhotos).values(newPhotosToInsert);
        }
      }

      const tourWithPhotos = await tx.query.tours.findFirst({
        where: eq(tours.id, updatedTour.id),
        with: { photos: true },
      });

      return {
        ...tourWithPhotos,
        price: parseFloat(tourWithPhotos.price),
        createdAt: tourWithPhotos.createdAt.toISOString(),
        updatedAt: tourWithPhotos.updatedAt.toISOString(),
      };
    });
  }

  async remove(id: number, operatorId: number) {
    // 1. Перевіряємо, чи тур існує і чи належить він цьому оператору
    const existingTour = await this.db.query.tours.findFirst({
      where: and(eq(tours.id, id), eq(tours.operatorId, operatorId)),
    });

    if (!existingTour) {
      throw new NotFoundException(
        `Tour with ID ${id} not found or you don't have permission to delete it.`,
      );
    }

    const [deletedTour] = await this.db
      .update(tours)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(tours.id, id))
      .returning();

    if (!deletedTour) {
      throw new BadRequestException('Failed to deactivate tour.');
    }

    return { message: `Tour with ID ${id} has been deactivated.` };
  }
}
