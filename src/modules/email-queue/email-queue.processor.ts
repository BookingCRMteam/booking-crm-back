import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import Mailjet from 'node-mailjet';
import {
  BookingConfirmationEmailData,
  OperatorEmailData,
  OperatorStatusChangeEmailData,
} from './email-queue.service';

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

  async process(
    job: Job<
      | BookingConfirmationEmailData
      | OperatorEmailData
      | OperatorStatusChangeEmailData
    >,
  ): Promise<void> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    if (job.name === 'booking-confirmation') {
      await this.sendBookingConfirmationEmail(
        job.data as BookingConfirmationEmailData,
      );
    } else if (job.name === 'operator-new-booking') {
      await this.sendOperatorNewBookingEmail(job.data as OperatorEmailData);
    } else if (job.name === 'operator-booking-paid') {
      await this.sendOperatorBookingPaidEmail(job.data as OperatorEmailData);
    } else if (job.name === 'operator-status-change') {
      await this.sendOperatorStatusChangeEmail(
        job.data as OperatorStatusChangeEmailData,
      );
    }
  }

  private async sendOperatorNewBookingEmail(
    data: OperatorEmailData,
  ): Promise<void> {
    const { email, operatorName, bookingDetails } = data;

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
                Name: operatorName,
              },
            ],
            Subject: `New Booking Request - #${bookingDetails.id}`,
            TextPart: this.generateOperatorNewBookingText(data),
            HTMLPart: this.generateOperatorNewBookingHtml(data),
          },
        ],
      });

      await request;
      this.logger.log(
        `Operator new booking email sent to ${this.maskEmail(email)}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send operator new booking email to ${this.maskEmail(email)}`,
        error instanceof Error ? error.stack : JSON.stringify(error),
      );
      throw error;
    }
  }

  private async sendOperatorBookingPaidEmail(
    data: OperatorEmailData,
  ): Promise<void> {
    const { email, operatorName, bookingDetails } = data;

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
                Name: operatorName,
              },
            ],
            Subject: `Booking Paid - #${bookingDetails.id}`,
            TextPart: this.generateOperatorBookingPaidText(data),
            HTMLPart: this.generateOperatorBookingPaidHtml(data),
          },
        ],
      });

      await request;
      this.logger.log(
        `Operator booking paid email sent to ${this.maskEmail(email)}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send operator booking paid email to ${this.maskEmail(email)}`,
        error instanceof Error ? error.stack : JSON.stringify(error),
      );
      throw error;
    }
  }

  private async sendOperatorStatusChangeEmail(
    data: OperatorStatusChangeEmailData,
  ): Promise<void> {
    const { email, operatorName, status } = data;

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
                Name: operatorName,
              },
            ],
            Subject: `Operator Status Changed - ${status.toUpperCase()}`,
            TextPart: this.generateOperatorStatusChangeText(data),
            HTMLPart: this.generateOperatorStatusChangeHtml(data),
          },
        ],
      });

      await request;
      this.logger.log(
        `Operator status change email sent to ${this.maskEmail(email)}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send operator status change email to ${this.maskEmail(email)}`,
        error instanceof Error ? error.stack : JSON.stringify(error),
      );
      throw error;
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
      this.logger.log(
        `Booking confirmation email sent to ${this.maskEmail(email)}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send booking confirmation email to ${this.maskEmail(email)}`,
        error instanceof Error ? error.stack : JSON.stringify(error),
      );
      throw error;
    }
  }

  private maskEmail(email: string): string {
    if (!email || !email.includes('@')) {
      return email;
    }
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 1) {
      return `${localPart}***@${domain}`;
    }
    return `${localPart[0]}***@${domain}`;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private generateOperatorNewBookingText(data: OperatorEmailData): string {
    const { operatorName, bookingDetails } = data;
    return `
Dear ${operatorName},

You have a new booking request!

Booking Details:
- Booking ID: ${bookingDetails.id}
- Tour: ${bookingDetails.tourName}
- Customer: ${bookingDetails.customerName} (${bookingDetails.customerEmail})
- Start Date: ${new Date(bookingDetails.startDate).toLocaleDateString()}
- End Date: ${new Date(bookingDetails.endDate).toLocaleDateString()}
- Number of People: ${bookingDetails.numberOfPeople}
- Number of People: ${bookingDetails.numberOfPeople}
- Total Price: ${bookingDetails.totalPrice} ${bookingDetails.currency}

Customer Details:
- First Person: ${bookingDetails.firstPersonName} ${bookingDetails.firstPersonSurname}
- Second Person: ${bookingDetails.secondPersonName ? `${bookingDetails.secondPersonName} ${bookingDetails.secondPersonSurname}` : 'N/A'}
- Phone: ${bookingDetails.phone}

Please check your dashboard for more details.

Best regards,
Booking CRM Team
    `.trim();
  }

  private generateOperatorNewBookingHtml(data: OperatorEmailData): string {
    const { operatorName, bookingDetails } = data;
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Booking Request</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #4CAF50;">New Booking Request</h2>
    <p>Dear ${operatorName},</p>
    <p>You have a new booking request!</p>
    
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <h3>Booking Details:</h3>
      <p><strong>Booking ID:</strong> ${bookingDetails.id}</p>
      <p><strong>Tour:</strong> ${this.escapeHtml(bookingDetails.tourName)}</p>
      <p><strong>Customer:</strong> ${this.escapeHtml(bookingDetails.customerName)} (<a href="mailto:${this.escapeHtml(bookingDetails.customerEmail)}">${this.escapeHtml(bookingDetails.customerEmail)}</a>)</p>
      <p><strong>Start Date:</strong> ${new Date(bookingDetails.startDate).toLocaleDateString()}</p>
      <p><strong>End Date:</strong> ${new Date(bookingDetails.endDate).toLocaleDateString()}</p>
      <p><strong>Number of People:</strong> ${bookingDetails.numberOfPeople}</p>
      <p><strong>Total Price:</strong> ${bookingDetails.totalPrice} ${this.escapeHtml(bookingDetails.currency)}</p>
    </div>
    
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <h3>Customer Details:</h3>
      <p><strong>First Person:</strong> ${this.escapeHtml(bookingDetails.firstPersonName)} ${this.escapeHtml(bookingDetails.firstPersonSurname)}</p>
      <p><strong>Second Person:</strong> ${bookingDetails.secondPersonName ? `${this.escapeHtml(bookingDetails.secondPersonName)} ${this.escapeHtml(bookingDetails.secondPersonSurname || '')}` : 'N/A'}</p>
      <p><strong>Phone:</strong> ${this.escapeHtml(bookingDetails.phone)}</p>
    </div>
    
    <p>Please check your dashboard for more details.</p>
    <p>Best regards,<br>Booking CRM Team</p>
  </div>
</body>
</html>
    `.trim();
  }

  private generateOperatorBookingPaidText(data: OperatorEmailData): string {
    const { operatorName, bookingDetails } = data;
    return `
Dear ${operatorName},

A booking for your tour has been successfully paid!

Booking Details:
- Booking ID: ${bookingDetails.id}
- Tour: ${bookingDetails.tourName}
- Customer: ${bookingDetails.customerName} (${bookingDetails.customerEmail})
- Start Date: ${new Date(bookingDetails.startDate).toLocaleDateString()}
- End Date: ${new Date(bookingDetails.endDate).toLocaleDateString()}
- Number of People: ${bookingDetails.numberOfPeople}
- Number of People: ${bookingDetails.numberOfPeople}
- Total Price: ${bookingDetails.totalPrice} ${bookingDetails.currency}

Customer Details:
- First Person: ${bookingDetails.firstPersonName} ${bookingDetails.firstPersonSurname}
- Second Person: ${bookingDetails.secondPersonName ? `${bookingDetails.secondPersonName} ${bookingDetails.secondPersonSurname}` : 'N/A'}
- Phone: ${bookingDetails.phone}

The payment has been processed.

Best regards,
Booking CRM Team
    `.trim();
  }

  private generateOperatorBookingPaidHtml(data: OperatorEmailData): string {
    const { operatorName, bookingDetails } = data;
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Booking Paid</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #4CAF50;">Booking Paid Successfully</h2>
    <p>Dear ${operatorName},</p>
    <p>A booking for your tour has been successfully paid!</p>
    
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <h3>Booking Details:</h3>
      <p><strong>Booking ID:</strong> ${bookingDetails.id}</p>
      <p><strong>Tour:</strong> ${this.escapeHtml(bookingDetails.tourName)}</p>
      <p><strong>Customer:</strong> ${this.escapeHtml(bookingDetails.customerName)} (<a href="mailto:${this.escapeHtml(bookingDetails.customerEmail)}">${this.escapeHtml(bookingDetails.customerEmail)}</a>)</p>
      <p><strong>Start Date:</strong> ${new Date(bookingDetails.startDate).toLocaleDateString()}</p>
      <p><strong>End Date:</strong> ${new Date(bookingDetails.endDate).toLocaleDateString()}</p>
      <p><strong>Number of People:</strong> ${bookingDetails.numberOfPeople}</p>
      <p><strong>Total Price:</strong> ${bookingDetails.totalPrice} ${this.escapeHtml(bookingDetails.currency)}</p>
    </div>
    
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <h3>Customer Details:</h3>
      <p><strong>First Person:</strong> ${this.escapeHtml(bookingDetails.firstPersonName)} ${this.escapeHtml(bookingDetails.firstPersonSurname)}</p>
      <p><strong>Second Person:</strong> ${bookingDetails.secondPersonName ? `${this.escapeHtml(bookingDetails.secondPersonName)} ${this.escapeHtml(bookingDetails.secondPersonSurname || '')}` : 'N/A'}</p>
      <p><strong>Phone:</strong> ${this.escapeHtml(bookingDetails.phone)}</p>
    </div>
    
    <p>The payment has been processed.</p>
    <p>Best regards,<br>Booking CRM Team</p>
  </div>
</body>
</html>
    `.trim();
  }

  private generateOperatorStatusChangeText(
    data: OperatorStatusChangeEmailData,
  ): string {
    const { operatorName, status, rejectionReason } = data;
    let message = `
Dear ${operatorName},

Your operator status has been changed to ${status.toUpperCase()}.
`;

    if (status === 'rejected' && rejectionReason) {
      message += `
Reason for rejection:
${rejectionReason}
`;
    }

    message += `
Best regards,
Booking CRM Team
`;
    return message.trim();
  }

  private generateOperatorStatusChangeHtml(
    data: OperatorStatusChangeEmailData,
  ): string {
    const { operatorName, status, rejectionReason } = data;
    const safeOperatorName = this.escapeHtml(operatorName);
    let message = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Operator Status Change</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: ${status === 'approved' ? '#4CAF50' : '#F44336'};">Operator Status Updated</h2>
    <p>Dear ${safeOperatorName},</p>
    <p>Your operator status has been changed to <strong>${status.toUpperCase()}</strong>.</p>
`;

    if (status === 'rejected' && rejectionReason) {
      const safeRejectionReason = this.escapeHtml(rejectionReason);
      message += `
    <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 5px solid #F44336;">
      <h3 style="color: #D32F2F; margin-top: 0;">Reason for rejection:</h3>
      <p>${safeRejectionReason}</p>
    </div>
`;
    }

    message += `
    <p>Best regards,<br>Booking CRM Team</p>
  </div>
</body>
</html>
`;
    return message.trim();
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
- Location: ${bookingDetails.tourCity}, ${bookingDetails.tourCountry}
- Start Date: ${new Date(bookingDetails.startDate).toLocaleDateString()}
- End Date: ${new Date(bookingDetails.endDate).toLocaleDateString()}
- Number of People: ${bookingDetails.numberOfPeople}
- Total Price: ${bookingDetails.price} ${bookingDetails.currency}

Operator Details:
- Name: ${bookingDetails.operatorFirstName} ${bookingDetails.operatorLastName}
- Phone: ${bookingDetails.operatorPhone}

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
    <p>Dear ${this.escapeHtml(bookingDetails.firstPersonName)} ${this.escapeHtml(bookingDetails.firstPersonSurname)},</p>
    <p>Your booking has been successfully confirmed!</p>
    
    <div class="booking-details">
      <h2>Booking Details:</h2>
      <div class="detail-row">
        <span class="label">Booking ID:</span> ${bookingDetails.id}
      </div>
      <div class="detail-row">
        <span class="label">Tour:</span> ${this.escapeHtml(bookingDetails.tourName)}
      </div>
      <div class="detail-row">
        <span class="label">Location:</span> ${this.escapeHtml(bookingDetails.tourCity)}, ${this.escapeHtml(bookingDetails.tourCountry)}
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
        <span class="label">Total Price:</span> ${bookingDetails.price} ${this.escapeHtml(bookingDetails.currency)}
      </div>
    </div>
    
    <div class="booking-details">
      <h2>Operator Details:</h2>
      <div class="detail-row">
        <span class="label">Name:</span> ${this.escapeHtml(bookingDetails.operatorFirstName)} ${this.escapeHtml(bookingDetails.operatorLastName)}
      </div>
      <div class="detail-row">
        <span class="label">Phone:</span> ${this.escapeHtml(bookingDetails.operatorPhone)}
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
