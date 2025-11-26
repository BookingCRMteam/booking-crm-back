import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import Mailjet from 'node-mailjet';
import { BookingConfirmationEmailData } from './email-queue.service';

@Processor('email')
export class EmailQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailQueueProcessor.name);
  private mailjet: Mailjet;

  constructor() {
    super();
    this.mailjet = new Mailjet({
      apiKey: process.env.MAILJET_API_KEY || '',
      apiSecret: process.env.MAILJET_API_SECRET || '',
    });
  }

  async process(job: Job<BookingConfirmationEmailData>): Promise<void> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    if (job.name === 'booking-confirmation') {
      await this.sendBookingConfirmationEmail(job.data);
    }
  }

  private async sendBookingConfirmationEmail(
    data: BookingConfirmationEmailData,
  ): Promise<void> {
    const { email, bookingDetails } = data;

    try {
      const request = this.mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: process.env.MAILJET_FROM_EMAIL || 'noreply@bookingcrm.com',
              Name: process.env.MAILJET_FROM_NAME || 'Booking CRM',
            },
            To: [
              {
                Email: email,
                Name: `${bookingDetails.firstPersonName} ${bookingDetails.firstPersonSurname}`,
              },
            ],
            Subject: `Booking Confirmation - #${bookingDetails.id}`,
            TextPart: this.generateTextContent(bookingDetails),
            HTMLPart: this.generateHtmlContent(bookingDetails),
          },
        ],
      });

      await request;
      this.logger.log(`Booking confirmation email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send booking confirmation email to ${email}`,
        error instanceof Error ? error.stack : JSON.stringify(error),
      );
      throw error;
    }
  }

  private generateTextContent(
    bookingDetails: BookingConfirmationEmailData['bookingDetails'],
  ): string {
    return `
Booking Confirmation

Dear ${bookingDetails.firstPersonName} ${bookingDetails.firstPersonSurname},

Your booking has been successfully confirmed!

Booking Details:
- Booking ID: ${bookingDetails.id}
- Tour: ${bookingDetails.tourName}
- Start Date: ${new Date(bookingDetails.startDate).toLocaleDateString()}
- End Date: ${new Date(bookingDetails.endDate).toLocaleDateString()}
- Number of People: ${bookingDetails.numberOfPeople}
- Total Price: ${bookingDetails.price} ${bookingDetails.currency}

Thank you for choosing us!

Best regards,
Booking CRM Team
    `.trim();
  }

  private generateHtmlContent(
    bookingDetails: BookingConfirmationEmailData['bookingDetails'],
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #4CAF50;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #f9f9f9;
      padding: 20px;
      border: 1px solid #ddd;
      border-top: none;
    }
    .booking-details {
      background-color: white;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
    }
    .detail-row {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: bold;
      color: #555;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #777;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Booking Confirmation</h1>
  </div>
  <div class="content">
    <p>Dear ${bookingDetails.firstPersonName} ${bookingDetails.firstPersonSurname},</p>
    <p>Your booking has been successfully confirmed!</p>
    
    <div class="booking-details">
      <h2>Booking Details:</h2>
      <div class="detail-row">
        <span class="label">Booking ID:</span> ${bookingDetails.id}
      </div>
      <div class="detail-row">
        <span class="label">Tour:</span> ${bookingDetails.tourName}
      </div>
      <div class="detail-row">
        <span class="label">Start Date:</span> ${new Date(bookingDetails.startDate).toLocaleDateString()}
      </div>
      <div class="detail-row">
        <span class="label">End Date:</span> ${new Date(bookingDetails.endDate).toLocaleDateString()}
      </div>
      <div class="detail-row">
        <span class="label">Number of People:</span> ${bookingDetails.numberOfPeople}
      </div>
      <div class="detail-row">
        <span class="label">Total Price:</span> ${bookingDetails.price} ${bookingDetails.currency}
      </div>
    </div>
    
    <p>Thank you for choosing us!</p>
  </div>
  <div class="footer">
    <p>Best regards,<br>Booking CRM Team</p>
  </div>
</body>
</html>
    `.trim();
  }
}
