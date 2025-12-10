import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@app/db/schema/schema';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { NotFoundException, ConflictException } from '@nestjs/common';

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
  describe('getBookingWithTour', () => {
    it('should return booking with tour when found', async () => {
      const bookingId = 1;
      const tourId = 1;
      const mockBooking = { id: bookingId, tourId, tour: { id: tourId } };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockDb.query.bookings.findFirst.mockResolvedValue(mockBooking as any);

      const result = await service.getBookingWithTour(bookingId, tourId);

      expect(result).toEqual(mockBooking);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockDb.query.bookings.findFirst as jest.Mock).toHaveBeenCalled();
    });

    it('should throw NotFoundException when booking not found', async () => {
      const bookingId = 1;
      const tourId = 1;

      mockDb.query.bookings.findFirst.mockResolvedValue(undefined);

      await expect(
        service.getBookingWithTour(bookingId, tourId),
      ).rejects.toThrow(NotFoundException);
    });
  });
  describe('repayBooking', () => {
    it('should throw NotFoundException if booking not found', async () => {
      mockDb.query.bookings.findFirst.mockResolvedValue(undefined);
      await expect(service.repayBooking(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if status is not pending_payment', async () => {
      mockDb.query.bookings.findFirst.mockResolvedValue({
        id: 1,
        status: 'confirmed',
        tour: { title: 'Test Tour' },
      } as any);
      await expect(service.repayBooking(1)).rejects.toThrow(ConflictException);
    });

    it('should generate Stripe link', async () => {
      const mockBooking = {
        id: 1,
        tourId: 101,
        status: 'pending_payment',
        paymentProvider: 'stripe',
        totalPrice: '100.00',
        currency: 'USD',
        tour: { title: 'Test Tour' },
      };

      mockDb.query.bookings.findFirst.mockResolvedValue(mockBooking as any);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const stripeInstance = (service as any).stripe;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      stripeInstance.checkout.sessions.create.mockResolvedValue({
        url: 'http://stripe.com/pay',
        id: 'sess_123',
      });

      const mockWhere = jest.fn().mockResolvedValue({});
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });

      mockDb.update.mockReturnValue({
        set: mockSet,
      } as any);

      const result = await service.repayBooking(1);
      expect(result.paymentLink).toBe('http://stripe.com/pay');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({ paymentSessionId: 'sess_123' });
    });

    it('should generate LiqPay link', async () => {
      const mockBooking = {
        id: 1,
        tourId: 101,
        status: 'pending_payment',
        paymentProvider: 'liqpay',
        totalPrice: '100.00',
        currency: 'UAH',
        tour: { title: 'Test Tour' },
      };

      mockDb.query.bookings.findFirst.mockResolvedValue(mockBooking as any);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const liqpayInstance = (service as any).liqpay;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      liqpayInstance.cnb_form.mockReturnValue('http://liqpay.com/pay');

      const mockWhere = jest.fn().mockResolvedValue({});
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });

      mockDb.update.mockReturnValue({
        set: mockSet,
      } as any);

      const result = await service.repayBooking(1);
      expect(result.paymentLink).toBe('http://liqpay.com/pay');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockDb.update).toHaveBeenCalled();
    });
  });
});
