import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingStatsDto } from './dto/booking-stats.dto';

describe('BookingsController', () => {
  let controller: BookingsController;

  const mockBookingsService = {
    createBooking: jest.fn(),
    getTourBookingStats: jest.fn(),
    getBookingWithTour: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: mockBookingsService,
        },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStats', () => {
    it('should return booking stats for a tour', async () => {
      const tourId = '1';
      const expectedStats: BookingStatsDto = {
        totalBookings: 5,
        totalPeople: 10,
      };

      mockBookingsService.getTourBookingStats.mockResolvedValue(expectedStats);

      const result = await controller.getStats(tourId);

      expect(result).toEqual(expectedStats);
      expect(mockBookingsService.getTourBookingStats).toHaveBeenCalledWith(1);
    });
  });

  describe('getBooking', () => {
    it('should return booking details', async () => {
      const tourId = '1';
      const bookingId = '1';
      const mockBooking = { id: 1, tourId: 1, tour: { id: 1 } };

      mockBookingsService.getBookingWithTour.mockResolvedValue(mockBooking);

      const result = await controller.getBooking(tourId, bookingId);

      expect(result).toEqual(mockBooking);
      expect(mockBookingsService.getBookingWithTour).toHaveBeenCalledWith(1, 1);
    });
  });
});
