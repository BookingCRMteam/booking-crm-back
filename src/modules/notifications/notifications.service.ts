import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  sendPaymentStatusUpdate(bookingId: number, status: string) {
    this.notificationsGateway.sendPaymentStatusUpdate(bookingId, status);
  }
}
