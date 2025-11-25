import { Test, TestingModule } from '@nestjs/testing';
import { OperatorBookingsController } from './operator-bookings.controller';
import { OperatorBookingsService } from './operator-bookings.service';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { CanActivate } from '@nestjs/common';

describe('OperatorBookingsController', () => {
  let controller: OperatorBookingsController;
  let service: OperatorBookingsService;

  const mockOperatorBookingsService = {
    getOperatorBookings: jest.fn(),
  };

  const mockJwtAuthGuard: CanActivate = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OperatorBookingsController],
      providers: [
        {
          provide: OperatorBookingsService,
          useValue: mockOperatorBookingsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<OperatorBookingsController>(
      OperatorBookingsController,
    );
    service = module.get<OperatorBookingsService>(OperatorBookingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getOperatorBookings', () => {
    it('should call getOperatorBookings on the service with the user id', async () => {
      const userId = 1;
      const req = { user: { id: userId } };
      mockOperatorBookingsService.getOperatorBookings.mockResolvedValue([]);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await controller.getOperatorBookings(req as any);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.getOperatorBookings).toHaveBeenCalledWith(userId);
    });

    it('should return an empty array if there is no user id', async () => {
      const req = {};
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await controller.getOperatorBookings(req as any);
      expect(result).toEqual([]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.getOperatorBookings).not.toHaveBeenCalled();
    });

    it('should return an empty array if there is no user', async () => {
      const req = {};
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await controller.getOperatorBookings(req as any);
      expect(result).toEqual([]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.getOperatorBookings).not.toHaveBeenCalled();
    });
  });
});
