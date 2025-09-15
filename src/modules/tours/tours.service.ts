import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTourDto, TourPhotoDto } from './dto/create-tour.dto';
import { Tour } from './tours.types';
import { GetToursQueryDto, SortOrder } from './dto/get-tours-query.dto';
import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { UpdateTourDto } from './dto/update-tour.dto';
import * as schema from '@app/db/schema/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
@Injectable()
export class ToursService {
  constructor(
    // Правильний спосіб ін'єкції Drizzle DB в NestJS
    @Inject('DRIZZLE_CLIENT')
    private db: NodePgDatabase<typeof schema>, // <-- Типізуйте db згідно з вашою основною схемою
  ) {}
  private async validateCityAndCountry(
    cityId: number,
    countryISO2Code: string,
    db: NodePgDatabase<typeof schema>,
  ) {
    if (!cityId && !countryISO2Code) {
      return;
    }

    if (cityId && !countryISO2Code) {
      throw new BadRequestException(
        'Country ISO2 code is required when city is specified',
      );
    }

    if (!cityId && countryISO2Code) {
      // Country-only validation could be performed here if needed
      return;
    }

    const city = await db.query.cities.findFirst({
      where: eq(schema.cities.id, cityId),
    });
    const cityTranslations = await db.query.cityTranslations.findFirst({
      where: eq(schema.cityTranslations.cityId, cityId),
    });
    if (!city) {
      throw new BadRequestException(`City with ID ${cityId} not found.`);
    }

    if (city.countryIso2 !== countryISO2Code) {
      throw new BadRequestException(
        `City ${cityTranslations?.name} with ID ${cityId} does not belong to country ${countryISO2Code}.`,
      );
    }
  }
  async create(
    createTourDto: CreateTourDto,
    operatorId: number,
  ): Promise<Tour> {
    return await this.db.transaction(async (tx): Promise<Tour> => {
      try {
        await this.validateCityAndCountry(
          createTourDto.cityId,
          createTourDto.countryISO2Code,
          tx,
        );
        await this.validateCityAndCountry(
          createTourDto.departureCityId,
          createTourDto.departureCountryISO2Code,
          tx,
        );
        const tourData = {
          operatorId,
          ...createTourDto,
          price: createTourDto.price.toFixed(2),
        };
        const result = await tx
          .insert(schema.tours)
          .values(tourData)
          .returning();
        const newTour = result[0];

        if (createTourDto.photos && createTourDto.photos.length > 0) {
          const mainPhotos = createTourDto.photos.filter((p) => p.isMain);
          if (mainPhotos.length > 1) {
            throw new BadRequestException('Only one photo can be set as main.');
          }
          const tourPhotosToInsert = (
            createTourDto.photos as TourPhotoDto[]
          ).map((photo) => ({
            tourId: newTour.id,
            url: photo.url,
            isMain: photo.isMain,
            description: photo.description,
          }));

          await tx.insert(schema.tourPhotos).values(tourPhotosToInsert);
        }

        return newTour;
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        console.error('Error creating tour:', error);
        throw new BadRequestException(
          'Could not create tour. Please check the provided data.',
        );
      }
    });
  }
  async findAll(query: GetToursQueryDto) {
    const {
      lang = 'en',
      countryISO2Code,
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
      departureCountryISO2Code, // Нове поле
      limit = 10,
      offset = 0,
      sortBy = 'startDate',
      sortOrder = SortOrder.ASC,
    } = query;

    const whereConditions = [eq(schema.tours.isActive, true)]; // Починаємо з обов'язкових умов

    if (countryISO2Code) {
      whereConditions.push(eq(schema.tours.countryISO2Code, countryISO2Code));
    }
    if (cityId) {
      whereConditions.push(eq(schema.tours.cityId, cityId));
    }
    if (departureCountryISO2Code) {
      // Додано фільтр
      whereConditions.push(
        eq(schema.tours.departureCountryISO2Code, departureCountryISO2Code),
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
          photos: true,
          operator: true,
          country: {
            with: {
              translations: {
                where: eq(schema.countryTranslations.languageCode, lang),
              },
            },
          },
          city: {
            with: {
              translations: {
                where: eq(schema.cityTranslations.languageCode, lang),
              },
            },
          },
          departureCity: {
            with: {
              translations: {
                where: eq(schema.cityTranslations.languageCode, lang),
              },
            },
          },
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

  async findOne(id: number, lang = 'en') {
    const tour = await this.db.query.tours.findFirst({
      where: eq(schema.tours.id, id),
      with: {
        photos: true,
        operator: {
          columns: {
            companyName: true,
            firstName: true,
            lastName: true,
            website: true,
          },
        },
        country: {
          with: {
            translations: {
              where: eq(schema.countryTranslations.languageCode, lang),
            },
          },
        },
        city: {
          with: {
            translations: {
              where: eq(schema.cityTranslations.languageCode, lang),
            },
          },
        },
        departureCity: {
          with: {
            translations: {
              where: eq(schema.cityTranslations.languageCode, lang),
            },
          },
        },
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
        where: and(
          eq(schema.tours.id, id),
          eq(schema.tours.operatorId, operatorId),
        ),
      });

      if (!existingTour) {
        throw new NotFoundException(
          `Tour with ID ${id} not found or you don't have permission to update it.`,
        );
      }
      if (updateTourDto.cityId || updateTourDto.countryISO2Code) {
        const cityId = updateTourDto.cityId ?? existingTour.cityId;
        const countryISO2Code =
          updateTourDto.countryISO2Code ?? existingTour.countryISO2Code;
        if (cityId && countryISO2Code) {
          await this.validateCityAndCountry(cityId, countryISO2Code, tx);
        }
      }

      if (
        updateTourDto.departureCityId ||
        updateTourDto.departureCountryISO2Code
      ) {
        const departureCityId =
          updateTourDto.departureCityId ?? existingTour.departureCityId;
        const departureCountryISO2Code =
          updateTourDto.departureCountryISO2Code ??
          existingTour.departureCountryISO2Code;
        await this.validateCityAndCountry(
          departureCityId,
          departureCountryISO2Code,
          tx,
        );
      }
      const [updatedTour] = await tx
        .update(schema.tours)
        .set({
          ...updateTourDto,
          price:
            updateTourDto.price !== undefined
              ? updateTourDto.price.toFixed(2)
              : undefined,
          updatedAt: new Date(),
        })
        .where(eq(schema.tours.id, id))
        .returning();

      if (!updatedTour) {
        throw new BadRequestException('Failed to update tour data.');
      }

      if (updateTourDto.photos !== undefined) {
        const mainPhotos = updateTourDto.photos.filter((p) => p.isMain);
        if (mainPhotos.length > 1) {
          throw new BadRequestException('Only one photo can be set as main.');
        }
        await tx
          .delete(schema.tourPhotos)
          .where(eq(schema.tourPhotos.tourId, id));

        if (updateTourDto.photos.length > 0) {
          const newPhotosToInsert = (
            updateTourDto.photos as TourPhotoDto[]
          ).map((photo) => ({
            tourId: id,
            url: photo.url,
            isMain: photo.isMain,
            description: photo.description,
          }));
          await tx.insert(schema.tourPhotos).values(newPhotosToInsert);
        }
      }

      const tourWithPhotos = await tx.query.tours.findFirst({
        where: eq(schema.tours.id, updatedTour.id),
        with: { photos: true },
      });

      if (!tourWithPhotos) {
        throw new NotFoundException(
          `Tour with ID ${id} not found after update.`,
        );
      }

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
      where: and(
        eq(schema.tours.id, id),
        eq(schema.tours.operatorId, operatorId),
      ),
    });

    if (!existingTour) {
      throw new NotFoundException(
        `Tour with ID ${id} not found or you don't have permission to delete it.`,
      );
    }

    const [deletedTour] = await this.db
      .update(schema.tours)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(schema.tours.id, id))
      .returning();

    if (!deletedTour) {
      throw new BadRequestException('Failed to deactivate tour.');
    }

    return { message: `Tour with ID ${id} has been deactivated.` };
  }
}
