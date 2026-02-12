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
import { AdminGetToursQueryDto } from './dto/admin-get-tours-query.dto';
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
      return null;
    }

    if (cityId && !countryISO2Code) {
      throw new BadRequestException(
        'Country ISO2 code is required when city is specified',
      );
    }

    const country = await db.query.countries.findFirst({
      where: eq(schema.countries.iso2, countryISO2Code),
      with: { translations: true },
    });

    if (!country) {
      throw new BadRequestException(
        `Country with ISO2 code ${countryISO2Code} not found.`,
      );
    }

    if (!cityId && countryISO2Code) {
      return { country, city: null };
    }

    const city = await db.query.cities.findFirst({
      where: eq(schema.cities.id, cityId),
      with: { translations: true },
    });

    if (!city) {
      throw new BadRequestException(`City with ID ${cityId} not found.`);
    }

    if (city.countryIso2 !== countryISO2Code) {
      const cityEnName =
        city.translations.find((t) => t.languageCode === 'en')?.name ||
        'Unknown';
      throw new BadRequestException(
        `City ${cityEnName} with ID ${cityId} does not belong to country ${countryISO2Code}.`,
      );
    }

    return { country, city };
  }
  private async validateTourOwnership(
    tourId: number,
    operatorId: number,
    tx: NodePgDatabase<typeof schema>,
  ): Promise<typeof schema.tours.$inferSelect> {
    const tour = await tx.query.tours.findFirst({
      where: and(
        eq(schema.tours.id, tourId),
        eq(schema.tours.operatorId, operatorId),
      ),
    });

    if (!tour) {
      throw new NotFoundException(
        `Tour with ID ${tourId} not found or you don't have permission to modify it.`,
      );
    }
    return tour;
  }

  async getTourPhotoCount(tourId: number): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.tourPhotos)
      .where(eq(schema.tourPhotos.tourId, tourId));
    return Number(result[0].count);
  }

  async create(
    createTourDto: CreateTourDto,
    operatorId: number,
  ): Promise<Tour> {
    return await this.db.transaction(async (tx): Promise<Tour> => {
      try {
        const locationData = await this.validateCityAndCountry(
          createTourDto.cityId,
          createTourDto.countryISO2Code,
          tx,
        );
        const tourData = {
          operatorId,
          ...createTourDto,
          price: createTourDto.price.toFixed(2),
          city: locationData?.city ?? null,
          country: locationData?.country ?? null,
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

          const tourPhotos = await tx.query.tourPhotos.findMany({
            where: eq(schema.tourPhotos.tourId, newTour.id),
          });

          const hasMainPhoto = tourPhotos.some((p) => p.isMain);

          if (!hasMainPhoto && tourPhotos.length > 0) {
            const firstPhoto = tourPhotos[0];
            await tx
              .update(schema.tourPhotos)
              .set({ isMain: true })
              .where(eq(schema.tourPhotos.id, firstPhoto.id));
          }
        }

        const finalTour = await tx.query.tours.findFirst({
          where: eq(schema.tours.id, newTour.id),
          with: { photos: true },
        });
        finalTour.photos.sort((a, b) =>
          a.isMain === b.isMain ? 0 : a.isMain ? -1 : 1,
        );
        return finalTour;
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
      operatorId,
      type,
      minStartDate,
      maxStartDate,
      minEndDate,
      maxEndDate,
      minPrice,
      maxPrice,
      isFeatured,
      limit = 10,
      offset = 0,
      sortBy = 'id',
      sortOrder = SortOrder.ASC,
    } = query;
    const whereConditions = [eq(schema.tours.isActive, true)]; // Start with mandatory conditions
    if (countryISO2Code) {
      whereConditions.push(eq(schema.tours.countryISO2Code, countryISO2Code));
    }
    if (cityId) {
      whereConditions.push(eq(schema.tours.cityId, cityId));
    }
    if (operatorId) {
      whereConditions.push(eq(schema.tours.operatorId, operatorId));
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
    if (isFeatured !== undefined) {
      whereConditions.push(eq(schema.tours.isFeatured, isFeatured));
    }

    // Типізуємо orderByColumn коректно, використовуючи columns з schema.tours
    let orderByColumn:
      | typeof schema.tours.price
      | typeof schema.tours.startDate
      | typeof schema.tours.id;
    switch (sortBy) {
      case 'price':
        orderByColumn = schema.tours.price;
        break;
      case 'startDate':
        orderByColumn = schema.tours.startDate;
        break;
      default:
        orderByColumn = schema.tours.id;
        break;
    }

    // Визначаємо функцію сортування (asc або desc)
    try {
      // Виконання запиту до бази даних
      const preAllTours = await this.db.query.tours.findMany({
        // Використовуйте this.db
        where: and(...whereConditions),
        orderBy:
          sortOrder === SortOrder.DESC
            ? desc(orderByColumn)
            : asc(orderByColumn),
        limit: limit,
        offset: offset,
        with: {
          photos: true,
          operator: true,
          countryRelation: {
            with: {
              translations: {
                where: eq(schema.countryTranslations.languageCode, lang),
              },
            },
          },
          cityRelation: {
            with: {
              translations: {
                where: eq(schema.cityTranslations.languageCode, lang),
              },
            },
          },
        },
      });
      const allTours = preAllTours.map((tour) => {
        const mappedTour = {
          ...tour,
          city: tour.city ?? tour.cityRelation,
          country: tour.country ?? tour.countryRelation,
          photos: tour.photos.sort((a, b) =>
            a.isMain === b.isMain ? 0 : a.isMain ? -1 : 1,
          ),
        };

        delete mappedTour.cityRelation;

        delete mappedTour.countryRelation;
        return mappedTour;
      });
      // Отримання загальної кількості записів для пагінації
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
  async findAllAdmin(query: AdminGetToursQueryDto & { lang?: string }) {
    const {
      lang = 'en',
      countryISO2Code,
      cityId,
      operatorId,
      type,
      minStartDate,
      maxStartDate,
      minEndDate,
      maxEndDate,
      minPrice,
      maxPrice,
      limit = 10,
      offset = 0,
      sortBy = 'id',
      sortOrder = SortOrder.ASC,
      search,
    } = query;

    // Типізуємо whereConditions для безпечного використання з Drizzle ORM
    const whereConditions: Array<ReturnType<typeof eq>> = [];

    // Фільтр по статусу
    // if (status) {
    //   whereConditions.push(eq(schema.tours.status, status));
    // }

    if (countryISO2Code)
      whereConditions.push(eq(schema.tours.countryISO2Code, countryISO2Code));
    if (cityId) whereConditions.push(eq(schema.tours.cityId, cityId));
    if (operatorId)
      whereConditions.push(eq(schema.tours.operatorId, operatorId));
    if (type) whereConditions.push(eq(schema.tours.type, type));

    if (minStartDate)
      whereConditions.push(gte(schema.tours.startDate, minStartDate));
    if (maxStartDate)
      whereConditions.push(lte(schema.tours.startDate, maxStartDate));
    if (minEndDate) whereConditions.push(gte(schema.tours.endDate, minEndDate));
    if (maxEndDate) whereConditions.push(lte(schema.tours.endDate, maxEndDate));

    if (minPrice !== undefined)
      whereConditions.push(gte(schema.tours.price, minPrice.toString()));
    if (maxPrice !== undefined)
      whereConditions.push(lte(schema.tours.price, maxPrice.toString()));

    // --- Пошук по назві ---
    if (search) {
      const pattern = `%${search.replace(/[%_]/g, '\\$&')}%`;
      whereConditions.push(sql`${schema.tours.title} ILIKE ${pattern}`);
    }

    // --- Сортування ---
    let orderByColumn:
      | typeof schema.tours.id
      | typeof schema.tours.price
      | typeof schema.tours.startDate = schema.tours.id;
    switch (sortBy) {
      case 'price':
        orderByColumn = schema.tours.price;
        break;
      case 'startDate':
        orderByColumn = schema.tours.startDate;
        break;
      default:
        orderByColumn = schema.tours.id;
        break;
    }

    // --- Основний запит ---
    const rows = await this.db.query.tours.findMany({
      where: and(...whereConditions),
      limit,
      offset,
      orderBy:
        sortOrder === SortOrder.DESC ? desc(orderByColumn) : asc(orderByColumn),
      with: {
        photos: true,
        operator: true,
        countryRelation: {
          with: {
            translations: {
              where: eq(schema.countryTranslations.languageCode, lang),
            },
          },
        },
        cityRelation: {
          with: {
            translations: {
              where: eq(schema.cityTranslations.languageCode, lang),
            },
          },
        },
      },
    });

    // Сортуємо фото — головне перше
    const tours = rows.map((tour) => {
      const mappedTour = {
        ...tour,
        city: tour.city ?? tour.cityRelation,
        country: tour.country ?? tour.countryRelation,
        photos: tour.photos.sort((a, b) =>
          a.isMain === b.isMain ? 0 : a.isMain ? -1 : 1,
        ),
      };
      delete mappedTour.cityRelation;
      delete mappedTour.countryRelation;

      return mappedTour;
    });

    // --- Total count ---
    const totalCountResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.tours)
      .where(and(...whereConditions));

    return {
      tours,
      total: totalCountResult[0]?.count ?? 0,
      limit,
      offset,
    };
  }
  async findOne(id: number, lang = 'en') {
    const tour = await this.db.query.tours.findFirst({
      where: eq(schema.tours.id, id),
      with: {
        photos: true,
        operator: true,
        countryRelation: {
          with: {
            translations: {
              where: eq(schema.countryTranslations.languageCode, lang),
            },
          },
        },
        cityRelation: {
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
    tour.photos.sort((a, b) => (a.isMain === b.isMain ? 0 : a.isMain ? -1 : 1));

    const result = {
      ...tour,
      city: tour.city ?? tour.cityRelation,
      country: tour.country ?? tour.countryRelation,
    };
    delete result.cityRelation;
    delete result.countryRelation;

    return result;
  }

  async checkAvailability(tourId: number, spots: number) {
    const tour = await this.db.query.tours.findFirst({
      where: eq(schema.tours.id, tourId),
    });

    if (!tour) {
      throw new NotFoundException(`Tour with ID ${tourId} not found.`);
    }

    if (!tour.isActive) {
      throw new BadRequestException(`Tour with ID ${tourId} is not active.`);
    }

    if (tour.availableSpots < spots) {
      throw new BadRequestException('Not enough available spots');
    }

    return {
      tourId: tour.id,
      requestedSpots: spots,
      availableSpots: tour.availableSpots,
      isAvailable: true,
    };
  }

  async update(id: number, updateTourDto: UpdateTourDto, operatorId: number) {
    return await this.db.transaction(async (tx) => {
      try {
        const { photos, ...tourData } = updateTourDto;

        const existingTour = await this.validateTourOwnership(
          id,
          operatorId,
          tx,
        );

        const bookingsCount = await tx.query.bookings.findMany({
          where: eq(schema.bookings.tourId, id),
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tourStartDate = new Date(existingTour.startDate);

        if (bookingsCount.length > 0) {
          const allowedUpdates: (keyof UpdateTourDto)[] = [
            'description',
            'availableSpots',
            'price',
          ];
          const requestedUpdates = Object.keys(tourData).filter(
            (key) => tourData[key] !== undefined,
          );

          const isUpdateAllowed = requestedUpdates.every((key) =>
            allowedUpdates.includes(key as keyof UpdateTourDto),
          );

          if (!isUpdateAllowed) {
            throw new BadRequestException(
              'This tour has bookings. Only description and available spots can be updated.',
            );
          }
        } else if (tourStartDate < today) {
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

          if (cityId || countryISO2Code) {
            const locationData = await this.validateCityAndCountry(
              cityId,
              countryISO2Code,
              tx,
            );
            Object.assign(tourData, {
              city: locationData?.city ?? null,
              country: locationData?.country ?? null,
            });
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
          // Validate photo limit within transaction
          const currentPhotoCount = await tx
            .select({ count: sql<number>`count(*)` })
            .from(schema.tourPhotos)
            .where(eq(schema.tourPhotos.tourId, id));

          const newPhotosToAdd = photos.filter(
            (p) => p.url && !existingDbPhotoUrls.has(p.url),
          ).length;

          if (Number(currentPhotoCount[0].count) + newPhotosToAdd > 10) {
            throw new BadRequestException(
              `Cannot exceed 10 photos per tour. Current: ${currentPhotoCount[0].count}, attempting to add: ${newPhotosToAdd}.`,
            );
          }

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

        // Check if there is a main photo, if not, set the first one as main
        const hasMainPhoto = tourWithPhotos.photos.some((p) => p.isMain);
        if (!hasMainPhoto && tourWithPhotos.photos.length > 0) {
          const firstPhoto = tourWithPhotos.photos[0];
          await tx
            .update(schema.tourPhotos)
            .set({ isMain: true })
            .where(eq(schema.tourPhotos.id, firstPhoto.id));
          // Refresh tourWithPhotos to include the change
          const refreshedTourWithPhotos = await tx.query.tours.findFirst({
            where: eq(schema.tours.id, updatedTour.id),
            with: { photos: true },
          });
          if (refreshedTourWithPhotos) {
            return {
              ...refreshedTourWithPhotos,
              price: parseFloat(refreshedTourWithPhotos.price),
              createdAt: refreshedTourWithPhotos.createdAt.toISOString(),
              updatedAt: refreshedTourWithPhotos.updatedAt.toISOString(),
            };
          }
        }

        return {
          ...tourWithPhotos,
          photos: tourWithPhotos.photos.sort((a, b) =>
            a.isMain === b.isMain ? 0 : a.isMain ? -1 : 1,
          ),
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

  async updateFeatureStatus(id: number, isFeatured: boolean) {
    const existingTour = await this.db.query.tours.findFirst({
      where: eq(schema.tours.id, id),
    });

    if (!existingTour) {
      throw new NotFoundException(`Tour with ID ${id} not found.`);
    }

    const [updatedTour] = await this.db
      .update(schema.tours)
      .set({ isFeatured, updatedAt: new Date() })
      .where(eq(schema.tours.id, id))
      .returning();

    return updatedTour;
  }

  async remove(id: number, operatorId: number) {
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
    const bookingsCount = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.bookings)
      .where(eq(schema.bookings.tourId, id));

    if (Number(bookingsCount[0].count) > 0) {
      throw new BadRequestException(
        'Cannot delete a tour that has existing bookings.',
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
      await this.validateTourOwnership(tourId, operatorId, tx);

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

      if (updateTourPhotoDto.isMain === false) {
        const otherPhotos = await tx.query.tourPhotos.findMany({
          where: and(
            eq(schema.tourPhotos.tourId, tourId),
            ne(schema.tourPhotos.id, photoId),
          ),
        });

        const hasMainPhoto = otherPhotos.some((p) => p.isMain);

        if (!hasMainPhoto && otherPhotos.length > 0) {
          const firstPhoto = otherPhotos[0];
          await tx
            .update(schema.tourPhotos)
            .set({ isMain: true })
            .where(eq(schema.tourPhotos.id, firstPhoto.id));
        }
      }

      const finalUpdatedPhoto = await tx.query.tourPhotos.findFirst({
        where: eq(schema.tourPhotos.id, updatedPhoto.id),
      });

      return finalUpdatedPhoto;
    });
  }

  async deletePhoto(
    tourId: number,
    photoId: number,
    operatorId: number,
  ): Promise<{ message: string }> {
    return await this.db.transaction(async (tx) => {
      await this.validateTourOwnership(tourId, operatorId, tx);

      const photo = await tx.query.tourPhotos.findFirst({
        where: and(
          eq(schema.tourPhotos.id, photoId),
          eq(schema.tourPhotos.tourId, tourId),
        ),
      });

      if (!photo) {
        throw new NotFoundException(
          `Photo with ID ${photoId} not found in tour ${tourId}.`,
        );
      }

      await tx
        .delete(schema.tourPhotos)
        .where(eq(schema.tourPhotos.id, photoId));

      if (photo.isMain) {
        const remainingPhotos = await tx.query.tourPhotos.findMany({
          where: eq(schema.tourPhotos.tourId, tourId),
          orderBy: asc(schema.tourPhotos.id),
        });

        if (remainingPhotos.length > 0) {
          await tx
            .update(schema.tourPhotos)
            .set({ isMain: true })
            .where(eq(schema.tourPhotos.id, remainingPhotos[0].id));
        }
      }

      return { message: 'Photo deleted successfully.' };
    });
  }
}
