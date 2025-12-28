import { operators } from './operator.schema';
import { User } from '../user/user.schema';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { AuthenticatedRequest } from '@app/types/authenticated.request';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import * as schema from '@app/db/schema/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from '@app/cloudinary/cloudinary.service';
import { UserService } from '../user/user.service';
import { OperatorService } from './operator.service';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailQueueService } from '../email-queue/email-queue.service';
import { OperatorStatus } from '@app/types/operator-status';
/* eslint-disable @typescript-eslint/unbound-method */

type Operator = typeof operators.$inferSelect;

describe('OperatorService', () => {
  let service: OperatorService;
  let mockDb: DeepMockProxy<NodePgDatabase<typeof schema>>;
  let mockUserService: DeepMockProxy<UserService>;
  let mockCloudinaryService: DeepMockProxy<CloudinaryService>;
  let mockEmailQueueService: DeepMockProxy<EmailQueueService>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    sub: 'sub123',
    role: 'traveler',
    operatorId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    firstPersonName: 'Test',
    firstPersonSurname: 'User',
    secondPersonName: null,
    secondPersonSurname: null,
    phone: null,
  };

  const mockOperator: Operator = {
    id: 1,
    userId: 1,
    email: 'test@example.com',
    companyName: 'Test Company',
    description: 'Test Description',
    firstName: 'Test',
    lastName: 'User',
    phone: '1234567890',
    website: 'https://test.com',
    status: 'approved',
    philosophy: null,
    photo: null,
    rejectionReason: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockDb = mockDeep<NodePgDatabase<typeof schema>>();
    mockUserService = mockDeep<UserService>();
    mockCloudinaryService = mockDeep<CloudinaryService>();
    mockEmailQueueService = mockDeep<EmailQueueService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OperatorService,
        { provide: 'DRIZZLE_CLIENT', useValue: mockDb },
        { provide: UserService, useValue: mockUserService },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
        { provide: EmailQueueService, useValue: mockEmailQueueService },
      ],
    }).compile();

    service = module.get<OperatorService>(OperatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addOperator', () => {
    const createOperatorDto: CreateOperatorDto = {
      companyName: 'Test Company',
      description: 'Test Description',
      firstName: 'Test',
      lastName: 'User',
      phone: '1234567890',
      website: 'https://test.com',
      photo: null,
    };

    it('should throw BadRequestException if email is missing', async () => {
      const req = {
        user: { ...mockUser, email: null },
      } as AuthenticatedRequest;
      await expect(service.addOperator(createOperatorDto, req)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if user is already an operator', async () => {
      const req = { user: mockUser } as AuthenticatedRequest;
      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockOperator]),
      });
      await expect(service.addOperator(createOperatorDto, req)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should add a new operator', async () => {
      const req = { user: mockUser } as AuthenticatedRequest;
      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      });
      (mockDb.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockOperator]),
      });
      mockUserService.userToOperator.mockResolvedValue(undefined);

      const result = await service.addOperator(createOperatorDto, req);
      expect(result).toEqual(mockOperator);
      expect(mockUserService.userToOperator).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('updateOperator', () => {
    const updateOperatorDto: UpdateOperatorDto = { companyName: 'New Company' };
    const req = {
      user: { ...mockUser, operatorId: 1 },
    } as AuthenticatedRequest;

    it('should throw NotFoundException if operator not found', async () => {
      mockDb.query.operators.findFirst.mockResolvedValue(undefined);
      await expect(
        service.updateOperator(updateOperatorDto, req),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update an operator', async () => {
      const updatedOperator = { ...mockOperator, ...updateOperatorDto };
      mockDb.query.operators.findFirst.mockResolvedValue(mockOperator);
      (mockDb.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedOperator]),
      });

      const result = await service.updateOperator(updateOperatorDto, req);
      expect(result).toEqual(updatedOperator);
    });
  });

  describe('updateOperatorStatus', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw NotFoundException if operator not found', async () => {
      mockDb.query.operators.findFirst.mockResolvedValue(undefined);
      await expect(
        service.updateOperatorStatus(1, OperatorStatus.APPROVED),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if rejection reason is too short', async () => {
      mockDb.query.operators.findFirst.mockResolvedValue(mockOperator);
      await expect(
        service.updateOperatorStatus(1, OperatorStatus.REJECTED, 'Too short'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update operator status to approved and send email notification', async () => {
      const operatorWithEmail = { ...mockOperator, status: 'pending' };
      const updatedOperator = { ...operatorWithEmail, status: 'approved' };

      mockDb.query.operators.findFirst.mockResolvedValue(operatorWithEmail);
      (mockDb.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedOperator]),
      });
      mockEmailQueueService.addOperatorStatusChangeEmail.mockResolvedValue(
        undefined,
      );

      const result = await service.updateOperatorStatus(
        1,
        OperatorStatus.APPROVED,
      );

      expect(result).toEqual(updatedOperator);
      expect(
        mockEmailQueueService.addOperatorStatusChangeEmail,
      ).toHaveBeenCalledWith({
        email: operatorWithEmail.email,
        operatorName: `${operatorWithEmail.firstName} ${operatorWithEmail.lastName}`,
        status: 'approved',
        rejectionReason: undefined,
      });
      expect(
        mockEmailQueueService.addOperatorStatusChangeEmail,
      ).toHaveBeenCalledTimes(1);
    });

    it('should update operator status to rejected with reason and send email notification', async () => {
      const operatorWithEmail = { ...mockOperator, status: 'pending' };
      const rejectionReason =
        'Your application does not meet our requirements because of insufficient documentation and experience.';
      const updatedOperator = {
        ...operatorWithEmail,
        status: 'rejected',
        rejectionReason,
      };

      mockDb.query.operators.findFirst.mockResolvedValue(operatorWithEmail);
      (mockDb.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedOperator]),
      });
      mockEmailQueueService.addOperatorStatusChangeEmail.mockResolvedValue(
        undefined,
      );

      const result = await service.updateOperatorStatus(
        1,
        OperatorStatus.REJECTED,
        rejectionReason,
      );

      expect(result).toEqual(updatedOperator);
      expect(
        mockEmailQueueService.addOperatorStatusChangeEmail,
      ).toHaveBeenCalledWith({
        email: operatorWithEmail.email,
        operatorName: `${operatorWithEmail.firstName} ${operatorWithEmail.lastName}`,
        status: 'rejected',
        rejectionReason,
      });
      expect(
        mockEmailQueueService.addOperatorStatusChangeEmail,
      ).toHaveBeenCalledTimes(1);
    });

    it('should not send email notification if operator has no email', async () => {
      const operatorWithoutEmail = { ...mockOperator, email: null };
      const updatedOperator = { ...operatorWithoutEmail, status: 'approved' };

      mockDb.query.operators.findFirst.mockResolvedValue(operatorWithoutEmail);
      (mockDb.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedOperator]),
      });

      const result = await service.updateOperatorStatus(
        1,
        OperatorStatus.APPROVED,
      );

      expect(result).toEqual(updatedOperator);
      expect(
        mockEmailQueueService.addOperatorStatusChangeEmail,
      ).not.toHaveBeenCalled();
    });

    it('should update operator and send email even if status appears unchanged', async () => {
      // Note: The service doesn't check if status changed, it always sends email
      const operatorAlreadyApproved = { ...mockOperator, status: 'approved' };
      const updatedOperator = {
        ...operatorAlreadyApproved,
        status: 'approved',
      };

      mockDb.query.operators.findFirst.mockResolvedValue(
        operatorAlreadyApproved,
      );
      (mockDb.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedOperator]),
      });
      mockEmailQueueService.addOperatorStatusChangeEmail.mockResolvedValue(
        undefined,
      );

      const result = await service.updateOperatorStatus(
        1,
        OperatorStatus.APPROVED,
      );

      expect(result).toEqual(updatedOperator);
      // Email is sent regardless of whether status actually changed
      expect(
        mockEmailQueueService.addOperatorStatusChangeEmail,
      ).toHaveBeenCalledWith({
        email: operatorAlreadyApproved.email,
        operatorName: `${operatorAlreadyApproved.firstName} ${operatorAlreadyApproved.lastName}`,
        status: 'approved',
        rejectionReason: undefined,
      });
    });
  });

  describe('getOperatorById', () => {
    it('should get an operator by id', async () => {
      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockOperator]),
      });
      const result = await service.getOperatorById(1);
      expect(result).toEqual(mockOperator);
    });

    it('should throw NotFoundException if operator not found', async () => {
      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      });
      await expect(service.getOperatorById(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getMyOperator', () => {
    const req = { user: mockUser } as AuthenticatedRequest;
    it('should get my operator', async () => {
      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockOperator]),
      });
      const result = await service.getMyOperator(req);
      expect(result).toEqual(mockOperator);
    });

    it('should throw NotFoundException if not an operator', async () => {
      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      });
      await expect(service.getMyOperator(req)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllOperators', () => {
    it('should get all operators with meta', async () => {
      const operators = [mockOperator];

      (mockDb.select as jest.Mock)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockResolvedValue([{ count: 1 }]),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          offset: jest.fn().mockResolvedValue(operators),
        });

      const result = await service.getAllOperators(10, 0);

      expect(result).toEqual({
        items: operators,
        meta: {
          total: 1,
          limit: 10,
          offset: 0,
        },
      });
    });
  });

  describe('deletePhoto', () => {
    const req = { user: mockUser } as AuthenticatedRequest;

    it('should throw NotFoundException if operator not found', async () => {
      mockDb.query.operators.findFirst.mockResolvedValue(undefined);
      await expect(service.deletePhoto(req)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if no photo to delete', async () => {
      mockDb.query.operators.findFirst.mockResolvedValue(mockOperator);
      await expect(service.deletePhoto(req)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should delete a photo', async () => {
      const operatorWithPhoto = { ...mockOperator, photo: 'some_url' };
      const updatedOperator = { ...operatorWithPhoto, photo: null };
      mockDb.query.operators.findFirst.mockResolvedValue(operatorWithPhoto);
      (mockDb.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedOperator]),
      });
      const result = await service.deletePhoto(req);
      expect(result.photo).toBeNull();
    });
  });

  describe('getPopularOperators', () => {
    it('should get popular approved operators ranked by active tours and bookings', async () => {
      const popularOperators = [
        {
          ...mockOperator,
          status: 'approved',
          bookingsCount: 12,
          activeToursCount: 6,
        },
      ];

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        having: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(popularOperators),
      });

      const result = await service.getPopularOperators(4);

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('approved');
      expect(result[0].activeToursCount).toBe(6);
      expect(result[0].bookingsCount).toBe(12);
    });
  });
});
