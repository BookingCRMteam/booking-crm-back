import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';

describe('PaymentsController', () => {
  let controller: PaymentsController;

  const mockPaymentsService = {
    handleStripeWebhook: jest.fn(),
    handleLiqpayWebhook: jest.fn(),
  };

  beforeEach(async () => {
    mockPaymentsService.handleLiqpayWebhook.mockClear();
    mockPaymentsService.handleStripeWebhook.mockClear();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleStripeWebhook', () => {
    it('should call handleStripeWebhook service method', async () => {
      const mockReq = {
        rawBody: Buffer.from('test'),
      } as RawBodyRequest<Request>;
      const signature = 'test_signature';
      mockPaymentsService.handleStripeWebhook.mockResolvedValue(undefined);

      const result = await controller.handleStripeWebhook(mockReq, signature);

      expect(mockPaymentsService.handleStripeWebhook).toHaveBeenCalledWith(
        mockReq,
        signature,
      );
      expect(result).toEqual({ received: true });
    });

    it('should return { received: false } if no signature is provided', async () => {
      const mockReq = {
        rawBody: Buffer.from('test'),
      } as RawBodyRequest<Request>;
      const signature = undefined;

      const result = await controller.handleStripeWebhook(
        mockReq,
        signature as string,
      );

      expect(mockPaymentsService.handleStripeWebhook).not.toHaveBeenCalled();
      expect(result).toEqual({ received: false });
    });
  });

  describe('handleLiqpayWebhook', () => {
    it('should call handleLiqpayWebhook service method', async () => {
      const data = { data: 'test_data', signature: 'test_signature' };
      mockPaymentsService.handleLiqpayWebhook.mockResolvedValue(undefined);

      const result = await controller.handleLiqpayWebhook(data);

      expect(mockPaymentsService.handleLiqpayWebhook).toHaveBeenCalledWith(
        data,
      );
      expect(result).toEqual({ received: true });
    });
  });
});
