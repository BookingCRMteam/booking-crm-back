import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTourDto } from './dto/create-tour.dto';
import { Tour, TourPhoto } from './tours.types';
import { GetToursQueryDto, SortOrder } from './dto/get-tours-query.dto';
import { and, asc, desc, eq, gte, lte, ne, sql } from 'drizzle-orm';
import { UpdateTourDto } from './dto/update-tour.dto';
import { UpdateTourPhotoDto } from './dto/update-tour-photo.dto';

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
          const tourPhotosToInsert = createTourDto.photos.map((photo) => ({
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
      minStartDate,
      maxStartDate,
      minEndDate,
      maxEndDate,
      minPrice,
      maxPrice,
      limit = 10,
      offset = 0,
      sortBy = 'startDate',
      sortOrder = SortOrder.ASC,
    } = query;

    const whereConditions = [eq(schema.tours.isActive, true)]; // Start with mandatory conditions
    if (countryISO2Code) {
      whereConditions.push(eq(schema.tours.countryISO2Code, countryISO2Code));
    }
    if (cityId) {
      whereConditions.push(eq(schema.tours.cityId, cityId));
    }
    if (type) {
      whereConditions.push(eq(schema.tours.type, type));
    }
    if (minStartDate) {
      whereConditions.push(gte(schema.tours.startDate, minStartDate));
    }
    if (maxStartDate) {
      whereConditions.push(lte(schema.tours.startDate, maxStartDate));
    }
    if (minEndDate) {
      whereConditions.push(gte(schema.tours.endDate, minEndDate));
    }
    if (maxEndDate) {
      whereConditions.push(lte(schema.tours.endDate, maxEndDate));
    }
    if (minPrice !== undefined) {
      whereConditions.push(gte(schema.tours.price, minPrice.toString()));
    }
    if (maxPrice !== undefined) {
      whereConditions.push(lte(schema.tours.price, maxPrice.toString()));
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
      try {
        const { photos, ...tourData } = updateTourDto;

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

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(existingTour.startDate) < today) {
          const allowedUpdates = { isActive: false };
          const updates = Object.keys(tourData);
          const isOnlyDeactivating = updates.every(
            (key) => key in allowedUpdates,
          );

          if (!isOnlyDeactivating || updates.length === 0) {
            throw new BadRequestException(
              'Cannot update a tour that has already started. Only deactivation is allowed.',
            );
          }
        }

        if (tourData.cityId || tourData.countryISO2Code) {
          const cityId = tourData.cityId ?? existingTour.cityId;
          const countryISO2Code =
            tourData.countryISO2Code ?? existingTour.countryISO2Code;
          if (cityId && countryISO2Code) {
            await this.validateCityAndCountry(cityId, countryISO2Code, tx);
          }
        }
        const [updatedTour] = await tx
          .update(schema.tours)
          .set({
            ...tourData,
            price:
              tourData.price !== undefined
                ? tourData.price.toFixed(2)
                : undefined,
            updatedAt: new Date(),
          })
          .where(eq(schema.tours.id, id))
          .returning();

        if (!updatedTour) {
          throw new BadRequestException('Failed to update tour data.');
        }

        if (photos !== undefined) {
          const mainPhotos = photos.filter((p) => p.isMain);
          if (mainPhotos.length > 1) {
            throw new BadRequestException('Only one photo can be set as main.');
          }

          const existingDbPhotos = await tx.query.tourPhotos.findMany({
            where: eq(schema.tourPhotos.tourId, id),
          });
          const existingDbPhotoUrls = new Set(
            existingDbPhotos.map((p) => p.url),
          );

          const newPhotos = photos.filter(
            (p) => p.url && !existingDbPhotoUrls.has(p.url),
          );

          if (newPhotos.length > 0) {
            const newPhotosToInsert = newPhotos.map((photo) => ({
              tourId: id,
              url: photo.url,
              isMain: photo.isMain ?? false,
              description: photo.description,
            }));
            await tx.insert(schema.tourPhotos).values(newPhotosToInsert);
          }

          const newMainPhoto = photos.find((p) => p.isMain);
          if (
            newMainPhoto &&
            newPhotos.some((p) => p.url === newMainPhoto.url)
          ) {
            await tx
              .update(schema.tourPhotos)
              .set({ isMain: false })
              .where(
                and(
                  eq(schema.tourPhotos.tourId, id),
                  ne(schema.tourPhotos.url, newMainPhoto.url),
                ),
              );
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
      } catch (error) {
        console.error('Error in update transaction:', error);
        throw error;
      }
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

  async updatePhoto(
    tourId: number,
    photoId: number,
    operatorId: number,
    updateTourPhotoDto: UpdateTourPhotoDto,
    photoUrl?: string,
  ): Promise<TourPhoto> {
    return await this.db.transaction(async (tx) => {
      const tour = await tx.query.tours.findFirst({
        where: and(
          eq(schema.tours.id, tourId),
          eq(schema.tours.operatorId, operatorId),
        ),
      });

      if (!tour) {
        throw new NotFoundException(
          `Tour with ID ${tourId} not found or you don't have permission to update it.`,
        );
      }

      const photo = await tx.query.tourPhotos.findFirst({
        where: and(
          eq(schema.tourPhotos.id, photoId),
          eq(schema.tourPhotos.tourId, tourId),
        ),
      });

      if (!photo) {
        throw new NotFoundException(`Photo with ID ${photoId} not found.`);
      }

      if (updateTourPhotoDto.isMain) {
        await tx
          .update(schema.tourPhotos)
          .set({ isMain: false })
          .where(eq(schema.tourPhotos.tourId, tourId));
      }

      const [updatedPhoto] = await tx
        .update(schema.tourPhotos)
        .set({
          ...updateTourPhotoDto,
          url: photoUrl ?? photo.url,
        })
        .where(eq(schema.tourPhotos.id, photoId))
        .returning();

      return updatedPhoto;
    });
  }
}
