/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  const mockPaymentsService = {
    handleLiqpayWebhook: jest.fn(),
  };

  beforeEach(async () => {
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
    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleLiqpayWebhook', () => {
    it('should call handleLiqpayWebhook service method', async () => {
      const data = { data: 'test_data', signature: 'test_signature' };
      mockPaymentsService.handleLiqpayWebhook.mockResolvedValue(undefined);

      const result = await controller.handleLiqpayWebhook(data);

      expect(service.handleLiqpayWebhook).toHaveBeenCalledWith(data);
      expect(result).toEqual({ received: true });
    });
  });
});
