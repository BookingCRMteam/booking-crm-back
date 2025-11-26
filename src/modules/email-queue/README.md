# Email Queue Module

This module handles asynchronous email sending using BullMQ and Mailjet.

## Features

- **Asynchronous email processing** using BullMQ job queue
- **Mailjet integration** for reliable email delivery
- **Automatic retry logic** with exponential backoff
- **Booking confirmation emails** sent after successful payment

## Setup

### 1. Install Dependencies

Dependencies are already installed via the main package.json:

- `bullmq` - Job queue library
- `node-mailjet` - Mailjet SDK
- `@nestjs/bullmq` - NestJS integration for BullMQ

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
# Redis (required for BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379

# Mailjet
MAILJET_API_KEY=your_mailjet_api_key
MAILJET_API_SECRET=your_mailjet_api_secret
MAILJET_FROM_EMAIL=noreply@bookingcrm.com
MAILJET_FROM_NAME=Booking CRM
```

### 3. Get Mailjet Credentials

1. Sign up at [Mailjet](https://www.mailjet.com/)
2. Go to Account Settings → API Keys
3. Copy your API Key and Secret Key
4. Add them to your `.env` file

### 4. Ensure Redis is Running

BullMQ requires Redis to be running:

```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or install Redis locally
# Windows: https://redis.io/docs/getting-started/installation/install-redis-on-windows/
# Mac: brew install redis
# Linux: sudo apt-get install redis-server
```

## How It Works

### Flow

1. **Payment Webhook** → Booking confirmed
2. **Email Job Created** → Added to BullMQ queue
3. **Worker Processes Job** → Sends email via Mailjet
4. **Retry on Failure** → Up to 3 attempts with exponential backoff

### Components

#### EmailQueueModule

- Configures BullMQ with Redis connection
- Registers the 'email' queue
- Exports EmailQueueService for use in other modules

#### EmailQueueService

- Provides `addBookingConfirmationEmail()` method
- Adds jobs to the queue with retry configuration

#### EmailQueueProcessor

- Processes email jobs from the queue
- Integrates with Mailjet API
- Generates HTML and text email content
- Handles errors and logging

## Usage

### Sending a Booking Confirmation Email

```typescript
await this.emailQueueService.addBookingConfirmationEmail({
  email: 'customer@example.com',
  bookingDetails: {
    id: 123,
    tourName: 'Paris Adventure',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-06-10'),
    price: 1500,
    currency: 'USD',
    numberOfPeople: 2,
    firstPersonName: 'John',
    firstPersonSurname: 'Doe',
  },
});
```

## Email Template

The booking confirmation email includes:

- Personalized greeting
- Booking ID
- Tour name
- Start and end dates
- Number of people
- Total price with currency
- Responsive HTML design with styling

## Monitoring

### Check Queue Status

You can monitor the queue using BullMQ Board or by checking Redis:

```bash
# Connect to Redis CLI
redis-cli

# Check queue keys
KEYS bull:email:*

# Check job count
LLEN bull:email:wait
```

### Logs

The processor logs all email sending attempts:

- Success: `Booking confirmation email sent to {email}`
- Failure: `Failed to send booking confirmation email to {email}`

## Error Handling

- **Retry Logic**: Failed jobs are retried up to 3 times
- **Exponential Backoff**: 2 seconds initial delay, doubles on each retry
- **Error Logging**: All errors are logged with stack traces

## Testing

To test the email functionality:

1. Ensure Redis is running
2. Configure Mailjet credentials
3. Create a test booking and complete payment
4. Check logs for email sending confirmation
5. Verify email receipt in inbox

## Troubleshooting

### Emails not sending

1. **Check Redis connection**: Ensure Redis is running and accessible
2. **Verify Mailjet credentials**: Test API keys in Mailjet dashboard
3. **Check logs**: Look for error messages in application logs
4. **Verify email address**: Ensure recipient email is valid

### Jobs stuck in queue

1. **Check worker is running**: Processor should be active
2. **Check Redis**: Verify queue exists and has jobs
3. **Restart application**: Sometimes helps clear stuck jobs

## Future Enhancements

- [ ] Email templates with handlebars
- [ ] Support for multiple email types (cancellation, reminder, etc.)
- [ ] Email scheduling
- [ ] Attachment support
- [ ] Email analytics and tracking
