import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@app/db/schema/schema';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { NotFoundException } from '@nestjs/common';

// Mock Stripe and LiqPay
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  }));
});

jest.mock('liqpayjs-sdk', () => {
  return jest.fn().mockImplementation(() => ({
    cnb_form: jest.fn(),
  }));
});

describe('BookingsService', () => {
  let service: BookingsService;
  let mockDb: DeepMockProxy<NodePgDatabase<typeof schema>>;

  beforeEach(async () => {
    process.env.STRIPE_SECRET_KEY = 'test_stripe_key';
    process.env.LIQPAY_PUBLIC_KEY = 'test_public_key';
    process.env.LIQPAY_PRIVATE_KEY = 'test_private_key';

    mockDb = mockDeep<NodePgDatabase<typeof schema>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: 'DRIZZLE_CLIENT',
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTourBookingStats', () => {
    it('should return stats when bookings exist', async () => {
      const tourId = 1;
      const mockStats = { totalBookings: '5', totalPeople: '10' };

      const mockExecute = jest.fn().mockResolvedValue([mockStats]);
      const mockWhere = jest.fn().mockReturnValue({ execute: mockExecute });
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });

      // Mocking db.select().from().where().execute()
      (mockDb.select as jest.Mock).mockReturnValue({
        from: mockFrom,
      });

      const result = await service.getTourBookingStats(tourId);

      expect(result).toEqual({
        totalBookings: 5,
        totalPeople: 10,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockDb.select as jest.Mock).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalled();
      expect(mockExecute).toHaveBeenCalled();
    });

    it('should throw NotFoundException when no bookings found', async () => {
      const tourId = 1;
      const mockStats = { totalBookings: '0', totalPeople: '0' };

      const mockExecute = jest.fn().mockResolvedValue([mockStats]);
      const mockWhere = jest.fn().mockReturnValue({ execute: mockExecute });
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });

      (mockDb.select as jest.Mock).mockReturnValue({
        from: mockFrom,
      });

      await expect(service.getTourBookingStats(tourId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when result is empty (edge case)', async () => {
      const tourId = 1;

      const mockExecute = jest.fn().mockResolvedValue([]);
      const mockWhere = jest.fn().mockReturnValue({ execute: mockExecute });
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });

      (mockDb.select as jest.Mock).mockReturnValue({
        from: mockFrom,
      });

      await expect(service.getTourBookingStats(tourId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
