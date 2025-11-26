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
}
