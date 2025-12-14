/* eslint-disable @typescript-eslint/unbound-method */
import { Readable } from 'stream';
import { Test, TestingModule } from '@nestjs/testing';
import { ToursController } from './tours.controller';
import { ToursService } from './tours.service';
import { CloudinaryService } from '@app/cloudinary/cloudinary.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@app/types/authenticated.request';
import { User } from '@app/modules/user/user.schema';
import { CreateTourDto } from './dto/create-tour.dto';
import { GetToursQueryDto } from './dto/get-tours-query.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { UpdateTourPhotoDto } from './dto/update-tour-photo.dto';

describe('ToursController', () => {
  let controller: ToursController;
  let toursService: ToursService;
  let cloudinaryService: CloudinaryService;

  const mockTour = {
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
    photos: [],
  };

  const mockToursService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    checkAvailability: jest.fn(),
    updatePhoto: jest.fn(),
    deletePhoto: jest.fn(),
  };

  const mockCloudinaryService = {
    uploadImage: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    operatorId: 1,
    role: 'operator',
    email: 'test@example.com',
    sub: 'sub123',
    createdAt: new Date(),
    updatedAt: new Date(),
    firstPersonName: null,
    firstPersonSurname: null,
    secondPersonName: null,
    secondPersonSurname: null,
    phone: null,
  };

  const mockAuthenticatedRequest = {
    user: mockUser,
  } as AuthenticatedRequest;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ToursController],
      providers: [
        {
          provide: ToursService,
          useValue: mockToursService,
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ToursController>(ToursController);
    toursService = module.get<ToursService>(ToursService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkAvailability', () => {
    it('should check tour availability successfully', async () => {
      const checkAvailabilityDto = { tourId: 1, spots: 5 };
      const expectedResult = {
        tourId: 1,
        requestedSpots: 5,
        availableSpots: 10,
        isAvailable: true,
      };

      mockToursService.checkAvailability.mockResolvedValue(expectedResult);

      const result = await controller.checkAvailability(checkAvailabilityDto);

      expect(result).toEqual(expectedResult);
      expect(toursService.checkAvailability).toHaveBeenCalledWith(1, 5);
    });

    it('should return isAvailable false when not enough spots', async () => {
      const checkAvailabilityDto = { tourId: 1, spots: 15 };
      const expectedResult = {
        tourId: 1,
        requestedSpots: 15,
        availableSpots: 10,
        isAvailable: false,
      };

      mockToursService.checkAvailability.mockResolvedValue(expectedResult);

      const result = await controller.checkAvailability(checkAvailabilityDto);

      expect(result.isAvailable).toBe(false);
    });

    it('should throw NotFoundException when tour does not exist', async () => {
      const checkAvailabilityDto = { tourId: 999, spots: 5 };

      mockToursService.checkAvailability.mockRejectedValue(
        new NotFoundException('Tour with ID 999 not found.'),
      );

      await expect(
        controller.checkAvailability(checkAvailabilityDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a tour without files', async () => {
      const createTourDto: Omit<CreateTourDto, 'photo_files'> = {
        title: 'New Tour',
        description: 'Description',
        countryISO2Code: 'FR',
        cityId: 1,
        type: 'Adventure',
        price: 1000,
        currency: 'USD',
        startDate: '2025-12-01',
        endDate: '2025-12-10',
        availableSpots: 10,
        photos: [],
      };

      mockToursService.create.mockResolvedValue(mockTour);

      const result = await controller.create(
        createTourDto as CreateTourDto,
        [],
        mockAuthenticatedRequest,
      );

      expect(result).toEqual(mockTour);
      expect(toursService.create).toHaveBeenCalledWith(createTourDto, 1);
    });

    it('should create a tour with files', async () => {
      const createTourDto: Omit<CreateTourDto, 'photo_files'> = {
        title: 'New Tour',
        description: 'Description',
        countryISO2Code: 'FR',
        cityId: 1,
        type: 'Adventure',
        price: 1000,
        currency: 'USD',
        startDate: '2025-12-01',
        endDate: '2025-12-10',
        availableSpots: 10,
        photos: [{ isMain: true, description: 'Main photo' }],
      };

      const mockFiles: Express.Multer.File[] = [
        {
          fieldname: 'photo_files',
          originalname: 'test.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          size: 12345,
          buffer: Buffer.from('test'),
          stream: new Readable(),
          destination: '',
          filename: '',
          path: '',
        },
      ];

      mockCloudinaryService.uploadImage.mockResolvedValue({
        secure_url: 'https://cloudinary.com/test.jpg',
      });
      mockToursService.create.mockResolvedValue(mockTour);

      const result = await controller.create(
        createTourDto as CreateTourDto,
        mockFiles,
        mockAuthenticatedRequest,
      );

      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(
        mockFiles[0].buffer,
      );
      expect(result).toEqual(mockTour);
    });

    it('should throw BadRequestException when operator ID is missing', async () => {
      const createTourDto: Partial<CreateTourDto> = {
        title: 'New Tour',
      };

      const requestWithoutOperator = {
        user: { ...mockUser, operatorId: null },
      } as AuthenticatedRequest;

      await expect(
        controller.create(
          createTourDto as CreateTourDto,
          [],
          requestWithoutOperator,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all tours with pagination', async () => {
      const query: GetToursQueryDto = { limit: 10, offset: 0 };
      const expectedResult = {
        tours: [mockTour],
        total: 1,
        limit: 10,
        offset: 0,
      };

      mockToursService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result.data).toEqual(expectedResult.tours);
      expect(result.meta.total).toBe(1);
      expect(toursService.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter tours by country', async () => {
      const query: GetToursQueryDto = {
        countryISO2Code: 'FR',
        limit: 10,
        offset: 0,
      };
      const expectedResult = {
        tours: [mockTour],
        total: 1,
        limit: 10,
        offset: 0,
      };

      mockToursService.findAll.mockResolvedValue(expectedResult);

      await controller.findAll(query);

      expect(toursService.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter tours by isFeatured', async () => {
      const query: GetToursQueryDto = {
        isFeatured: true,
        limit: 10,
        offset: 0,
      };
      const expectedResult = {
        tours: [mockTour],
        total: 1,
        limit: 10,
        offset: 0,
      };

      mockToursService.findAll.mockResolvedValue(expectedResult);

      await controller.findAll(query);

      expect(toursService.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter tours by operatorId', async () => {
      const query: GetToursQueryDto = {
        operatorId: 1,
        limit: 10,
        offset: 0,
      };
      const expectedResult = {
        tours: [mockTour],
        total: 1,
        limit: 10,
        offset: 0,
      };

      mockToursService.findAll.mockResolvedValue(expectedResult);

      await controller.findAll(query);

      expect(toursService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single tour', async () => {
      mockToursService.findOne.mockResolvedValue(mockTour);

      const result = await controller.findOne(1);

      expect(result.data).toEqual(mockTour);
      expect(toursService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when tour does not exist', async () => {
      mockToursService.findOne.mockRejectedValue(
        new NotFoundException('Tour with ID 999 not found or is inactive.'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a tour', async () => {
      const updateTourDto: Partial<UpdateTourDto> = {
        title: 'Updated Tour',
        description: 'Updated Description',
      };

      mockToursService.update.mockResolvedValue({
        ...mockTour,
        ...updateTourDto,
      });

      const result = await controller.update(
        1,
        updateTourDto as UpdateTourDto,
        mockAuthenticatedRequest,
      );

      expect(result.data.title).toBe('Updated Tour');
      expect(toursService.update).toHaveBeenCalledWith(1, updateTourDto, 1);
    });

    it('should throw BadRequestException when operator ID is missing', async () => {
      const updateTourDto: Partial<UpdateTourDto> = { title: 'Updated Tour' };
      const requestWithoutOperator = {
        user: { ...mockUser, operatorId: null },
      } as AuthenticatedRequest;

      await expect(
        controller.update(
          1,
          updateTourDto as UpdateTourDto,
          requestWithoutOperator,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should deactivate a tour', async () => {
      mockToursService.remove.mockResolvedValue({
        message: 'Tour with ID 1 has been deactivated.',
      });

      const result = await controller.remove(1, mockAuthenticatedRequest);

      expect(result).toBe('Tour with ID 1 has been deactivated.');
      expect(toursService.remove).toHaveBeenCalledWith(1, 1);
    });

    it('should throw BadRequestException when operator ID is missing', async () => {
      const requestWithoutOperator = {
        user: { ...mockUser, operatorId: null },
      } as AuthenticatedRequest;

      await expect(
        controller.remove(1, requestWithoutOperator),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updatePhoto', () => {
    it('should update a photo', async () => {
      const updatePhotoDto: UpdateTourPhotoDto = {
        description: 'Updated photo',
      };
      const mockUpdatedPhoto = {
        id: 1,
        tourId: 1,
        url: 'https://cloudinary.com/updated.jpg',
        isMain: false,
        description: 'Updated photo',
      };

      mockToursService.updatePhoto.mockResolvedValue(mockUpdatedPhoto);

      const result = await controller.updatePhoto(
        1,
        1,
        updatePhotoDto,
        mockAuthenticatedRequest,
      );

      expect(result.data).toEqual(mockUpdatedPhoto);
      expect(toursService.updatePhoto).toHaveBeenCalledWith(
        1,
        1,
        1,
        updatePhotoDto,
        undefined,
      );
    });
  });

  describe('deletePhoto', () => {
    it('should delete a photo', async () => {
      mockToursService.deletePhoto.mockResolvedValue({
        message: 'Photo deleted successfully.',
      });

      await controller.deletePhoto(1, 1, mockAuthenticatedRequest);

      expect(toursService.deletePhoto).toHaveBeenCalledWith(1, 1, 1);
    });
  });
});
