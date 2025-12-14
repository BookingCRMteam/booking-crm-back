/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ToursService } from './tours.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@app/db/schema/schema';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { GetToursQueryDto } from './dto/get-tours-query.dto';
import { Tour } from './tours.types';

describe('ToursService', () => {
  let service: ToursService;
  let mockDb: DeepMockProxy<NodePgDatabase<typeof schema>>;

  const mockOperator = {
    id: 1,
    email: 'operator@example.com',
    companyName: 'Test Operator',
    phone: '1234567890',
  };

  const mockCountry = {
    iso2: 'FR',
    id: 1,
    iso3: 'FRA',
    translations: [],
  };

  const mockCity = {
    id: 1,
    countryIso2: 'FR',
    translations: [],
  };

  const mockTour: Tour = {
    id: 1,
    operatorId: 1,
    title: 'Test Tour',
    description: 'Test Description',
    countryISO2Code: 'FR',
    cityId: 1,
    type: 'Adventure',
    price: '1000.00',
    currency: 'USD',
    startDate: '2025-12-01',
    endDate: '2025-12-10',
    availableSpots: 10,
    conditions: 'Test conditions',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    operator: mockOperator,
    photos: [],
    country: mockCountry,
    city: mockCity,
  };

  const mockTourWithRelations: Tour = {
    ...mockTour,
    photos: [
      {
        id: 1,
        tourId: 1,
        url: 'photo1.jpg',
        isMain: true,
        description: 'Main photo',
      },
      {
        id: 2,
        tourId: 1,
        url: 'photo2.jpg',
        isMain: false,
        description: 'Side photo',
      },
    ],
  };

  beforeEach(async () => {
    mockDb = mockDeep<NodePgDatabase<typeof schema>>();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    mockDb.transaction.mockImplementation((cb) => cb(mockDb as any));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToursService,
        {
          provide: 'DRIZZLE_CLIENT',
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<ToursService>(ToursService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkAvailability', () => {
    it('should return availability when tour exists and is active', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockDb.query.tours.findFirst.mockResolvedValue(mockTour as any);

      const result = await service.checkAvailability(1, 5);

      expect(result).toEqual({
        tourId: 1,
        requestedSpots: 5,
        availableSpots: 10,
        isAvailable: true,
      });
      expect(mockDb.query.tours.findFirst).toHaveBeenCalled();
    });

    it('should return isAvailable false when not enough spots', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockDb.query.tours.findFirst.mockResolvedValue(mockTour as any);

      const result = await service.checkAvailability(1, 15);

      expect(result).toEqual({
        tourId: 1,
        requestedSpots: 15,
        availableSpots: 10,
        isAvailable: false,
      });
    });

    it('should throw NotFoundException when tour does not exist', async () => {
      mockDb.query.tours.findFirst.mockResolvedValue(undefined);

      await expect(service.checkAvailability(999, 5)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.checkAvailability(999, 5)).rejects.toThrow(
        'Tour with ID 999 not found.',
      );
    });

    it('should throw BadRequestException when tour is not active', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockDb.query.tours.findFirst.mockResolvedValue({
        ...mockTour,
        isActive: false,
      } as any);

      await expect(service.checkAvailability(1, 5)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.checkAvailability(1, 5)).rejects.toThrow(
        'Tour with ID 1 is not active.',
      );
    });
  });

  describe('findOne', () => {
    it('should return a tour with relations', async () => {
      mockDb.query.tours.findFirst.mockResolvedValue(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        mockTourWithRelations as any,
      );

      const result = await service.findOne(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.photos).toHaveLength(2);
      expect(result.photos?.[0].isMain).toBe(true);
    });

    it('should throw NotFoundException when tour does not exist', async () => {
      mockDb.query.tours.findFirst.mockResolvedValue(undefined);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Tour with ID 999 not found or is inactive.',
      );
    });

    it('should throw NotFoundException when tour is inactive', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockDb.query.tours.findFirst.mockResolvedValue({
        ...mockTour,
        isActive: false,
      } as any);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return tours with pagination', async () => {
      const mockTours = [{ ...mockTour, photos: [] }];
      const query: GetToursQueryDto = { limit: 10, offset: 0 };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockDb.query.tours.findMany.mockResolvedValue(mockTours as any);

      const mockCount = [{ count: 1 }];
      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockCount),
      };
      (mockDb.select as jest.Mock).mockReturnValue(mockSelect);

      const result = await service.findAll(query);

      expect(result.tours).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('should filter tours by country', async () => {
      const query: GetToursQueryDto = {
        countryISO2Code: 'FR',
        limit: 10,
        offset: 0,
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockDb.query.tours.findMany.mockResolvedValue([
        { ...mockTour, photos: [] },
      ] as any);
      const mockCount = [{ count: 1 }];
      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockCount),
      };
      (mockDb.select as jest.Mock).mockReturnValue(mockSelect);

      await service.findAll(query);

      expect(mockDb.query.tours.findMany).toHaveBeenCalled();
    });

    it('should filter tours by price range', async () => {
      const query: GetToursQueryDto = {
        minPrice: 500,
        maxPrice: 1500,
        limit: 10,
        offset: 0,
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockDb.query.tours.findMany.mockResolvedValue([
        { ...mockTour, photos: [] },
      ] as any);
      const mockCount = [{ count: 1 }];
      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockCount),
      };
      (mockDb.select as jest.Mock).mockReturnValue(mockSelect);

      await service.findAll(query);

      expect(mockDb.query.tours.findMany).toHaveBeenCalled();
    });

    it('should filter tours by operatorId', async () => {
      const query: GetToursQueryDto = {
        operatorId: 1,
        limit: 10,
        offset: 0,
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockDb.query.tours.findMany.mockResolvedValue([
        { ...mockTour, photos: [] },
      ] as any);
      const mockCount = [{ count: 1 }];
      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockCount),
      };
      (mockDb.select as jest.Mock).mockReturnValue(mockSelect);

      await service.findAll(query);

      expect(mockDb.query.tours.findMany).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should deactivate a tour', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockDb.query.tours.findFirst.mockResolvedValue(mockTour as any);
      const mockReturning = {
        returning: jest

          .fn()
          .mockResolvedValue([{ ...mockTour, isActive: false }] as any),
      };
      const mockWhere = {
        where: jest.fn().mockReturnValue(mockReturning),
      };
      const mockSet = {
        set: jest.fn().mockReturnValue(mockWhere),
      };
      (mockDb.update as jest.Mock).mockReturnValue(mockSet);

      const result = await service.remove(1, 1);

      expect(result.message).toBe('Tour with ID 1 has been deactivated.');
    });

    it('should throw NotFoundException when tour does not exist', async () => {
      mockDb.query.tours.findFirst.mockResolvedValue(undefined);

      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999, 1)).rejects.toThrow(
        "Tour with ID 999 not found or you don't have permission to delete it.",
      );
    });

    it('should throw NotFoundException when operator does not own the tour', async () => {
      mockDb.query.tours.findFirst.mockResolvedValue(undefined);

      await expect(service.remove(1, 999)).rejects.toThrow(NotFoundException);
    });
  });
});
