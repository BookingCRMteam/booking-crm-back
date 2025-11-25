/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as userSchema from '@app/modules/user/user.schema';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { JWTPayload } from '@app/types/jwt.payload';
import { UpdateUserInfoDto } from './dto/updateUserInfo.dto';
import { User } from './user.schema';

describe('UserService', () => {
  let service: UserService;
  let mockDb: DeepMockProxy<NodePgDatabase<typeof userSchema>>;

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

  beforeEach(async () => {
    mockDb = mockDeep<NodePgDatabase<typeof userSchema>>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'DRIZZLE_CLIENT',
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrGetUser', () => {
    const jwtPayload: JWTPayload = {
      sub: 'auth0|12345',
      email: 'test@example.com',
      roles: [],
      iss: '',
      aud: [],
      iat: 0,
      exp: 0,
      scope: '',
      azp: '',
      permissions: [],
      given_name: '',
      family_name: '',
      nickname: '',
    };

    it('should return an existing user', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);
      const result = await service.createOrGetUser(jwtPayload);
      expect(result).toEqual(mockUser);
      expect(mockDb.query.users.findFirst).toHaveBeenCalledWith({
        where: expect.any(Function),
      });
    });

    it('should create a new user if one does not exist', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(undefined);

      (mockDb.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockUser]),
      });

      const result = await service.createOrGetUser(jwtPayload);

      expect(result).toEqual(mockUser);
      expect(mockDb.insert).toHaveBeenCalledWith(userSchema.users);
    });
  });

  describe('userToOperator', () => {
    it('should update user to operator', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);
      (mockDb.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest
          .fn()
          .mockResolvedValue([
            { ...mockUser, role: 'operator', operatorId: 1 },
          ]),
      });

      await service.userToOperator(1, 1);

      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(undefined);
      await expect(service.userToOperator(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getById', () => {
    it('should return a user by ID', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);
      const result = await service.getById(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(undefined);
      await expect(service.getById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllUsers', () => {
    it('should return a list of users', async () => {
      const users = [mockUser];
      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockResolvedValue(users),
      });
      const result = await service.getAllUsers(10, 0);
      expect(result).toEqual(users);
    });
  });

  describe('updateUser', () => {
    const updateDto: UpdateUserInfoDto = {
      firstPersonName: 'Jane',
      phone: '1234567890',
    };
    const updatedUser = { ...mockUser, ...updateDto };

    it('should update a user', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);
      (mockDb.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedUser]),
      });
      const result = await service.updateUser(1, updateDto);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(undefined);
      await expect(service.updateUser(1, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not update with empty dto', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);

      (mockDb.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockUser]),
      });

      const result = await service.updateUser(1, {});
      expect(result).toEqual(mockUser);
    });
  });
});
