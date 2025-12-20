import { Test, TestingModule } from '@nestjs/testing';
import { ToursService } from './tours.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@app/db/schema/schema';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { Tour } from './tours.types';

xdescribe('ToursService - JSON Fields', () => {
  let service: ToursService;
  let mockDb: DeepMockProxy<NodePgDatabase<typeof schema>>;

  const mockCity = {
    id: 1,
    countryIso2: 'UA',
    translations: [{ languageCode: 'en', name: 'Kyiv' }],
  };

  const mockCountry = {
    iso2: 'UA',
    iso3: 'UKR',
    translations: [{ languageCode: 'en', name: 'Ukraine' }],
  };

  const mockTour = {
    id: 1,
    operatorId: 1,
    title: 'Test Tour',
    price: '1000.00',
    cityId: 1,
    countryISO2Code: 'UA',
    startDate: '2026-01-01',
    endDate: '2025-01-07',
    availableSpots: 10,
    isActive: true,
  } as unknown as Tour;

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

  describe('create', () => {
    it('should populate city and country JSON fields on create', async () => {
      const createDto: CreateTourDto = {
        title: 'New Tour',
        price: 1500,
        cityId: 1,
        countryISO2Code: 'UA',
        startDate: '2025-06-01',
        endDate: '2025-06-10',
        availableSpots: 20,
        description: 'Description',
        photos: [],
        photo_files: [],
        currency: 'UAH',
        type: 'Relax',
        conditions: 'None',
        isActive: true,
      };

      // Mock city/country lookup
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockDb.query.cities.findFirst.mockResolvedValue(mockCity as any);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockDb.query.countries.findFirst.mockResolvedValue(mockCountry as any);

      // Mock insert returning
      const mockResult = [{ ...mockTour, id: 2 }];
      const mockValues = { returning: jest.fn().mockResolvedValue(mockResult) };
      const mockInsert = { values: jest.fn().mockReturnValue(mockValues) };
      (mockDb.insert as jest.Mock).mockReturnValue(mockInsert);

      // Mock tour fetch after create
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockDb.query.tours.findFirst.mockResolvedValue({
        ...mockResult[0],
        photos: [],
      } as any);

      await service.create(createDto, 1);

      // Verify db.insert was called with city and country populated
      expect(mockInsert.values).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          city: expect.objectContaining({ id: 1 }),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          country: expect.objectContaining({ iso2: 'UA' }),
        }),
      );
    });
  });

  describe('update', () => {
    it('should update city and country JSON fields when location changes', async () => {
      const updateDto: UpdateTourDto = {
        cityId: 2, // Changing city
        countryISO2Code: 'UA',
        availableSpots: 10,
      };

      const existingTour = { ...mockTour };
      const newCity = {
        ...mockCity,
        id: 2,
        translations: [{ languageCode: 'en', name: 'Lviv' }],
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockDb.query.tours.findFirst.mockResolvedValue(existingTour as any);
      mockDb.query.bookings.findMany.mockResolvedValue([]); // No bookings

      // Mock validation lookup for new city
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockDb.query.cities.findFirst.mockResolvedValue(newCity as any);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockDb.query.countries.findFirst.mockResolvedValue(mockCountry as any);

      // Mock update
      const mockReturning = {
        returning: jest
          .fn()
          .mockResolvedValue([{ ...existingTour, cityId: 2 }]),
      };
      const mockWhere = { where: jest.fn().mockReturnValue(mockReturning) };
      const mockSet = { set: jest.fn().mockReturnValue(mockWhere) };
      (mockDb.update as jest.Mock).mockReturnValue(mockSet);

      // Mock tour fetch after update
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockDb.query.tours.findFirst.mockResolvedValue({
        ...existingTour,
        cityId: 2,
        photos: [],
      } as any);

      await service.update(1, updateDto, 1);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const setCallArgs = mockSet.set.mock.calls[0][0];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(setCallArgs.city).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(setCallArgs.city.id).toBe(2);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(setCallArgs.country).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(setCallArgs.country.iso2).toBe('UA');
    });

    it('should NOT update city and country JSON fields when location does NOT change', async () => {
      const updateDto: UpdateTourDto = {
        description: 'Updated Description',
        availableSpots: 10,
      };

      const existingTour = { ...mockTour };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockDb.query.tours.findFirst.mockResolvedValue(existingTour as any);
      mockDb.query.bookings.findMany.mockResolvedValue([]);

      // Mock update
      const mockReturning = {
        returning: jest
          .fn()
          .mockResolvedValue([
            { ...existingTour, description: 'Updated Description' },
          ]),
      };
      const mockWhere = { where: jest.fn().mockReturnValue(mockReturning) };
      const mockSet = { set: jest.fn().mockReturnValue(mockWhere) };
      (mockDb.update as jest.Mock).mockReturnValue(mockSet);

      // Mock tour fetch after update
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockDb.query.tours.findFirst.mockResolvedValue({
        ...existingTour,
        description: 'Updated Description',
        photos: [],
      } as any);

      await service.update(1, updateDto, 1);

      // Verify set was NOT called with city or country
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const setCallArgs = mockSet.set.mock.calls[0][0] as Record<
        string,
        unknown
      >;
      expect(setCallArgs).not.toHaveProperty('city');
      expect(setCallArgs).not.toHaveProperty('country');

      // Verify set WAS called with description
      expect(setCallArgs).toHaveProperty('description', 'Updated Description');
    });
  });
});
