/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { BookingsService } from '@app/modules/bookings/bookings.service';
import { PaymentsService } from '@app/modules/payments/payments.service';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@app/types/authenticated.request';
import { UpdateUserInfoDto } from './dto/updateUserInfo.dto';
import { User } from './user.schema';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

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

  const mockUserService = {
    updateUser: jest.fn(),
    getById: jest.fn(),
  };

  const mockBookingsService = {
    getBookingsByUser: jest.fn(),
    getBookingByUser: jest.fn(),
  };

  const mockPaymentsService = {
    createPaymentForBooking: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: BookingsService,
          useValue: mockBookingsService,
        },
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateUser', () => {
    it('should call updateUser service method', async () => {
      const updateUserDto: UpdateUserInfoDto = { firstPersonName: 'Jane' };
      const req = { user: { id: 1 } } as AuthenticatedRequest;
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUserService.updateUser.mockResolvedValue(updatedUser);

      const result = await controller.updateUser(updateUserDto, req);
      expect(userService.updateUser).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('getMe', () => {
    it('should call getById service method', async () => {
      const req = { user: { id: 1 } } as AuthenticatedRequest;
      mockUserService.getById.mockResolvedValue(mockUser);

      const result = await controller.getMe(req);
      expect(userService.getById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });
  });
});
