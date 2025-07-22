import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTourDto } from './dto/create-tour.dto';
import { db } from '@app/db';
import { Tour } from './tours.types';
import { tourPhotos, tours } from './tours.schema';
import { GetToursQueryDto, SortOrder } from './dto/get-tours-query.dto';
import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { UpdateTourDto } from './dto/update-tour.dto';
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
      limit = 10,
      offset = 0,
      sortBy = 'startDate',
      sortOrder = SortOrder.ASC,
    } = query;

    const whereConditions = [];

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
      whereConditions.push(
        and(lte(tours.startDate, endDate), gte(tours.endDate, startDate)),
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
    whereConditions.push(eq(tours.isActive, true));

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
        where: and(...whereConditions),
        orderBy: orderFunction(orderByColumn),
        limit: limit,
        offset: offset,
        with: {
          photos: true,
        },
      });

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

  async findOne(id: number) {
    const tour = await db.query.tours.findFirst({
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
    return await db.transaction(async (tx) => {
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
            description: photo.description,
            isMain: photo.isMain,
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
    const existingTour = await db.query.tours.findFirst({
      where: and(eq(tours.id, id), eq(tours.operatorId, operatorId)),
    });

    if (!existingTour) {
      throw new NotFoundException(
        `Tour with ID ${id} not found or you don't have permission to delete it.`,
      );
    }

    const [deletedTour] = await db
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
