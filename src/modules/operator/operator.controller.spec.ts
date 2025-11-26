import { operators } from './operator.schema';
import { User } from '../user/user.schema';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { AuthenticatedRequest } from '@app/types/authenticated.request';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { OperatorService } from './operator.service';
import { OperatorController } from './operator.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToClass } from 'class-transformer';
import { GetPopularOperatorsDto } from './dto/get-popular-operators.dto';
import { OperatorStatus } from '@app/types/operator-status';
/* eslint-disable @typescript-eslint/unbound-method */

type Operator = typeof operators.$inferSelect;

describe('OperatorController', () => {
  let controller: OperatorController;
  let service: OperatorService;

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

  const mockOperatorService = {
    addOperator: jest.fn(),
    updateOperator: jest.fn(),
    getMyOperator: jest.fn(),
    getAllOperators: jest.fn(),
    getPopularOperators: jest.fn(),
    getOperatorById: jest.fn(),
    deletePhoto: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OperatorController],
      providers: [
        {
          provide: OperatorService,
          useValue: mockOperatorService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<OperatorController>(OperatorController);
    service = module.get<OperatorService>(OperatorService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addOperator', () => {
    it('should call addOperator service method', async () => {
      const createOperatorDto: CreateOperatorDto = {
        companyName: 'Test Company',
        description: 'Test Description',
        firstName: 'Test',
        lastName: 'User',
        phone: '1234567890',
        website: 'https://test.com',
        photo: null,
      };
      const req = { user: mockUser } as AuthenticatedRequest;
      mockOperatorService.addOperator.mockResolvedValue(mockOperator);

      const result = await controller.addOperator(createOperatorDto, req);
      expect(service.addOperator).toHaveBeenCalledWith(createOperatorDto, req);
      expect(result).toEqual(mockOperator);
    });
  });

  describe('updateOperator', () => {
    it('should call updateOperator service method', async () => {
      const updateDto = { companyName: 'New Company' };
      const updateOperatorDto = plainToClass(UpdateOperatorDto, updateDto);
      const req = { user: mockUser } as AuthenticatedRequest;
      mockOperatorService.updateOperator.mockResolvedValue(mockOperator);

      const result = await controller.updateOperator(updateOperatorDto, req);
      expect(service.updateOperator).toHaveBeenCalledWith(
        updateOperatorDto,
        req,
        undefined,
      );
      expect(result).toEqual(mockOperator);
    });
  });

  describe('getMe', () => {
    it('should call getMyOperator service method', async () => {
      const req = { user: mockUser } as AuthenticatedRequest;
      mockOperatorService.getMyOperator.mockResolvedValue(mockOperator);

      const result = await controller.getMe(req);
      expect(service.getMyOperator).toHaveBeenCalledWith(req);
      expect(result).toEqual(mockOperator);
    });
  });

  describe('getAll', () => {
    it('should call getAllOperators service method', async () => {
      mockOperatorService.getAllOperators.mockResolvedValue([mockOperator]);
      const result = await controller.getAll(10, 0, OperatorStatus.APPROVED);
      expect(service.getAllOperators).toHaveBeenCalledWith(
        10,
        0,
        OperatorStatus.APPROVED,
      );
      expect(result).toEqual([mockOperator]);
    });
  });

  describe('getPopular', () => {
    it('should call getPopularOperators service method', async () => {
      const query: GetPopularOperatorsDto = { limit: 5 };
      mockOperatorService.getPopularOperators.mockResolvedValue([
        mockOperator,
      ] as any);
      const result = await controller.getPopular(query);
      expect(service.getPopularOperators).toHaveBeenCalledWith(5);
      expect(result).toEqual([mockOperator]);
    });
  });

  describe('getById', () => {
    it('should call getOperatorById service method', async () => {
      mockOperatorService.getOperatorById.mockResolvedValue(mockOperator);
      const result = await controller.getById(1);
      expect(service.getOperatorById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockOperator);
    });
  });

  describe('deletePhoto', () => {
    it('should call deletePhoto service method', async () => {
      const req = { user: mockUser } as AuthenticatedRequest;
      mockOperatorService.deletePhoto.mockResolvedValue(mockOperator);
      const result = await controller.deletePhoto(req);
      expect(service.deletePhoto).toHaveBeenCalledWith(req);
      expect(result).toEqual(mockOperator);
    });
  });
});
