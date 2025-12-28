import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface BookingConfirmationEmailData {
  email: string;
  bookingDetails: {
    id: number;
    tourName: string;
    startDate: Date;
    endDate: Date;
    price: number;
    currency: string;
    numberOfPeople: number;
    firstPersonName: string;
    firstPersonSurname: string;
  };
}

export interface OperatorEmailData {
  email: string;
  operatorName: string;
  bookingDetails: {
    id: number;
    tourName: string;
    startDate: Date;
    endDate: Date;
    numberOfPeople: number;
    totalPrice: number;
    currency: string;
    customerName: string;
    customerEmail: string;
  };
}

export interface OperatorStatusChangeEmailData {
  email: string;
  operatorName: string;
  status: string;
  rejectionReason?: string;
}

@Injectable()
export class EmailQueueService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async addBookingConfirmationEmail(data: BookingConfirmationEmailData) {
    await this.emailQueue.add('booking-confirmation', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async addOperatorNewBookingEmail(data: OperatorEmailData) {
    await this.emailQueue.add('operator-new-booking', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async addOperatorBookingPaidEmail(data: OperatorEmailData) {
    await this.emailQueue.add('operator-booking-paid', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async addOperatorStatusChangeEmail(data: OperatorStatusChangeEmailData) {
    await this.emailQueue.add('operator-status-change', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }
}
