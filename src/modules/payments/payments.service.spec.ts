/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { BookingGateway } from '../bookings/booking.gateway';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@app/db/schema/schema';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Tour } from '../tours/tours.types';
import { User } from '../user/user.schema';
import { bookings } from '../bookings/bookings.schema';
import LiqPay from 'liqpayjs-sdk';
import { EmailQueueService } from '../email-queue/email-queue.service';

jest.mock('liqpayjs-sdk');

type Booking = typeof bookings.$inferSelect;

describe('PaymentsService', () => {
  let service: PaymentsService;
  let mockDb: DeepMockProxy<NodePgDatabase<typeof schema>>;
  let mockBookingGateway: DeepMockProxy<BookingGateway>;
  let mockEmailQueueService: DeepMockProxy<EmailQueueService>;
  let mockLiqPay: jest.Mocked<LiqPay>;

  const mockUser: User = {
    id: 1,
    sub: 'auth0|12345',
    email: 'test@example.com',
    firstPersonName: 'John',
    firstPersonSurname: 'Doe',
    secondPersonName: null,
    secondPersonSurname: null,
    phone: null,
    role: 'traveler',
    operatorId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
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
    operator: {
      id: 1,
      email: 'test@test.com',
      companyName: 'test',
      phone: '123',
      firstName: 'John',
      lastName: 'Doe',
    },
  };

  const mockBooking: Booking & { user: User; tour: Tour } = {
    id: 1,
    userId: 1,
    tourId: 1,
    status: 'pending_payment',
    totalPrice: '1000',
    currency: 'USD',
    createdAt: new Date(),
    updatedAt: new Date(),
    numberOfPeople: 2,
    firstPersonName: 'test',
    firstPersonSurname: 'test',
    secondPersonName: 'test',
    secondPersonSurname: 'test',
    phone: '123',
    paymentProvider: 'card',
    paymentSessionId: 'test_session',
    user: mockUser,
    tour: mockTour,
  };

  beforeEach(async () => {
    process.env.STRIPE_SECRET_KEY = 'test_key';
    mockDb = mockDeep<NodePgDatabase<typeof schema>>();
    mockBookingGateway = mockDeep<BookingGateway>();
    mockEmailQueueService = mockDeep<EmailQueueService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: 'DRIZZLE_CLIENT', useValue: mockDb },
        { provide: BookingGateway, useValue: mockBookingGateway },
        { provide: EmailQueueService, useValue: mockEmailQueueService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    service['liqpay'] = {
      str_to_sign: jest.fn(),
      public_key: 'test_public_key',
      private_key: 'test_private_key',
      cnb_form: jest.fn(),
    };
    mockLiqPay = service['liqpay'] as jest.Mocked<LiqPay>;
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.LIQPAY_PRIVATE_KEY;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleLiqpayWebhook', () => {
    const validData = Buffer.from(
      JSON.stringify({
        status: 'success',
        order_id: 'booking_1',
      }),
    ).toString('base64');
    const validSignature = 'valid_signature';

    it('should throw InternalServerErrorException if LIQPAY_PRIVATE_KEY is not configured', async () => {
      await expect(
        service.handleLiqpayWebhook({
          data: validData,
          signature: validSignature,
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw UnauthorizedException if signature is invalid', async () => {
      process.env.LIQPAY_PRIVATE_KEY = 'test_key';
      mockLiqPay.str_to_sign.mockReturnValue('invalid_signature');
      await expect(
        service.handleLiqpayWebhook({
          data: validData,
          signature: validSignature,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException for invalid order_id format', async () => {
      process.env.LIQPAY_PRIVATE_KEY = 'test_key';
      const invalidOrderData = Buffer.from(
        JSON.stringify({
          status: 'success',
          order_id: 'invalid_format',
        }),
      ).toString('base64');
      mockLiqPay.str_to_sign.mockReturnValue(validSignature);

      await expect(
        service.handleLiqpayWebhook({
          data: invalidOrderData,
          signature: validSignature,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should confirm booking on success status', async () => {
      process.env.LIQPAY_PRIVATE_KEY = 'test_key';
      mockLiqPay.str_to_sign.mockReturnValue(validSignature);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockDb.query.bookings.findFirst.mockResolvedValue(mockBooking as any);

      (mockDb.transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(mockDb);
      });
      (mockDb.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnThis(),
        where: jest
          .fn()
          .mockResolvedValue([{ ...mockBooking, status: 'confirmed' }] as any),
      });

      await service.handleLiqpayWebhook({
        data: validData,
        signature: validSignature,
      });

      expect(mockDb.query.bookings.findFirst).toHaveBeenCalledTimes(2);
      expect(mockBookingGateway.notifyBookingStatusChange).toHaveBeenCalledWith(
        1,
        'confirmed',
        '1',
      );
      expect(
        mockEmailQueueService.addBookingConfirmationEmail,
      ).toHaveBeenCalledWith({
        email: mockUser.email,
        bookingDetails: {
          id: mockBooking.id,
          tourName: mockTour.title,
          startDate: new Date(mockTour.startDate),
          endDate: new Date(mockTour.endDate),
          price: parseFloat(mockBooking.totalPrice),
          currency: mockBooking.currency,
          numberOfPeople: mockBooking.numberOfPeople,
          firstPersonName: mockBooking.firstPersonName,
          firstPersonSurname: mockBooking.firstPersonSurname,
          operatorFirstName: 'John',
          operatorLastName: 'Doe',
          operatorPhone: '123',
          tourCity: 'Unknown',
          tourCountry: 'Unknown',
        },
      });

      expect(
        mockEmailQueueService.addOperatorBookingPaidEmail,
      ).toHaveBeenCalledWith({
        email: 'test@test.com',
        operatorName: 'John Doe',
        bookingDetails: {
          id: 1,
          tourName: 'Test Tour',
          startDate: new Date(mockTour.startDate),
          endDate: new Date(mockTour.endDate),
          numberOfPeople: 2,
          totalPrice: 1000,
          currency: 'USD',
          customerName: 'test test',
          customerEmail: 'test@example.com',
          firstPersonName: 'test',
          firstPersonSurname: 'test',
          secondPersonName: 'test',
          secondPersonSurname: 'test',
          phone: '123',
        },
      });
    });

    it('should not update booking if status is not pending_payment', async () => {
      process.env.LIQPAY_PRIVATE_KEY = 'test_key';
      mockLiqPay.str_to_sign.mockReturnValue(validSignature);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockDb.query.bookings.findFirst.mockResolvedValue({
        ...mockBooking,
        status: 'confirmed',
      } as any);

      await service.handleLiqpayWebhook({
        data: validData,
        signature: validSignature,
      });

      expect(mockDb.transaction).not.toHaveBeenCalled();
    });
  });
});
