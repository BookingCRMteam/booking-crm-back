import { Test, TestingModule } from '@nestjs/testing';
import { OperatorBookingsService } from './operator-bookings.service';

describe('OperatorBookingsService', () => {
  let service: OperatorBookingsService;

  const mockDb = {
    select: jest.fn(),
    from: jest.fn(),
    where: jest.fn(),
    innerJoin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OperatorBookingsService,
        {
          provide: 'DRIZZLE_CLIENT',
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<OperatorBookingsService>(OperatorBookingsService);

    // Mocks for chained calls
    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.innerJoin.mockReturnValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOperatorBookings', () => {
    it('should return an empty array if no operator user id is provided', async () => {
      const result = await service.getOperatorBookings(0);
      expect(result).toEqual([]);
    });

    it('should return an empty array if operator is not found', async () => {
      mockDb.where.mockResolvedValue([]);
      const result = await service.getOperatorBookings(1);
      expect(result).toEqual([]);
    });

    it('should return an empty array if operator has no tours', async () => {
      mockDb.where
        .mockResolvedValueOnce([{ operatorId: 1 }])
        .mockResolvedValueOnce([]);
      const result = await service.getOperatorBookings(1);
      expect(result).toEqual([]);
    });

    it('should return mapped bookings', async () => {
      const operatorId = 1;
      const tourIds = [1, 2];
      const bookingsData = [
        {
          bookingId: 1,
          status: 'paid',
          totalPrice: '100',
          currency: 'USD',
          createdAt: new Date().toISOString(),
          tourTitle: 'Test Tour',
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          customerName: 'Test User',
          customerPhone: '1234567890',
        },
      ];

      // 1. Find operator
      mockDb.where.mockResolvedValueOnce([{ operatorId }]);
      // 2. Find tours for operator
      mockDb.where.mockResolvedValueOnce(tourIds.map((id) => ({ id })));
      // 3. Find bookings for tours
      mockDb.where.mockResolvedValueOnce(bookingsData);

      const result = await service.getOperatorBookings(1);

      expect(result).toHaveLength(1);
      expect(result[0].bookingId).toBe(bookingsData[0].bookingId);
      expect(result[0].totalPriceUAH).toBe('4000.00'); // 100 * 40
    });
    it('should throw ForbiddenException if operator status is "На перевірці"', async () => {
      mockDb.where.mockResolvedValueOnce([
        { operatorId: 1, status: 'На перевірці' },
      ]);
      await expect(service.getOperatorBookings(1)).rejects.toThrow(
        'Доступ заборонено для вашого статусу оператора',
      );
    });

    it('should throw ForbiddenException if operator status is "Відхилено"', async () => {
      mockDb.where.mockResolvedValueOnce([
        { operatorId: 1, status: 'Відхилено' },
      ]);
      await expect(service.getOperatorBookings(1)).rejects.toThrow(
        'Доступ заборонено для вашого статусу оператора',
      );
    });
  });
  describe('convertToUAH', () => {
    it('should convert USD to UAH', () => {
      // @ts-expect-error --- IGNORE --
      expect(service.convertToUAH('100', 'USD')).toBe('4000.00');
    });

    it('should convert EUR to UAH', () => {
      // @ts-expect-error --- IGNORE ---

      expect(service.convertToUAH('100', 'EUR')).toBe('4300.00');
    });

    it('should return the same amount for UAH', () => {
      // @ts-expect-error --- IGNORE ---

      expect(service.convertToUAH('100', 'UAH')).toBe('100.00');
    });

    it('should throw an error for unsupported currency', () => {
      // @ts-expect-error --- IGNORE ---
      expect(() => service.convertToUAH('100', 'GBP')).toThrow(
        'Unsupported currency: GBP',
      );
    });
  });
});
